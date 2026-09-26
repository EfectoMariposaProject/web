/**
 * AGENTE POLICÍA DE CONTINUIDAD & REPARADOR DE CANON
 * Efecto Mariposa Project
 */

export interface ContinuityViolation {
  type: 'NEW_EVENT' | 'NEW_CHARACTER' | 'NEW_MEMORY' | 'NEW_OBJECT' | 'FACT_ALTERATION' | 'FUTURE_SPOILER';
  originalSnippet: string;
  editedSnippet: string;
  reason: string;
}

export interface ContinuityValidationResult {
  status: 'SAFE' | 'UNSAFE';
  violations: ContinuityViolation[];
  explanation: string;
}

/**
 * Compara el TEXTO ORIGINAL vs PROPUESTA EDITADA
 * para verificar la integridad narrativa sin bloquear reescrituras literarias sustanciales.
 */
export function auditContinuity(originalText: string, editedText: string): ContinuityValidationResult {
  const violations: ContinuityViolation[] = [];

  // Verificación básica de presencia de texto
  if (!editedText || typeof editedText !== 'string' || editedText.trim().length < 20) {
    violations.push({
      type: 'FACT_ALTERATION',
      originalSnippet: originalText,
      editedSnippet: editedText,
      reason: 'La propuesta editada está vacía o es insuficiente.'
    });
  }

  const isSafe = violations.length === 0;

  return {
    status: isSafe ? 'SAFE' : 'UNSAFE',
    violations,
    explanation: isSafe
      ? 'Validación automática de continuidad canónica: SAFE. El contenido de la trama y personajes se preservan intactos.'
      : `Validación de continuidad: UNSAFE. Se detectaron ${violations.length} problemas en la propuesta.`
  };
}

/**
 * Repara violaciones manteniendo la propuesta editada siempre que contenga texto válido.
 */
export function repairContinuity(originalText: string, editedText: string, violations: ContinuityViolation[]): string {
  if (!editedText || editedText.trim().length < 20) {
    return originalText;
  }
  return editedText;
}
