import { NextRequest, NextResponse } from 'next/server';
import { CSVImporter } from '@/core/import/csv-importer';
import { StoryRepository } from '@/lib/db/repository';
import { extractTikTokPostId } from '@/lib/tiktok/url-helper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { videoUrl, project_day_id = 'day-001', dayNumber = 1 } = body;

    if (!videoUrl) {
      return NextResponse.json({ error: 'Se requiere la URL de la publicación de TikTok (videoUrl).' }, { status: 400 });
    }

    const { postId: videoId } = await extractTikTokPostId(videoUrl);

    if (!videoId) {
      return NextResponse.json({ error: 'No se pudo extraer el ID de la publicación de TikTok (aweme_id / photo_id / item_id).' }, { status: 400 });
    }

    const headers = {
      accept: 'application/json, text/plain, */*',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      referer: videoUrl,
    };

    async function getJson(url: string) {
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error(`TikTok HTTP ${response.status}: ${url}`);
      const data = await response.json();
      if (data.status_code !== 0) {
        throw new Error(`TikTok status_code ${data.status_code}: ${data.status_msg ?? ''}`);
      }
      return data;
    }

    // 1. Fetch top-level comments using multiple sort_types ('0' for default/newest, '1' for popular)
    const commentsMap = new Map<string, any>();

    for (const sortType of ['0', '1']) {
      let cursor = 0;
      try {
        for (let page = 0; page < 10; page++) {
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
          const comments = data.comments ?? [];
          comments.forEach((c: any) => {
            const cid = String(c.cid ?? '');
            if (cid && !commentsMap.has(cid)) {
              commentsMap.set(cid, c);
            }
          });

          if (!data.has_more || data.cursor === undefined || String(data.cursor) === String(cursor)) break;
          cursor = data.cursor;
        }
      } catch (err: any) {
        console.warn(`Advertencia en fetch TikTok sort_type=${sortType}:`, err.message);
      }
    }

    const topLevelComments = Array.from(commentsMap.values());

    // 2. Fetch reply sub-comments for top-level comments that have replies
    for (const comment of topLevelComments) {
      const replyTotal = Number(comment.reply_comment_total ?? comment.reply_count ?? 0);
      if (replyTotal > 0 && comment.cid) {
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
                commentsMap.set(rCid, rc);
              }
            });

            if (!replyData.has_more || replyData.cursor === undefined || String(replyData.cursor) === String(replyCursor)) break;
            replyCursor = replyData.cursor;
          }
        } catch (replyErr: any) {
          console.warn(`Advertencia al obtener respuestas para comentario ${comment.cid}:`, replyErr.message);
        }
      }
    }

    const allFetchedComments = Array.from(commentsMap.values());

    const rawComments = allFetchedComments.map((comment) => {
      const user = comment.user ?? {};
      const timestamp = Number(comment.create_time);
      const username = String(user.unique_id ?? `user_${Date.now()}`);
      const avatarUrl = user.avatar_thumb?.url_list?.[0] || user.avatar_medium?.url_list?.[0] || user.avatar_168x168?.url_list?.[0] || user.avatar_300x300?.url_list?.[0] || `https://unavatar.io/tiktok/${username}`;

      return {
        platform_comment_id: String(comment.cid ?? ''),
        username,
        display_name: String(user.nickname ?? user.unique_id ?? ''),
        avatar_url: avatarUrl,
        text: String(comment.text ?? ''),
        likes: comment.digg_count ?? comment.likes ?? 0,
        replies: comment.reply_comment_total ?? comment.reply_count ?? 0,
        language: comment.comment_language ?? 'es',
        created_at: Number.isFinite(timestamp) ? new Date(timestamp * 1000).toISOString() : new Date().toISOString(),
        platform_comment_url: `https://www.tiktok.com/@${username}`,
      };
    });

    // Import into Prisma repository if comments fetched
    const importer = new CSVImporter();
    const batchResult = await importer.importComments(
      rawComments,
      project_day_id,
      dayNumber,
      1,
      1
    );

    const repo = new StoryRepository();
    try {
      await repo.saveBatchContributions(project_day_id, batchResult.contributions, batchResult.participants);
    } catch (dbErr: any) {
      console.warn('Advertencia al guardar lote en base de datos:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      videoId,
      totalFetched: allFetchedComments.length,
      importedBatch: batchResult,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al extraer comentarios de TikTok' }, { status: 500 });
  }
}
