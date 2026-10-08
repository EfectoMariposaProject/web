import { NextRequest, NextResponse } from 'next/server';
import { StoryRepository } from '@/lib/db/repository';
import { ContributionValidator } from '@/core/validation/contribution-validator';
import { generateSHA256, formatGlobalCommentCode, formatDailyCommentCode } from '@/core/audit/hasher';
import { Participant } from '@/types/domain.types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { comments, contributions, participants, project_day_id = 'day-001', challenge_day = 1, post_id = 'EMP-POST-0001' } = body;
    const repo = new StoryRepository();

    if (Array.isArray(contributions) && Array.isArray(participants)) {
      await repo.saveBatchContributions(project_day_id, contributions, participants);
      return NextResponse.json({ success: true, processed: contributions.length });
    }

    if (!Array.isArray(comments)) {
      return NextResponse.json({ error: 'Formato inválido. "comments", o bien "contributions" y "participants", deben ser proporcionados.' }, { status: 400 });
    }

    const validator = new ContributionValidator();
    const results = [];

    let seqCounter = 1;
    for (const item of comments) {
      const { platform_comment_id, username, text, declared_18_plus = true } = item;

      let dbParticipant = await repo.getParticipantByUsername(username);
      if (!dbParticipant) {
        dbParticipant = await repo.createParticipant({
          platform: 'TIKTOK' as any,
          platform_user_id: username,
          username,
          declared_18_plus,
          terms_accepted: true,
        });
      }

      const domainParticipant: Participant = {
        id: dbParticipant.id,
        platform: 'TIKTOK' as any,
        platform_user_id: dbParticipant.platformUserId,
        username: dbParticipant.username,
        display_name: dbParticipant.displayName || undefined,
        selected_count: dbParticipant.selectedCount,
        is_blocked: dbParticipant.isBlocked,
        declared_18_plus: dbParticipant.declared18Plus,
        terms_accepted: dbParticipant.termsAccepted,
        created_at: dbParticipant.createdAt.toISOString(),
        updated_at: dbParticipant.updatedAt.toISOString(),
      };

      const validation = validator.validate(text, domainParticipant);

      const globalCode = formatGlobalCommentCode(seqCounter);
      const dailyCode = formatDailyCommentCode(challenge_day, seqCounter);
      const contentHash = generateSHA256(text);

      const contribution = await repo.createContribution({
        project_day_id,
        participant_id: domainParticipant.id,
        social_post_id: post_id,
        platform_comment_id: platform_comment_id || `comment-${seqCounter}`,
        global_sequence_number: seqCounter,
        daily_sequence_number: seqCounter,
        global_comment_code: globalCode,
        daily_comment_code: dailyCode,
        original_text: text,
        word_count: validation.wordCount,
        is_valid: validation.valid,
        invalidation_reason: validation.reasons.join('; ') || null,
        sha256_hash: contentHash,
      });

      results.push({ contribution, validation });
      seqCounter++;
    }

    return NextResponse.json({ success: true, processed: results.length, data: results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al procesar contribuciones' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const project_day_id = searchParams.get('projectDayId') || 'day-001';
    const isSummary = searchParams.get('summary') === 'true';
    const repo = new StoryRepository();

    if (isSummary) {
      const summary = await repo.getContributionsSummaryByDay(project_day_id);
      return NextResponse.json({ success: true, summary });
    }

    const list = await repo.getContributionsByDay(project_day_id);
    const participants = await repo.getAllParticipants();
    return NextResponse.json({ success: true, contributions: list, participants });
  } catch (error: any) {
    return NextResponse.json({ success: false, contributions: [], participants: [], error: error.message });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectDayId = searchParams.get('projectDayId');
    const { prisma } = await import('@/lib/db/prisma');

    if (projectDayId) {
      await prisma.selectionAuditLog.deleteMany({ where: { projectDayId } });
      await prisma.dailySelectionRule.deleteMany({ where: { projectDayId } });
      await prisma.contribution.deleteMany({ where: { projectDayId } });
      await prisma.importJob.deleteMany({ where: { projectDayId } });
      await prisma.socialPost.deleteMany({ where: { projectDayId } });
      return NextResponse.json({ success: true, message: `Jornada ${projectDayId} reseteada exitosamente.` });
    }

    await prisma.selectionAuditLog.deleteMany();
    await prisma.dailySelectionRule.deleteMany();
    await prisma.contribution.deleteMany();
    await prisma.importJob.deleteMany();
    await prisma.socialPost.deleteMany();
    await prisma.participant.deleteMany();

    return NextResponse.json({ success: true, message: 'Todas las jornadas y datos de escaneo reseteados completamente.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


