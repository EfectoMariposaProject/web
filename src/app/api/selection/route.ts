import { NextRequest, NextResponse } from 'next/server';
import { StoryRepository } from '@/lib/db/repository';
import { SelectionService } from '@/core/selection/selection-service';
import { Contribution, Participant } from '@/types/domain.types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { project_day_id = 'day-001', targets = [15, 38, 72] } = body;

    const repo = new StoryRepository();
    const selectionService = new SelectionService();

    const dbContributions = await repo.getContributionsByDay(project_day_id);
    const contributionsMap = new Map<number, Contribution>();
    const participantsMap = new Map<string, Participant>();

    for (const c of dbContributions) {
      const domainContrib: Contribution = {
        id: c.id,
        project_id: project_day_id,
        project_day_id: c.project_day_id,
        participant_id: c.participant_id,
        social_post_id: c.social_post_id,
        platform_comment_id: c.platform_comment_id,
        capture_sequence: c.capture_sequence,
        global_sequence: c.global_sequence_number,
        daily_comment_code: c.daily_comment_code,
        global_comment_code: c.global_comment_code,
        internal_id: c.internal_id,
        original_text: c.original_text,
        normalized_text: c.normalized_text,
        word_count: c.word_count,
        original_hash: c.sha256_hash,
        age_declaration_status: 'declared_18_plus',
        terms_accepted: true,
        late_comment: false,
        status: c.status,
        validation_status: c.validation_status,
        validation_reasons: c.validation_reasons,
        selected_by_rule: false,
        received_at: c.created_at,
        created_at: c.created_at,
        updated_at: c.updated_at,
      };

      contributionsMap.set(c.daily_sequence_number, domainContrib);

      if (!participantsMap.has(c.participant_id)) {
        const p = await repo.getParticipantById(c.participant_id);
        if (p) {
          participantsMap.set(p.id, {
            id: p.id,
            platform: 'TIKTOK' as any,
            platform_user_id: p.platformUserId,
            username: p.username,
            display_name: p.displayName || undefined,
            selected_count: p.selectedCount,
            is_blocked: p.isBlocked,
            declared_18_plus: p.declared18Plus,
            terms_accepted: p.termsAccepted,
            created_at: p.createdAt.toISOString(),
            updated_at: p.updatedAt.toISOString(),
          });
        }
      }
    }

    const results = targets.map((targetSeq: number, idx: number) => {
      const slotNum = idx + 1;
      return selectionService.resolveSlotSelection(
        slotNum,
        targetSeq,
        contributionsMap,
        participantsMap,
        project_day_id,
        contributionsMap.size || 100
      );
    });

    return NextResponse.json({ success: true, project_day_id, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al ejecutar motor de selección' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const project_day_id = searchParams.get('projectDayId') || 'day-001';
    const target1 = Number(searchParams.get('target1')) || 15;
    const target2 = Number(searchParams.get('target2')) || 38;
    const target3 = Number(searchParams.get('target3')) || 72;
    const targets = [target1, target2, target3];

    const repo = new StoryRepository();
    const selectionService = new SelectionService();

    const dbContributions = await repo.getContributionsByDay(project_day_id);
    const contributionsMap = new Map<number, Contribution>();
    const participantsMap = new Map<string, Participant>();

    for (const c of dbContributions) {
      const domainContrib: Contribution = {
        id: c.id,
        project_id: project_day_id,
        project_day_id: c.project_day_id,
        participant_id: c.participant_id,
        social_post_id: c.social_post_id,
        platform_comment_id: c.platform_comment_id,
        capture_sequence: c.capture_sequence,
        global_sequence: c.global_sequence_number,
        daily_comment_code: c.daily_comment_code,
        global_comment_code: c.global_comment_code,
        internal_id: c.internal_id,
        original_text: c.original_text,
        normalized_text: c.normalized_text,
        word_count: c.word_count,
        original_hash: c.sha256_hash,
        age_declaration_status: 'declared_18_plus',
        terms_accepted: true,
        late_comment: false,
        status: c.status,
        validation_status: c.validation_status,
        validation_reasons: c.validation_reasons,
        selected_by_rule: false,
        received_at: c.created_at,
        created_at: c.created_at,
        updated_at: c.updated_at,
        author_name: c.author_name,
        author_handle: c.author_handle,
        avatar_url: c.avatar_url,
        profile_url: c.profile_url,
      } as any;

      contributionsMap.set(c.daily_sequence_number, domainContrib);
    }

    const results = targets.map((targetSeq: number, idx: number) => {
      const slotNum = idx + 1;
      return selectionService.resolveSlotSelection(
        slotNum,
        targetSeq,
        contributionsMap,
        participantsMap,
        project_day_id,
        contributionsMap.size || 100
      );
    });

    return NextResponse.json({ success: true, project_day_id, results });
  } catch (error: any) {
    return NextResponse.json({ success: false, results: [] });
  }
}
