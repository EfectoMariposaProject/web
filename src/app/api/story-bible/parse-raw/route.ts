import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { StoryRepository } from '@/lib/db/repository';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { novelTitle: inputTitle, charactersText, narrativeText, mysteriesText, rawText } = body;

    const fullRaw = rawText || '';
    const narrativeSource = narrativeText || fullRaw;

    if (!narrativeSource || typeof narrativeSource !== 'string' || !narrativeSource.trim()) {
      return NextResponse.json({ error: 'El cuerpo narrativo de la historia está vacío.' }, { status: 400 });
    }

    const repo = new StoryRepository();
    const project = await repo.getOrCreateProject();

    // 1. Extract Title
    let finalTitle = inputTitle ? inputTitle.trim() : '';
    if (!finalTitle) {
      const titleMatch = fullRaw.match(/^#\s+(.+)$/m);
      finalTitle = titleMatch ? titleMatch[1].trim() : 'LA HABITACIÓN QUE NO EXISTÍA';
    }

    await prisma.project.update({
      where: { id: project.id },
      data: {
        name: finalTitle,
        description: narrativeSource.slice(0, 1000),
      },
    });

    // 2. Extract Characters
    const charsSource = charactersText || fullRaw;
    const charRegex = /\*\*([A-ZÁÉÍÓÚÑ\s]+)(?:,\s*(\d+)\s*años)?\*\*\s*\n([^\n]+)/g;
    let match;
    const extractedChars: { name: string; age?: number; description: string }[] = [];

    while ((match = charRegex.exec(charsSource)) !== null) {
      const name = match[1].trim();
      const age = match[2] ? parseInt(match[2], 10) : undefined;
      const description = match[3].trim();
      extractedChars.push({ name, age, description });
    }

    for (let i = 0; i < extractedChars.length; i++) {
      const c = extractedChars[i];
      await repo.createCharacter({
        name: c.name,
        description: c.description,
        status: 'ALIVE',
        firstAppearanceDay: i + 1,
        currentLocation: 'Monterrey',
      });
    }

    // 3. Smart Word-Based Chunking Algorithm ON NARRATIVE TEXT ONLY (Prevents character & title spillover)
    const wordsArray = narrativeSource.split(/\s+/).filter(Boolean);
    const totalWords = wordsArray.length;

    const minWords = totalWords < 4000 ? 200 : 400;
    const maxWords = totalWords < 4000 ? 300 : 500;

    // Split text into paragraphs
    const paragraphs = narrativeSource.split(/\n\s*\n/).map((p: string) => p.trim()).filter(Boolean);

    const blocks: string[] = [];
    let currentBlockParagraphs: string[] = [];
    let currentBlockWordCount = 0;

    for (const para of paragraphs) {
      const paraWordCount = para.split(/\s+/).filter(Boolean).length;

      if (currentBlockWordCount >= minWords && (currentBlockWordCount + paraWordCount) > maxWords) {
        blocks.push(currentBlockParagraphs.join('\n\n'));
        currentBlockParagraphs = [para];
        currentBlockWordCount = paraWordCount;
      } else {
        currentBlockParagraphs.push(para);
        currentBlockWordCount += paraWordCount;
      }
    }

    if (currentBlockParagraphs.length > 0) {
      blocks.push(currentBlockParagraphs.join('\n\n'));
    }

    // Assign blocks to days (Days 1 to blocks.length, up to 80 days)
    for (let i = 0; i < blocks.length; i++) {
      const dayNum = i + 1;
      const blockContent = blocks[i];
      const pDay = await repo.getOrCreateDay(dayNum);

      await prisma.projectDay.update({
        where: { id: pDay.id },
        data: {
          openingText: blockContent,
          narrativeLine: blockContent,
          weekNumber: Math.ceil(dayNum / 5),
          editorialNotes: `Palabras: ${blockContent.split(/\s+/).filter(Boolean).length}`,
        },
      });
    }

    // 4. Extract Mysteries (Questions starting with ¿)
    const mystSource = mysteriesText || fullRaw;
    const questionRegex = /¿([^?\n]+\?)/g;
    let qMatch;
    let mCount = 1;

    while ((qMatch = questionRegex.exec(mystSource)) !== null) {
      const questionText = `¿${qMatch[1]}`;
      await repo.createMystery({
        title: questionText,
        description: `Pregunta dramática abierta extraída del manuscrito base: ${questionText}`,
        introducedDay: Math.min(mCount, 10),
        importance: 4,
      });
      mCount++;
    }

    return NextResponse.json({
      success: true,
      message: 'Manuscrito base modular procesado y asignado exitosamente al Esqueleto de 80 Días.',
      extracted: {
        title: finalTitle,
        totalWords,
        chunkRange: `${minWords}-${maxWords} palabras/bloque`,
        charactersCount: extractedChars.length,
        chaptersCount: blocks.length,
        mysteriesCount: mCount - 1,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al procesar la historia' },
      { status: 500 }
    );
  }
}
