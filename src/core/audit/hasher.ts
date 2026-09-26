import { createHash } from 'crypto';

/**
 * Calculates SHA-256 hash of original text to guarantee unalterable proof.
 */
export function generateSHA256(text: string): string {
  if (!text) return '';
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

/**
 * Formats Global Comment Code.
 * Example: EMP-COM-000001
 */
export function formatGlobalCommentCode(globalSequence: number): string {
  const seqStr = String(globalSequence).padStart(6, '0');
  return `EMP-COM-${seqStr}`;
}

/**
 * Formats Daily Comment Code.
 * Example: D01-C0001
 */
export function formatDailyCommentCode(dayNumber: number, captureSequence: number): string {
  const dayStr = String(dayNumber).padStart(2, '0');
  const seqStr = String(captureSequence).padStart(4, '0');
  return `D${dayStr}-C${seqStr}`;
}

/**
 * Legacy alias for internal ID
 */
export function formatInternalId(dayNumber: number, sequenceNumber: number): string {
  return formatDailyCommentCode(dayNumber, sequenceNumber);
}
