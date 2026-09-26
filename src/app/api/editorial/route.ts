import { NextRequest, NextResponse } from 'next/server';
import { StoryRepository } from '@/lib/db/repository';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      contribution_id,
      editor_user_id = 'editor-superadmin',
      ai_proposal_text,
      final_adapted_text,
      essence_preserved = true,
      edition_type = 'Integración narrativa',
      justification_note,
    } = body;

    if (!contribution_id || !final_adapted_text) {
      return NextResponse.json(
        { error: 'contribution_id y final_adapted_text son obligatorios.' },
        { status: 400 }
      );
    }

    if (!essence_preserved) {
      return NextResponse.json(
        { error: 'La Regla Editorial exige preservar 100% la esencia de la contribución original.' },
        { status: 422 }
      );
    }

    const repo = new StoryRepository();
    const revision = await repo.saveEditorialRevision({
      contribution_id,
      editor_user_id,
      ai_proposal_text,
      final_adapted_text,
      essence_preserved,
      edition_type,
      justification_note,
    });

    return NextResponse.json({ success: true, message: 'Revisión editorial incorporada al manuscrito.', revision });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al guardar revisión editorial' }, { status: 500 });
  }
}
