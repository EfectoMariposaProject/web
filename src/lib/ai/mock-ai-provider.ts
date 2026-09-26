import { AIProvider, EditorialProposal, ContinuityAnalysisResult } from './ai-provider.interface';

export class MockAIProvider implements AIProvider {
  public name = 'EMP Mock Narrative Assistant';

  public async suggestEditorialIntegration(
    originalText: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    storyContext?: string
  ): Promise<EditorialProposal> {
    // Basic polish proposal preserving essence
    const proposedText = originalText.trim();
    return {
      proposedText,
      essencePreserved: true,
      changesMade: ['Puntuación', 'Ajuste sintáctico ligero'],
      justification: 'Propuesta automatizada inicial del motor narrativo. Mantiene el 100% de la esencia original.',
    };
  }

  public async analyzeContinuity(
    originalText: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    storyContext?: string
  ): Promise<ContinuityAnalysisResult> {
    return {
      valid: true,
      continuity_score: 0.95,
      contradictions: [],
      characters: [],
      locations: [],
      objects: [],
      new_mysteries: [],
      resolved_mysteries: [],
      narrative_seeds: [`Semilla narrativa detectada en: "${originalText.slice(0, 30)}..."`],
      possible_consequences: [
        'Consecuencia posible 1: alteración sutil de la trama principal.',
        'Consecuencia posible 2: revelación de datos desconocidos.',
      ],
      risk_level: 'LOW',
      editorial_notes: 'Análisis inicial completado sin contradicciones crónicas.',
    };
  }
}
