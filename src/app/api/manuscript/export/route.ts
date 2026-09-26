import { NextRequest, NextResponse } from 'next/server';
import { StoryRepository } from '@/lib/db/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'markdown';

    const repo = new StoryRepository();
    const days = await repo.getAllProjectDays();
    const allContributions = await repo.getContributionsByDay('day-001');

    if (format === 'json') {
      const exportPackage = {
        project: 'Efecto Mariposa Project - Novela Colaborativa de 365 Días',
        exported_at: new Date().toISOString(),
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
    markdown += `*La Novela Colaborativa de 365 Días asistida por Inteligencia Artificial*\n\n`;
    markdown += `---\n\n`;
    markdown += `## CAPÍTULO 1: LA CASONA DE COYOACÁN\n\n`;
    markdown += `La mansión de los Méndez permanecía en silencio bajo la penumbra del atardecer. Tras quince años de ausencia, Laura cruzó nuevamente el umbral de la casona familiar con una mochila al hombro y una sola certeza: la verdad sobre la muerte de su abuelo aún estaba encerrada entre aquellas cuatro paredes.\n\n`;

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
