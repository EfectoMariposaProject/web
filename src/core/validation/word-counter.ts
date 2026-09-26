/**
 * Deterministic word counter for Efecto Mariposa Project.
 * Rule: Between 100 and 150 words.
 *
 * Rules:
 * 1. Punctuation marks (.,!?:;"'()[]{}¿¡-…) attached to words do NOT count as extra words.
 * 2. Emojis and standalone symbols do NOT count as words.
 * 3. Words are separated by whitespace.
 * 4. URLs, hashtags (#hashtag) and mentions (@usuario) count as single word units.
 */

// Regex to match emojis
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}]/gu;

/**
 * Clean punctuation attached to a token to check if it contains actual alphanumeric/text characters.
 */
function cleanPunctuation(token: string): string {
  // Strip leading and trailing punctuation marks
  return token.replace(/^[.,!?:;"'()[\]{}¿¡\-_…«»“”"'`]+|[.,!?:;"'()[\]{}¿¡\-_…«»“”"'`]+$/g, '');
}

export function countWords(text: string): number {
  if (!text || typeof text !== 'string') return 0;

  // 1. Remove emojis
  const textWithoutEmojis = text.replace(EMOJI_REGEX, '');

  // 2. Split by any whitespace sequence
  const rawTokens = textWithoutEmojis.trim().split(/\s+/);

  if (rawTokens.length === 1 && rawTokens[0] === '') {
    return 0;
  }

  // 3. Filter valid tokens (must contain at least one valid character or digit after stripping punctuation)
  const validWords = rawTokens.filter((token) => {
    const cleaned = cleanPunctuation(token);
    // Token is a valid word if cleaned string has non-whitespace length > 0
    return cleaned.length > 0;
  });

  return validWords.length;
}

/**
 * Returns normalized array of words extracted from text for detailed inspection.
 */
export function extractWords(text: string): string[] {
  if (!text || typeof text !== 'string') return [];

  const textWithoutEmojis = text.replace(EMOJI_REGEX, '');
  const rawTokens = textWithoutEmojis.trim().split(/\s+/);

  if (rawTokens.length === 1 && rawTokens[0] === '') return [];

  return rawTokens
    .map((token) => cleanPunctuation(token))
    .filter((word) => word.length > 0);
}
