import { countWords } from './word-counter';
import { Participant, SocialPost, ValidationResult, ValidationRuleResult } from '@/types/domain.types';
import { SocialPostStatus } from '@/types/enums';

export interface ValidationContext {
  minWordCount?: number; // Default 100
  maxWordCount?: number; // Default 150
  maxAuthorSelections?: number; // Default 3
  participant?: Participant;
  socialPost?: SocialPost;
  receivedAt?: string;
}

export class ContributionValidator {
  private minWordCount: number;
  private maxWordCount: number;
  private maxAuthorSelections: number;

  constructor(minWordCount = 100, maxWordCount = 150, maxAuthorSelections = 3) {
    this.minWordCount = minWordCount;
    this.maxWordCount = maxWordCount;
    this.maxAuthorSelections = maxAuthorSelections;
  }

  /**
   * Validates a contribution against the Hard Rules & Project Guidelines.
   * Word Range Rule: Between 100 and 150 words (inclusive).
   */
  public validate(
    text: string,
    participant?: Participant,
    socialPost?: SocialPost,
    receivedAt?: string
  ): ValidationResult {
    const wordCount = countWords(text);
    const ruleResults: ValidationRuleResult[] = [];
    const reasons: string[] = [];

    // HARD RULE 1: Age Declaration (18+)
    const isMinorDeclared = this.detectMinorMention(text);
    let declared18Plus = participant ? participant.declared_18_plus : true;
    if (isMinorDeclared) declared18Plus = false;

    const passedHardRule1 = declared18Plus;
    ruleResults.push({
      ruleNumber: 1,
      ruleName: 'Regla 1: Solo mayores de 18 años declarados',
      passed: passedHardRule1,
      reason: passedHardRule1
        ? undefined
        : 'Rechazado: Participante menor de edad o con declaración de edad inválida',
    });
    if (!passedHardRule1) {
      reasons.push('Declaración de mayoría de edad no válida (menor de 18 años)');
    }

    // HARD RULE 3 & 4: Active Daily Window Check
    let withinActiveWindow = true;
    if (socialPost) {
      const isPostOpen = (socialPost.status as string) === SocialPostStatus.ABIERTO || (socialPost.status as string) === 'abierto';
      let isWithinTimeWindow = true;
      if (socialPost.closes_at && receivedAt) {
        isWithinTimeWindow = new Date(receivedAt) <= new Date(socialPost.closes_at);
      }
      withinActiveWindow = isPostOpen && isWithinTimeWindow;
    }

    const passedHardRule4 = withinActiveWindow;
    ruleResults.push({
      ruleNumber: 4,
      ruleName: 'Regla 4: Publicación en ventana diaria activa',
      passed: passedHardRule4,
      reason: passedHardRule4
        ? undefined
        : 'Rechazado: Comentario recibido fuera de la ventana activa (publicación cerrada)',
    });
    if (!passedHardRule4) {
      reasons.push('Comentario fuera de ventana activa (publicación cerrada)');
    }

    // RULE: Word count range between 100 and 150 words
    const passedWordCountRule = wordCount >= this.minWordCount && wordCount <= this.maxWordCount;
    ruleResults.push({
      ruleNumber: 2,
      ruleName: `Entre ${this.minWordCount} y ${this.maxWordCount} palabras`,
      passed: passedWordCountRule,
      reason: passedWordCountRule
        ? undefined
        : `Tiene ${wordCount} palabras. Se requiere un rango de ${this.minWordCount} a ${this.maxWordCount} palabras.`,
    });
    if (!passedWordCountRule) {
      reasons.push(`Palabras fuera de rango (${wordCount} palabras). Rango permitido: ${this.minWordCount} - ${this.maxWordCount}`);
    }

    // RULE: Author limit <= 3
    let passedAuthorLimitRule = true;
    let authorEligible = true;
    if (participant) {
      if (participant.selected_count >= this.maxAuthorSelections) {
        passedAuthorLimitRule = false;
        authorEligible = false;
        reasons.push(
          `Límite de autor alcanzado (${participant.selected_count}/${this.maxAuthorSelections} selecciones)`
        );
      }
    }
    ruleResults.push({
      ruleNumber: 3,
      ruleName: `Límite por autor (${this.maxAuthorSelections} selecciones máx)`,
      passed: passedAuthorLimitRule,
      reason: passedAuthorLimitRule ? undefined : 'Autor ya alcanzó el límite de 3 selecciones oficiales',
    });

    // Spam & advertising checks
    const isSpam = this.checkSpam(text);
    if (isSpam) reasons.push('Contenido clasificado como spam');

    const isAd = this.checkAdvertising(text);
    if (isAd) reasons.push('Contenido publicitario no permitido');

    const isDestructive = this.checkNarrativeDestruction(text);
    if (isDestructive) reasons.push('Destrucción narrativa absoluta detectada');

    const isValid =
      passedHardRule1 &&
      passedHardRule4 &&
      passedWordCountRule &&
      passedAuthorLimitRule &&
      !isSpam &&
      !isAd &&
      !isDestructive;

    return {
      valid: isValid,
      wordCount,
      expectedWordCount: this.maxWordCount,
      authorEligible,
      declared18Plus,
      withinActiveWindow,
      ruleResults,
      reasons,
    };
  }

  private detectMinorMention(text: string): boolean {
    const lower = text.toLowerCase();
    const minorPhrases = [
      'tengo 12', 'tengo 13', 'tengo 14', 'tengo 15', 'tengo 16', 'tengo 17',
      'soy menor de edad', 'soy un menor', 'tengo 15 años', 'tengo 16 años', 'tengo 17 años'
    ];
    return minorPhrases.some((phrase) => lower.includes(phrase));
  }

  private checkSpam(text: string): boolean {
    const words = text.toLowerCase().split(/\s+/);
    if (words.length > 5) {
      const uniqueWords = new Set(words);
      if (uniqueWords.size / words.length < 0.2) return true;
    }
    return false;
  }

  private checkAdvertising(text: string): boolean {
    const lower = text.toLowerCase();
    const adKeywords = ['buy now', 'compra ya', 'sígueme en youtube', 'subscribete', 'descuento', 'http://', 'https://'];
    return adKeywords.some((kw) => lower.includes(kw));
  }

  private checkNarrativeDestruction(text: string): boolean {
    const lower = text.toLowerCase();
    const destructionPatterns = [
      'explotó el planeta y terminó para siempre',
      'se acabó la historia para siempre',
      'todos murieron y nada volvió a existir',
    ];
    return destructionPatterns.some((pattern) => lower.includes(pattern));
  }
}
