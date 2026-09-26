import { NextRequest, NextResponse } from 'next/server';
import { StoryRepository } from '@/lib/db/repository';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const repo = new StoryRepository();
    const characters = await repo.getCharacters();
    const mysteries = await repo.getMysteries();
    const seeds = await repo.getNarrativeSeeds();

    const project = await repo.getOrCreateProject();

    // Get weekly skeleton structure (Weeks 1 to 16, Mon-Fri schedule)
    const days = await prisma.projectDay.findMany({
      orderBy: { dayNumber: 'asc' },
    });

    return NextResponse.json({
      success: true,
      project,
      characters,
      mysteries,
      seeds,
      days,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, characters: [], mysteries: [], seeds: [], days: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, name, description, status, location, title, day, weekNumber, openingText } = body;
    const repo = new StoryRepository();

    if (type === 'skeleton_week') {
      // Update opening paragraph / section for a week or day
      const dayNum = day || 1;
      const projectDay = await repo.getOrCreateDay(dayNum);
      const updated = await prisma.projectDay.update({
        where: { id: projectDay.id },
        data: {
          openingText,
          narrativeLine: openingText,
          weekNumber: weekNumber || Math.ceil(dayNum / 5),
        },
      });
      return NextResponse.json({ success: true, item: updated });
    }

    if (type === 'character') {
      const char = await repo.createCharacter({
        name,
        description,
        status: status || 'ALIVE',
        firstAppearanceDay: day || 1,
        currentLocation: location || 'Por definir',
      });
      return NextResponse.json({ success: true, item: char });
    }

    if (type === 'mystery') {
      const mystery = await repo.createMystery({
        title: title || name,
        description,
        introducedDay: day || 1,
      });
      return NextResponse.json({ success: true, item: mystery });
    }

    if (type === 'seed') {
      const seed = await repo.createNarrativeSeed({
        title: title || name,
        description,
        introducedDay: day || 1,
      });
      return NextResponse.json({ success: true, item: seed });
    }

    return NextResponse.json({ error: 'Tipo no soportado' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al guardar en Story Bible' }, { status: 500 });
  }
}
