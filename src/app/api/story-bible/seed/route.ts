import { NextRequest, NextResponse } from 'next/server';
import { StoryRepository } from '@/lib/db/repository';

export async function POST(req: NextRequest) {
  try {
    const repo = new StoryRepository();
    const result = await repo.seedNovelLaboratory();
    return NextResponse.json({
      success: true,
      message: 'Proyecto Laboratorio "LA HABITACIÓN QUE NO EXISTÍA" cargado exitosamente en SQLite.',
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al sembrar la novela de laboratorio' },
      { status: 500 }
    );
  }
}
