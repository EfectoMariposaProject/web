import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const job = await prisma.importJob.findUnique({
      where: { id },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'No se encontró la tarea especificada.' },
        { status: 404 }
      );
    }

    let parsedLogs: string[] = [];
    if (job.logs) {
      try {
        parsedLogs = JSON.parse(job.logs);
      } catch {
        parsedLogs = [job.logs];
      }
    }

    return NextResponse.json({
      success: true,
      job: {
        ...job,
        parsedLogs,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener estado de la tarea.' },
      { status: 500 }
    );
  }
}
