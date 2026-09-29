import { CommentImporter, RawImportedComment, ImportBatchResult } from './importer.interface';
import { ContributionValidator } from '../validation/contribution-validator';
import { generateSHA256, formatGlobalCommentCode, formatDailyCommentCode } from '../audit/hasher';
import { Contribution, Participant, SocialPost } from '@/types/domain.types';
import { DetailedContributionStatus, Platform } from '@/types/enums';

export class CSVImporter implements CommentImporter {
  private validator: ContributionValidator;

  constructor(validator?: ContributionValidator) {
    this.validator = validator || new ContributionValidator();
  }

  public parseCSVString(csvText: string): RawImportedComment[] {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [];

    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes('username') || firstLine.includes('text') || firstLine.includes('author');

    const colIndices = {
      platform_comment_id: -1,
      author: -1,
      username: -1,
      text: -1,
      likes: -1,
      replies: -1,
      created_at: -1,
      language: -1,
    };

    if (hasHeader) {
      const headerFields = lines[0].split(',').map((h) => h.replace(/"/g, '').trim().toLowerCase());
      colIndices.author = headerFields.indexOf('author');
      colIndices.username = headerFields.indexOf('username');
      colIndices.text = headerFields.indexOf('text');
      colIndices.likes = headerFields.indexOf('likes');
      colIndices.replies = headerFields.indexOf('replies');
      colIndices.created_at = headerFields.indexOf('created_at');
      colIndices.language = headerFields.indexOf('language');
      colIndices.platform_comment_id = headerFields.indexOf('platform_comment_id');
    }

    const dataLines = hasHeader ? lines.slice(1) : lines;
    const results: RawImportedComment[] = [];

    for (const line of dataLines) {
      const fields = line.match(/(?:^|,)(?:"([^"]*)"|([^,]*))/g);
      if (!fields) continue;

      const cleanFields = fields.map((f) => f.replace(/^,/, '').replace(/^"/, '').replace(/"$/, '').trim());

      let username = '';
      let text = '';
      let created_at = new Date().toISOString();
      let platform_comment_id: string | undefined = undefined;
      let display_name: string | undefined = undefined;
      let likes: string | number = 0;
      let replies: string | number = 0;
      let language: string = 'es';

      if (hasHeader && colIndices.text >= 0) {
        text = cleanFields[colIndices.text] || '';
        username = cleanFields[colIndices.username >= 0 ? colIndices.username : 1] || `user_${Date.now()}`;
        created_at = cleanFields[colIndices.created_at >= 0 ? colIndices.created_at : 3] || new Date().toISOString();
        if (colIndices.author >= 0 && cleanFields[colIndices.author]) {
          display_name = cleanFields[colIndices.author];
        }
        if (colIndices.likes >= 0 && cleanFields[colIndices.likes]) {
          likes = cleanFields[colIndices.likes];
        }
        if (colIndices.replies >= 0 && cleanFields[colIndices.replies]) {
          replies = cleanFields[colIndices.replies];
        }
        if (colIndices.language >= 0 && cleanFields[colIndices.language]) {
          language = cleanFields[colIndices.language];
        }
        if (colIndices.platform_comment_id >= 0 && cleanFields[colIndices.platform_comment_id]) {
          platform_comment_id = cleanFields[colIndices.platform_comment_id];
        }
      } else {
        // Fallback positional indexing
        platform_comment_id = cleanFields[0] || undefined;
        username = cleanFields[1] || `anonymous_${Date.now()}`;
        text = cleanFields[2] || '';
        created_at = cleanFields[3] || new Date().toISOString();
      }

      if (text) {
        results.push({
          platform_comment_id,
          username: username.replace(/^@/, ''),
          display_name,
          text,
          likes,
          replies,
          language,
          created_at,
        });
      }
    }

    return results;
  }


  public async importComments(
    rawComments: RawImportedComment[],
    projectDayId: string,
    dayNumber: number,
    startSequence = 1,
    startGlobalSequence = 1,
    socialPost?: SocialPost
  ): Promise<ImportBatchResult> {
    const contributions: Contribution[] = [];
    const participantsMap = new Map<string, Participant>();

    let currentDailySeq = startSequence;
    let currentGlobalSeq = startGlobalSequence;
    let validCount = 0;
    let invalidCount = 0;
    // Always sort comments chronologically ASCENDING (from oldest to newest)
    const sortedRawComments = [...rawComments].sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeA - timeB;
    });

    for (const raw of sortedRawComments) {
      const usernameKey = raw.username.toLowerCase();

      const userAvatar = raw.avatar_url || `https://unavatar.io/tiktok/${raw.username}`;
      const userProfileUrl = raw.platform_comment_url || `https://www.tiktok.com/@${raw.username}`;

      let participant = participantsMap.get(usernameKey);
      if (!participant) {
        participant = {
          id: `part_${usernameKey}`,
          platform: Platform.TIKTOK,
          platform_user_id: usernameKey,
          username: raw.username,
          display_name: raw.display_name || `@${raw.username}`,
          avatar_url: userAvatar,
          profile_url: userProfileUrl,
          selected_count: 0,
          is_blocked: false,
          declared_18_plus: true, // Default declared 18+
          terms_accepted: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        participantsMap.set(usernameKey, participant);
      }

      const valResult = this.validator.validate(raw.text, participant, socialPost, raw.created_at);

      // Hard Rule 2: Dual Consecutive IDs
      const globalCommentCode = formatGlobalCommentCode(currentGlobalSeq);
      const dailyCommentCode = formatDailyCommentCode(dayNumber, currentDailySeq);
      const originalHash = generateSHA256(raw.text);

      if (valResult.valid) {
        validCount++;
      } else {
        invalidCount++;
      }

      const contribution: Contribution = {
        id: `contrib_${projectDayId}_${currentDailySeq}`,
        project_id: projectDayId,
        project_day_id: projectDayId,
        social_post_id: socialPost?.id,
        global_comment_code: globalCommentCode,
        daily_comment_code: dailyCommentCode,
        internal_id: dailyCommentCode,
        participant_id: participant.id,
        author_handle: raw.username || participant.username,
        author_name: raw.display_name || raw.username,
        author_avatar_url: userAvatar,
        author_profile_url: userProfileUrl,
        likes: raw.likes ?? 0,
        replies: raw.replies ?? 0,
        language: raw.language || 'es',
        platform_comment_id: raw.platform_comment_id,
        platform_comment_url: userProfileUrl,
        original_text: raw.text,
        original_hash: originalHash,
        normalized_text: raw.text.trim(),
        word_count: valResult.wordCount,
        capture_sequence: currentDailySeq,
        global_sequence: currentGlobalSeq,
        received_at: raw.created_at || new Date().toISOString(),
        age_declaration_status: valResult.declared18Plus ? 'declared_18_plus' : 'invalid_age_detected',
        terms_accepted: true,
        late_comment: !valResult.withinActiveWindow,
        status: valResult.valid ? DetailedContributionStatus.VALID : DetailedContributionStatus.INVALID,
        validation_status: valResult.valid ? 'VALID' : 'INVALID',
        validation_reasons: valResult.reasons,
        selected_by_rule: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      contributions.push(contribution);
      currentDailySeq++;
      currentGlobalSeq++;
    }

    return {
      contributions,
      participants: Array.from(participantsMap.values()),
      totalProcessed: rawComments.length,
      validCount,
      invalidCount,
    };
  }
}
