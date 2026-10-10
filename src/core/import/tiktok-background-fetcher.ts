import { prisma } from '@/lib/db/prisma';
import { CSVImporter } from './csv-importer';
import { StoryRepository } from '@/lib/db/repository';
import { extractTikTokPostId } from '@/lib/tiktok/url-helper';

export interface TikTokBackgroundOptions {
  jobId: string;
  videoUrl: string;
  projectDayId: string;
  dayNumber: number;
}

export class TikTokBackgroundFetcher {
  private repo = new StoryRepository();
  private importer = new CSVImporter();

  public async run(options: TikTokBackgroundOptions): Promise<void> {
    const { jobId, videoUrl, projectDayId, dayNumber } = options;

    const logMessages: string[] = [];
    const addLog = async (msg: string) => {
      const entry = `[${new Date().toLocaleTimeString('es-MX')}] ${msg}`;
      logMessages.push(entry);
      console.log(`[TikTokWorker:${jobId}] ${msg}`);
      try {
        await prisma.importJob.update({
          where: { id: jobId },
          data: {
            logs: JSON.stringify(logMessages.slice(-50)),
            updatedAt: new Date(),
          },
        });
      } catch {
        // ignore logging error
      }
    };

    try {
      await prisma.importJob.update({
        where: { id: jobId },
        data: {
          status: 'PROCESSING',
          progress: 5,
          startedAt: new Date(),
        },
      });
      await addLog(`Iniciando extracción en segundo plano para: ${videoUrl}`);

      const { postId: videoId, resolvedUrl } = await extractTikTokPostId(videoUrl);
      if (resolvedUrl && resolvedUrl !== videoUrl) {
        await addLog(`URL canónica resuelta: ${resolvedUrl}`);
      }

      if (!videoId) {
        throw new Error('No se pudo extraer el ID de la publicación de TikTok (aweme_id / photo_id / item_id).');
      }

      const headers = {
        accept: 'application/json, text/plain, */*',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        referer: videoUrl,
      };

      async function getJson(url: string) {
        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error(`TikTok HTTP ${response.status}`);
        const data = await response.json();
        if (data.status_code !== 0) {
          throw new Error(`TikTok status_code ${data.status_code}: ${data.status_msg ?? ''}`);
        }
        return data;
      }

      const embedTargetUrl = videoId ? `https://www.tiktok.com/embed/v2/${videoId}` : videoUrl;
      const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(embedTargetUrl)}&screenshot=true&embed=screenshot.url`;
      let declaredTotalFromApi = 0;

      // Try fetching video oEmbed / meta for declared total comments
      try {
        const oembedRes = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`);
        if (oembedRes.ok) {
          const oembedData = await oembedRes.json();
          if (oembedData && typeof oembedData.comment_count === 'number') {
            declaredTotalFromApi = oembedData.comment_count;
          }
        }
      } catch {
        // ignore
      }

      const commentsMap = new Map<string, any>();

      // 1. Fetch top-level comments (both sort_types)
      for (const sortType of ['0', '1']) {
        let cursor = 0;
        await addLog(`Consultando comentarios principales (modo ${sortType === '0' ? 'recientes' : 'populares'})...`);

        try {
          for (let page = 0; page < 20; page++) {
            const apiUrl = new URL('https://www.tiktok.com/api/comment/list/');
            apiUrl.search = new URLSearchParams({
              aweme_id: videoId,
              count: '50',
              cursor: String(cursor),
              aid: '1988',
              app_language: 'es-MX',
              region: 'MX',
              sort_type: sortType,
            }).toString();

            const data = await getJson(apiUrl.toString());
            if (data.total && typeof data.total === 'number' && data.total > declaredTotalFromApi) {
              declaredTotalFromApi = data.total;
            }

            const comments = data.comments ?? [];

            comments.forEach((c: any) => {
              const cid = String(c.cid ?? '');
              if (cid && !commentsMap.has(cid)) {
                c._isReply = false;
                commentsMap.set(cid, c);
              }
            });

            await addLog(`Capturados ${commentsMap.size} comentarios únicos (Página ${page + 1}).`);

            const currentTopLevel = Array.from(commentsMap.values()).filter((c) => !c._isReply).length;
            await prisma.importJob.update({
              where: { id: jobId },
              data: {
                totalFetched: commentsMap.size,
                topLevelCount: currentTopLevel,
                progress: Math.min(60, Math.round((commentsMap.size / (commentsMap.size + 50)) * 60)),
              },
            });

            if (!data.has_more || data.cursor === undefined || String(data.cursor) === String(cursor)) {
              break;
            }
            cursor = data.cursor;

            // Small delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 150));
          }
        } catch (err: any) {
          await addLog(`Aviso durante paginación sort_type=${sortType}: ${err.message}`);
        }
      }

      // 2. Fetch reply sub-comments
      const topLevelComments = Array.from(commentsMap.values());
      const commentsWithReplies = topLevelComments.filter(
        (c) => Number(c.reply_comment_total ?? c.reply_count ?? 0) > 0 && c.cid
      );

      if (commentsWithReplies.length > 0) {
        await addLog(`Obteniendo respuestas de ${commentsWithReplies.length} comentarios con hilos...`);

        for (let i = 0; i < commentsWithReplies.length; i++) {
          const comment = commentsWithReplies[i];
          let replyCursor = 0;

          try {
            for (let replyPage = 0; replyPage < 10; replyPage++) {
              const replyUrl = new URL('https://www.tiktok.com/api/comment/list/reply/');
              replyUrl.search = new URLSearchParams({
                item_id: videoId,
                comment_id: String(comment.cid),
                count: '50',
                cursor: String(replyCursor),
                aid: '1988',
                app_language: 'es-MX',
                region: 'MX',
              }).toString();

              const replyData = await getJson(replyUrl.toString());
              const replyComments = replyData.comments ?? [];

              replyComments.forEach((rc: any) => {
                const rCid = String(rc.cid ?? '');
                if (rCid && !commentsMap.has(rCid)) {
                  rc._isReply = true;
                  rc._replyToCommentId = String(comment.cid);
                  commentsMap.set(rCid, rc);
                }
              });

              if (
                !replyData.has_more ||
                replyData.cursor === undefined ||
                String(replyData.cursor) === String(replyCursor)
              ) {
                break;
              }
              replyCursor = replyData.cursor;
              await new Promise((resolve) => setTimeout(resolve, 100));
            }
          } catch {
            // non-fatal reply failure
          }

          if (i % 5 === 0 || i === commentsWithReplies.length - 1) {
            const currentTopLevel = Array.from(commentsMap.values()).filter((c) => !c._isReply).length;
            const currentReplies = Array.from(commentsMap.values()).filter((c) => c._isReply).length;
            await prisma.importJob.update({
              where: { id: jobId },
              data: {
                totalFetched: commentsMap.size,
                topLevelCount: currentTopLevel,
                replyCount: currentReplies,
                progress: Math.min(85, 60 + Math.round((i / commentsWithReplies.length) * 25)),
              },
            });
          }
        }
      }

      // 3. Process and save the complete dataset with continuous sequence numbers (1 to N)
      await addLog(`Estructurando y validando ${commentsMap.size} comentarios únicos...`);

      const allFetchedComments = Array.from(commentsMap.values());
      const topLevelCount = allFetchedComments.filter((c) => !c._isReply).length;
      const replyCount = allFetchedComments.filter((c) => c._isReply).length;
      const finalDeclaredTotal = Math.max(declaredTotalFromApi, allFetchedComments.length);
      const filteredCount = Math.max(0, finalDeclaredTotal - allFetchedComments.length);

      const rawComments = allFetchedComments.map((comment) => {
        const user = comment.user ?? {};
        const timestamp = Number(comment.create_time);
        const username = String(user.unique_id ?? `user_${Date.now()}`);
        const avatarUrl =
          user.avatar_thumb?.url_list?.[0] ||
          user.avatar_medium?.url_list?.[0] ||
          user.avatar_168x168?.url_list?.[0] ||
          user.avatar_300x300?.url_list?.[0] ||
          `https://unavatar.io/tiktok/${username}`;

        return {
          platform_comment_id: String(comment.cid ?? ''),
          username,
          display_name: String(user.nickname ?? user.unique_id ?? ''),
          avatar_url: avatarUrl,
          text: String(comment.text ?? ''),
          likes: comment.digg_count ?? comment.likes ?? 0,
          replies: comment.reply_comment_total ?? comment.reply_count ?? 0,
          language: comment.comment_language ?? 'es',
          created_at: Number.isFinite(timestamp)
            ? new Date(timestamp * 1000).toISOString()
            : new Date().toISOString(),
          platform_comment_url: `https://www.tiktok.com/@${username}`,
          rawJson: JSON.stringify(comment),
          replyToCommentId: comment._replyToCommentId || undefined,
          isReply: !!comment._isReply,
        };
      });

      // Calculate starting global sequence offset from existing database records
      const maxGlobalAgg = await prisma.contribution.aggregate({
        _max: { globalSequence: true },
      });
      const startGlobalSequence = (maxGlobalAgg._max.globalSequence || 0) + 1;

      // Import into batch with consecutive sequence numbers (1 to total)
      const batchResult = await this.importer.importComments(
        rawComments,
        projectDayId,
        dayNumber,
        1,
        startGlobalSequence
      );

      await addLog(`Guardando ${batchResult.contributions.length} participaciones en la base de datos...`);

      // Save in batches of 100 for maximum stability
      const chunkSize = 100;
      let savedSoFar = 0;
      for (let i = 0; i < batchResult.contributions.length; i += chunkSize) {
        const chunkContribs = batchResult.contributions.slice(i, i + chunkSize);
        await this.repo.saveBatchContributions(
          projectDayId,
          chunkContribs,
          batchResult.participants
        );
        savedSoFar += chunkContribs.length;
        await prisma.importJob.update({
          where: { id: jobId },
          data: {
            totalSaved: savedSoFar,
            progress: Math.min(99, 85 + Math.round((savedSoFar / batchResult.contributions.length) * 14)),
          },
        });
      }

      await addLog(
        `Guardado completado: ${batchResult.contributions.length} comentarios archivados (#1 a #${batchResult.contributions.length}). ` +
          `[Principales: ${topLevelCount}, Respuestas Anidadas: ${replyCount}, Ocultos/Filtrados: ${filteredCount}]`
      );

      await prisma.importJob.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          progress: 100,
          totalDeclaredByPlatform: finalDeclaredTotal,
          totalFetched: allFetchedComments.length,
          totalSaved: batchResult.contributions.length,
          topLevelCount,
          replyCount,
          filteredCount,
          screenshotUrl,
          completedAt: new Date(),
        },
      });

      await addLog('Proceso en segundo plano finalizado exitosamente.');
    } catch (error: any) {
      console.error(`[TikTokWorker:${jobId}] Error:`, error);
      await addLog(`ERROR: ${error.message || 'Error desconocido'}`);

      await prisma.importJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          errorMessage: error.message || 'Error inesperado durante la descarga de comentarios.',
          completedAt: new Date(),
        },
      });
    }
  }
}
