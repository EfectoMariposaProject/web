import { describe, it, expect } from 'vitest';
import { ContributionValidator } from '@/core/validation/contribution-validator';
import { SelectionService } from '@/core/selection/selection-service';
import { formatGlobalCommentCode, formatDailyCommentCode, generateSHA256 } from '@/core/audit/hasher';
import { Contribution, Participant, SocialPost } from '@/types/domain.types';
import { ContributionStatus, SocialPostStatus, Platform } from '@/types/enums';

describe('MVP Core Flow: 4 Hard Rules & Range Validation (69 - 96 words)', () => {
  const generateDistinctWords = (count: number) => {
    const words = [];
    for (let i = 1; i <= count; i++) words.push(`palabra${i}`);
    return words.join(' ') + '.';
  };

  it('should format Dual IDs (Global: EMP-COM-000001 & Daily: D01-C0001)', () => {
    expect(formatGlobalCommentCode(1)).toBe('EMP-COM-000001');
    expect(formatGlobalCommentCode(15)).toBe('EMP-COM-000015');
    expect(formatDailyCommentCode(1, 1)).toBe('D01-C0001');
    expect(formatDailyCommentCode(1, 157)).toBe('D01-C0157');
  });

  it('should invalidate comments if user mentions being under 18 (Hard Rule 1)', () => {
    const validator = new ContributionValidator(69, 96, 3);
    const minorText = 'Tengo 16 años y ' + generateDistinctWords(70);
    const result = validator.validate(minorText);
    expect(result.valid).toBe(false);
    expect(result.declared18Plus).toBe(false);
    expect(result.reasons).toContain('Declaración de mayoría de edad no válida (menor de 18 años)');
  });

  it('should invalidate comments if received on a closed publication (Hard Rule 4)', () => {
    const validator = new ContributionValidator(69, 96, 3);
    const closedPost: SocialPost = {
      id: 'post-01',
      project_day_id: 'day-001',
      challenge_day: 1,
      platform: Platform.TIKTOK,
      status: SocialPostStatus.CERRADO,
      opens_at: '2026-09-20T08:00:00Z',
      closes_at: '2026-09-20T23:59:00Z',
      created_at: new Date().toISOString(),
    };

    const validRangeText = generateDistinctWords(75);
    const result = validator.validate(validRangeText, undefined, closedPost);
    expect(result.valid).toBe(false);
    expect(result.withinActiveWindow).toBe(false);
    expect(result.reasons).toContain('Comentario fuera de ventana activa (publicación cerrada)');
  });

  it('should execute full scenario 55: target 38 invalid (too short) -> jump +3 to sequence 41 (75 words)', () => {
    const validator = new ContributionValidator(69, 96, 3);
    const selectionService = new SelectionService();

    const dayNumber = 1;
    const projectDayId = 'day-001';

    const activePost: SocialPost = {
      id: 'post-01',
      project_day_id: projectDayId,
      challenge_day: 1,
      platform: Platform.TIKTOK,
      status: SocialPostStatus.ABIERTO,
      opens_at: '2026-09-20T08:00:00Z',
      closes_at: '2026-09-20T23:59:00Z',
      created_at: new Date().toISOString(),
    };

    const valid75Text = generateDistinctWords(75);
    const short30Text = generateDistinctWords(30);

    const contributionsMap = new Map<number, Contribution>();
    const participantsMap = new Map<string, Participant>();

    for (let seq = 1; seq <= 100; seq++) {
      const participantId = `part-${(seq % 10) + 1}`;

      if (!participantsMap.has(participantId)) {
        participantsMap.set(participantId, {
          id: participantId,
          platform: Platform.TIKTOK,
          platform_user_id: `user_${seq}`,
          username: `autor_${seq}`,
          selected_count: 0,
          is_blocked: false,
          declared_18_plus: true,
          terms_accepted: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      let text = valid75Text;
      if (seq === 38) {
        text = short30Text;
      }

      const participant = participantsMap.get(participantId)!;
      const valResult = validator.validate(text, participant, activePost);

      const globalCode = formatGlobalCommentCode(seq);
      const dailyCode = formatDailyCommentCode(dayNumber, seq);
      const hash = generateSHA256(text);

      const contribution: Contribution = {
        id: `contrib-${seq}`,
        project_id: 'proj-001',
        project_day_id: projectDayId,
        social_post_id: activePost.id,
        global_comment_code: globalCode,
        daily_comment_code: dailyCode,
        internal_id: dailyCode,
        participant_id: participantId,
        original_text: text,
        original_hash: hash,
        normalized_text: text,
        word_count: valResult.wordCount,
        capture_sequence: seq,
        global_sequence: seq,
        received_at: new Date().toISOString(),
        age_declaration_status: valResult.declared18Plus ? 'declared_18_plus' : 'invalid_age_detected',
        terms_accepted: true,
        late_comment: !valResult.withinActiveWindow,
        status: valResult.valid ? ContributionStatus.VALID : ContributionStatus.INVALID,
        validation_status: valResult.valid ? 'VALID' : 'INVALID',
        validation_reasons: valResult.reasons,
        selected_by_rule: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      contributionsMap.set(seq, contribution);
    }

    const slot2Result = selectionService.resolveSlotSelection(
      2,
      38,
      contributionsMap,
      participantsMap,
      projectDayId,
      100
    );

    expect(slot2Result.replacementApplied).toBe(true);
    expect(slot2Result.selectedContribution.capture_sequence).toBe(41);
    expect(slot2Result.selectedContribution.daily_comment_code).toBe('D01-C0041');
  });
});
