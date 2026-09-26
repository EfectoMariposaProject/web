export interface ContinuityAnalysisResult {
  valid: boolean;
  continuity_score: number; // 0.0 to 1.0
  contradictions: string[];
  characters: string[];
  locations: string[];
  objects: string[];
  new_mysteries: string[];
  resolved_mysteries: string[];
  narrative_seeds: string[];
  possible_consequences: string[];
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  editorial_notes: string;
}

export interface EditorialProposal {
  proposedText: string;
  essencePreserved: boolean;
  changesMade: string[];
  justification: string;
}

export interface AIProvider {
  name: string;
  
  /**
   * Generates a proposed editorial text for integration into the novel,
   * strictly preserving the user's core narrative essence.
   */
  suggestEditorialIntegration(
    originalText: string,
    storyContext?: string
  ): Promise<EditorialProposal>;

  /**
   * Analyzes contribution against story bible state to detect contradictions,
   * entities, open questions and possible consequences (Butterfly Effect).
   */
  analyzeContinuity(
    originalText: string,
    storyContext?: string
  ): Promise<ContinuityAnalysisResult>;
}
