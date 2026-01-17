import type { TransactionDraft } from '@/domain/entities/TransactionDraft';
import type { TransactionData } from '@/domain/value-objects/TransactionData';
import type { ITransactionDraftRepository } from '@/domain/repositories/ITransactionDraftRepository';
import { DraftStatus } from '@/domain/entities/DraftStatus';
import { ValidateTransactionDraft } from './ValidateTransactionDraft';

/**
 * Use Case: Update Transaction Draft
 * Updates draft fields and recalculates missing fields and status
 * 
 * LOGIC:
 * 1. Merge new field values with existing extracted fields
 * 2. Merge new confidence scores with existing confidence map
 * 3. Recalculate missing fields via validation
 * 4. Update status based on validation result
 * 5. Persist changes
 * 
 * STATUS TRANSITIONS:
 * - IN_PROGRESS + valid → WAITING_FOR_CONFIRMATION
 * - IN_PROGRESS + invalid → WAITING_FOR_INPUT
 * - WAITING_FOR_INPUT + valid → WAITING_FOR_CONFIRMATION
 * - Other statuses remain unchanged
 */
export class UpdateTransactionDraft {
    private validator: ValidateTransactionDraft;

    constructor(private draftRepository: ITransactionDraftRepository) {
        this.validator = new ValidateTransactionDraft();
    }

    /**
     * Execute draft update
     * 
     * @param draftId - ID of the draft to update
     * @param updates - Partial transaction data to merge
     * @param confidenceUpdates - Optional confidence scores to merge
     * @returns The updated draft
     */
    async execute(
        draftId: string,
        updates: Partial<TransactionData>,
        confidenceUpdates?: Record<string, number>
    ): Promise<TransactionDraft> {
        const draft = await this.draftRepository.getById(draftId);
        if (!draft) {
            throw new Error('Draft not found');
        }

        // Cannot update confirmed or cancelled drafts
        if (draft.status === DraftStatus.CONFIRMED || draft.status === DraftStatus.CANCELLED) {
            throw new Error(`Cannot update draft with status: ${draft.status}`);
        }

        // Merge updates
        const updatedFields: Partial<TransactionData> = {
            ...draft.extractedFields,
            ...updates,
        };

        const updatedConfidence: Record<string, number> = {
            ...draft.confidenceMap,
            ...(confidenceUpdates || {}),
        };

        // Recalculate missing fields
        const validation = this.validator.execute({
            ...draft,
            extractedFields: updatedFields,
        });

        // Determine new status
        let newStatus = draft.status;

        if (validation.isValid) {
            // All fields present - ready for confirmation
            if (
                draft.status === DraftStatus.IN_PROGRESS ||
                draft.status === DraftStatus.WAITING_FOR_INPUT
            ) {
                newStatus = DraftStatus.WAITING_FOR_CONFIRMATION;
            }
        } else {
            // Missing fields - need user input
            if (draft.status === DraftStatus.IN_PROGRESS) {
                newStatus = DraftStatus.WAITING_FOR_INPUT;
            }
        }

        // Persist updates
        return this.draftRepository.update(draftId, {
            extractedFields: updatedFields,
            confidenceMap: updatedConfidence,
            missingFields: validation.missingFields,
            status: newStatus,
        });
    }
}
