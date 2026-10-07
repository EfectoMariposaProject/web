import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { TikTokBackgroundFetcher } from '@/core/import/tiktok-background-fetcher';
import { extractTikTokPostId } from '@/lib/tiktok/url-helper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { videoUrl, project_day_id = 'day-001', dayNumber = 1 } = body;

    if (!videoUrl || typeof videoUrl !== 'string') {
      return NextResponse.json(
        { error: 'Se requiere la URL de la publicación de TikTok (video, foto o post).' },
        { status: 400 }
      );
    }

    const { postId, resolvedUrl } = await extractTikTokPostId(videoUrl);
    if (!postId) {
      return NextResponse.json(
        { error: 'La URL no parece ser un enlace válido de publicación de TikTok (ej. video, foto o enlace corto vt.tiktok.com).' },
        { status: 400 }
      );
    }

    // Create the background job record
    const job = await prisma.importJob.create({
      data: {
        projectDayId: project_day_id,
        platform: 'TIKTOK',
        videoUrl,
        status: 'PENDING',
        progress: 0,
        totalFetched: 0,
        totalSaved: 0,
        logs: JSON.stringify([`[${new Date().toLocaleTimeString('es-MX')}] Tarea registrada en cola.`]),
      },
    });

    // Launch background worker without awaiting it (detached promise)
    const worker = new TikTokBackgroundFetcher();
    setImmediate(() => {
      worker
        .run({
          jobId: job.id,
          videoUrl,
          projectDayId: project_day_id,
          dayNumber: Number(dayNumber) || 1,
        })
        .catch((err) => {
          console.error(`Error no controlado en worker de TikTok (Job ${job.id}):`, err);
        });
    });

    return NextResponse.json({
      success: true,
      message: 'Extracción en segundo plano iniciada con éxito.',
      job: {
        id: job.id,
        status: job.status,
        projectDayId: job.projectDayId,
        videoUrl: job.videoUrl,
        progress: job.progress,
        totalFetched: job.totalFetched,
        totalSaved: job.totalSaved,
      },
    });
  } catch (error: any) {
    console.error('Error al iniciar job de TikTok:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno al programar la tarea en segundo plano.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectDayId = searchParams.get('projectDayId');
    const activeOnly = searchParams.get('active') === 'true';

    const where: any = {};
    if (projectDayId) where.projectDayId = projectDayId;
    if (activeOnly) {
      where.status = { in: ['PENDING', 'PROCESSING'] };
    }

    const jobs = await prisma.importJob.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      jobs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al consultar tareas.' },
      { status: 500 }
    );
  }
}
