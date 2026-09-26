import { describe, it, expect } from 'vitest';
import { countWords } from '@/core/validation/word-counter';
import { ContributionValidator } from '@/core/validation/contribution-validator';

describe('Deterministic Word Counter & Range Validator (69 - 96 words)', () => {
  const validator = new ContributionValidator(69, 96, 3);

  // Helper to generate N distinct words sentence
  const generateWords = (count: number) => {
    const words = [];
    for (let i = 1; i <= count; i++) {
      words.push(`palabra${i}`);
    }
    return words.join(' ') + '.';
  };

  it('should accept a contribution with 75 words (within 69 - 96 range)', () => {
    const text75 = generateWords(75);
    expect(countWords(text75)).toBe(75);
    const result = validator.validate(text75);
    expect(result.valid).toBe(true);
  });

  it('should accept exact minimum boundary of 69 words', () => {
    const text69 = generateWords(69);
    expect(countWords(text69)).toBe(69);
    const result = validator.validate(text69);
    expect(result.valid).toBe(true);
  });

  it('should accept exact maximum boundary of 96 words', () => {
    const text96 = generateWords(96);
    expect(countWords(text96)).toBe(96);
    const result = validator.validate(text96);
    expect(result.valid).toBe(true);
  });

  it('should reject a contribution with 68 words (below minimum 69)', () => {
    const text68 = generateWords(68);
    expect(countWords(text68)).toBe(68);
    const result = validator.validate(text68);
    expect(result.valid).toBe(false);
    expect(result.reasons.some((r) => r.includes('Rango permitido: 69 - 96'))).toBe(true);
  });

  it('should reject a contribution with 97 words (above maximum 96)', () => {
    const text97 = generateWords(97);
    expect(countWords(text97)).toBe(97);
    const result = validator.validate(text97);
    expect(result.valid).toBe(false);
    expect(result.reasons.some((r) => r.includes('Rango permitido: 69 - 96'))).toBe(true);
  });
});
