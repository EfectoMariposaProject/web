import { NextRequest, NextResponse } from 'next/server';
import { StoryRepository } from '@/lib/db/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'markdown';
    const projectDayId = searchParams.get('projectDayId');

    const repo = new StoryRepository();
    const days = await repo.getAllProjectDays();

    // If a specific day is requested, export only that day; otherwise export all
    const allContributions = projectDayId
      ? await repo.getContributionsByDay(projectDayId)
      : await Promise.all(days.map((d: any) => repo.getContributionsByDay(d.id))).then(arrs =>
          (arrs as any[][]).flat()
        );

    if (format === 'json') {
      const exportPackage = {
        project: 'Efecto Mariposa Project — Novela Colaborativa de 80 Jornadas',
        exported_at: new Date().toISOString(),
        scope: projectDayId || 'todas las jornadas',
        total_days: days.length || 1,
        total_contributions: allContributions.length,
        evidence_chain: allContributions.map((c: any) => ({
          global_code: c.global_comment_code,
          daily_code: c.daily_comment_code,
          sequence: c.global_sequence_number,
          word_count: c.word_count,
          sha256_hash: c.sha256_hash,
          original_text: c.original_text,
          valid: c.is_valid,
        })),
      };

      return new NextResponse(JSON.stringify(exportPackage, null, 2), {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': 'attachment; filename="manuscript-guinness-evidence.json"',
        },
      });
    }

    // Default: Markdown manuscript export
    let markdown = `# EFECTO MARIPOSA PROJECT\n\n`;
    markdown += `*La Novela Colaborativa de 80 Jornadas asistida por Inteligencia Artificial*\n\n`;
    markdown += `---\n\n`;

    allContributions.forEach((c: any) => {
      markdown += `> **[${c.global_comment_code} | ${c.daily_comment_code}]** — *@${c.participant_id}* (${c.word_count} palabras)\n`;
      markdown += `"${c.original_text}"\n\n`;
    });

    markdown += `---\n\n*Documento certificado por SHA-256 inmutable • EMP Story Engine*\n`;

    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'attachment; filename="manuscript-efecto-mariposa.md"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al exportar manuscrito' }, { status: 500 });
  }
}
