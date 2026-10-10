import { Contribution, Participant, SelectionAuditLog, DailySelectionRule } from '@/types/domain.types';
import { ContributionStatus } from '@/types/enums';

export interface SelectionSlotRequest {
  slotNumber: number; // 1, 2, 3
  targetSequence: number; // e.g. 15, 38, 72
}

export interface SelectionSlotResult {
  slotRule: DailySelectionRule;
  selectedContribution: Contribution;
  replacementApplied: boolean;
  replacementChain: SelectionAuditLog[];
}

export class SelectionService {
  /**
   * Resolves a daily slot selection given a pool of indexed contributions for the day.
   *
   * @param slotNumber 1, 2 or 3
   * @param targetSequence Initial target sequence (e.g. 15, 38, 72)
   * @param contributionsMap Map of capture_sequence -> Contribution
   * @param participantsMap Map of participant_id -> Participant
   * @param projectDayId ID of current project day
   * @param maxSequence Maximum sequence number recorded for the day
   */
  public resolveSlotSelection(
    slotNumber: number,
    targetSequence: number,
    contributionsMap: Map<number, Contribution>,
    participantsMap: Map<string, Participant>,
    projectDayId: string,
    maxSequence: number
  ): SelectionSlotResult {
    const replacementChain: SelectionAuditLog[] = [];
    let currentSequence = targetSequence;
    let selectedContribution: Contribution | null = null;
    let replacementApplied = false;
    let finalReason = '';

    while (currentSequence <= maxSequence + 300) {
      const candidate = contributionsMap.get(currentSequence);

      if (!candidate) {
        // Log missing sequence attempt
        replacementChain.push({
          id: `audit-${projectDayId}-slot${slotNumber}-seq${currentSequence}-${Date.now()}`,
          project_day_id: projectDayId,
          selection_slot: slotNumber,
          initial_target: targetSequence,
          candidate_sequence: currentSequence,
          valid: false,
          reason: `No existe participación con secuencia ${currentSequence}`,
          timestamp: new Date().toISOString(),
        });
      } else {
        const participant = participantsMap.get(candidate.participant_id);
        const authorLimitReached = participant ? participant.selected_count >= 3 : false;
        const isValid = candidate.validation_status === 'VALID' && !authorLimitReached;

        let failReason = '';
        if (candidate.validation_status !== 'VALID') {
          failReason = candidate.validation_reasons?.join('; ') || 'Contribución inválida';
        } else if (authorLimitReached) {
          failReason = `Autor @${participant?.username} alcanzó el límite máximo de 3 selecciones oficiales (${participant?.selected_count}/3)`;
        }

        replacementChain.push({
          id: `audit-${projectDayId}-slot${slotNumber}-seq${currentSequence}-${Date.now()}`,
          project_day_id: projectDayId,
          selection_slot: slotNumber,
          initial_target: targetSequence,
          candidate_sequence: currentSequence,
          contribution_id: candidate.id,
          valid: isValid,
          reason: isValid ? 'Contribución válida seleccionada' : failReason,
          timestamp: new Date().toISOString(),
        });

        if (isValid) {
          selectedContribution = candidate;
          if (currentSequence !== targetSequence) {
            replacementApplied = true;
            finalReason = `Sustitución por regla +3 desde objetivo ${targetSequence} (saltos a secuencia ${currentSequence})`;
          }
          break;
        }
      }

      // Apply +3 Jump rule
      currentSequence += 3;
    }

    if (!selectedContribution) {
      const targetItem = contributionsMap.get(targetSequence);
      if (targetItem) {
        const existingReasons = targetItem.validation_reasons || [];
        const fallbackReason = `Sin candidato válido (100-150 palabras) en la cadena +3 para el objetivo #${targetSequence}`;
        selectedContribution = {
          ...targetItem,
          validation_status: 'INVALID',
          validation_reasons: existingReasons.includes(fallbackReason)
            ? existingReasons
            : [...existingReasons, fallbackReason],
        };
      } else {
        selectedContribution = {
          id: `contrib_${projectDayId}_target_${targetSequence}`,
          project_id: projectDayId,
          project_day_id: projectDayId,
          global_comment_code: 'EMP-COM-000000',
          daily_comment_code: `D${String(Number(projectDayId.replace(/\D/g, '')) || 1).padStart(2, '0')}-C${String(targetSequence).padStart(4, '0')}`,
          internal_id: `D${String(Number(projectDayId.replace(/\D/g, '')) || 1).padStart(2, '0')}-C${String(targetSequence).padStart(4, '0')}`,
          participant_id: 'sin_participante',
          author_handle: 'sin_participante',
          original_text: `No se encontró ningún comentario en la cadena +3 que cumpla con el rango obligatorio de 100 a 150 palabras para el objetivo #${targetSequence}.`,
          original_hash: '',
          normalized_text: '',
          word_count: 0,
          capture_sequence: targetSequence,
          received_at: new Date().toISOString(),
          age_declaration_status: 'invalid_age_detected',
          terms_accepted: false,
          late_comment: false,
          status: 'INVALID',
          validation_status: 'INVALID',
          validation_reasons: [`Sin candidato válido (100-150 palabras) en la cadena +3 para el objetivo #${targetSequence}`],
          selected_by_rule: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      replacementApplied = true;
      finalReason = `Sin comentarios en el rango 100-150 palabras en la secuencia +3 desde objetivo #${targetSequence}`;
    }

    // Update contribution status to SELECTED
    const updatedSelectedContribution: Contribution = {
      ...selectedContribution,
      status: ContributionStatus.SELECTED,
      selected_by_rule: true,
      replacement_for_contribution_id: replacementApplied
        ? contributionsMap.get(targetSequence)?.id
        : undefined,
    };

    const slotRule: DailySelectionRule = {
      id: `rule-${projectDayId}-slot${slotNumber}`,
      project_day_id: projectDayId,
      slot_number: slotNumber,
      target_sequence: targetSequence,
      selected_contribution_id: updatedSelectedContribution.id,
      replacement_applied: replacementApplied,
      replacement_reason: replacementApplied ? finalReason : undefined,
      created_at: new Date().toISOString(),
    };

    return {
      slotRule,
      selectedContribution: updatedSelectedContribution,
      replacementApplied,
      replacementChain,
    };
  }
}
