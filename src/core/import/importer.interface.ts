import { Contribution, Participant } from '@/types/domain.types';

export interface RawImportedComment {
  platform_comment_id?: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  text: string;
  likes?: number | string;
  replies?: number | string;
  created_at?: string;
  language?: string;
  platform_comment_url?: string;
}

export interface ImportBatchResult {
  contributions: Contribution[];
  participants: Participant[];
  totalProcessed: number;
  validCount: number;
  invalidCount: number;
}

export interface CommentImporter {
  importComments(
    rawComments: RawImportedComment[],
    projectDayId: string,
    dayNumber: number,
    startSequence?: number
  ): Promise<ImportBatchResult>;
}
