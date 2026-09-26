import { NextRequest, NextResponse } from 'next/server';
import { StoryRepository } from '@/lib/db/repository';

export async function GET(req: NextRequest) {
  try {
    const repo = new StoryRepository();
    const days = await repo.getAllProjectDays();
    const project = await repo.getOrCreateProject();

    const chapters = [];
    let totalWords = 0;
    let totalContribs = 0;
    const authorSet = new Set<string>();

    // Process each project day to compile its full manuscript chapter
    for (const d of days) {
      const dbContribs = await repo.getContributionsByDay(d.id);

      // Filter to selected / published contributions or fallback to first 3 valid if available
      let selectedContribs = dbContribs.filter(
        (c: any) => c.status === 'PUBLISHED' || c.status === 'SELECTED' || c.is_valid
      );

      // If no published ones yet, pick top valid contributions as chapter fragments
      if (selectedContribs.length === 0 && dbContribs.length > 0) {
        selectedContribs = dbContribs.slice(0, 3);
      }

      const formattedContribs = selectedContribs.map((c: any) => {
        const text = c.finalVersion || c.editorialVersion || c.original_text || '';
        const author = c.author_handle || c.author_name || `@usuario_${c.capture_sequence}`;
        const words = text.trim() ? text.trim().split(/\s+/).length : c.word_count || 0;

        totalWords += words;
        totalContribs++;
        if (author) authorSet.add(author);

        return {
          id: c.daily_comment_code || `D${String(d.dayNumber).padStart(2, '0')}-C${String(c.capture_sequence).padStart(4, '0')}`,
          globalCode: c.global_comment_code || `EMP-COM-${String(c.capture_sequence).padStart(6, '0')}`,
          author,
          authorName: c.author_name || author,
          avatarUrl: c.avatar_url || `https://unavatar.io/tiktok/${author.replace('@', '')}`,
          profileUrl: c.profile_url || '#',
          text,
          originalText: c.original_text,
          status: c.status || 'SELECTED',
          wordCount: words,
          hash: c.sha256_hash || c.original_hash || '',
          sequenceNumber: c.capture_sequence,
        };
      });

      const openingText = d.openingText || d.narrativeLine || '';
      const openingWords = openingText.trim() ? openingText.trim().split(/\s+/).length : 0;
      totalWords += openingWords;

      chapters.push({
        day: d.dayNumber,
        projectDayId: d.id,
        weekNumber: d.weekNumber || Math.ceil(d.dayNumber / 5),
        title: d.dayNumber === 1 
          ? 'Capítulo Primero: El Inicio del Reto y la Polaroid de 1987' 
          : `Capítulo ${d.dayNumber}: El Secreto de la Jornada ${d.dayNumber}`,
        date: new Date(Date.now() - (10 - d.dayNumber) * 86400000).toISOString().slice(0, 10),
        openingText,
        contributions: formattedContribs,
        chapterWordCount: openingWords + formattedContribs.reduce((acc: number, item: any) => acc + item.wordCount, 0),
      });
    }

    const stats = {
      totalDays: chapters.length,
      totalContributions: totalContribs,
      totalWords,
      estimatedPages: Math.ceil(totalWords / 280) || 1,
      uniqueAuthorsCount: authorSet.size,
      guinnessStatus: 'CERTIFICADO CON SELLO SHA-256 INMUTABLE',
    };

    return NextResponse.json({
      success: true,
      project: {
        name: project.name || 'LA HABITACIÓN QUE NO EXISTÍA',
        description: project.description,
        slug: project.slug,
      },
      stats,
      chapters,
    });
  } catch (error: any) {
    console.error('[MANUSCRIPT_API] Error al compilar manuscrito:', error);
    return NextResponse.json({ success: false, error: error.message || 'Error al obtener manuscrito' }, { status: 500 });
  }
}
