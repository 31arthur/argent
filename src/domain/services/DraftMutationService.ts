import type { TransactionDraft } from '@/domain/entities/TransactionDraft';
import type { TransactionData } from '@/domain/value-objects/TransactionData';
import type { ITransactionDraftRepository } from '@/domain/repositories/ITransactionDraftRepository';
import { UpdateTransactionDraft } from '@/domain/usecases/agent/UpdateTransactionDraft';

/**
 * Draft Mutation Service
 * Centralized service for all TransactionDraft mutations
 * 
 * RESPONSIBILITIES:
 * - Validate field updates
 * - Update confidence map
 * - Recalculate missing fields
 * - Persist changes
 * 
 * RULES:
 * - Never wipe existing fields unless explicitly changed
 * - Never auto-fill critical fields silently
 * - Track what changed after each update
 * - Always recalculate missingFields via validation
 * 
 * CONFIDENCE LEVELS:
 * - Stub extraction: 0.3 (low confidence)
 * - User-provided: 1.0 (high confidence)
 * - Disambiguated: 1.0 (high confidence)
 */
export class DraftMutationService {
    private updateDraftUseCase: UpdateTransactionDraft;

    constructor(private draftRepository: ITransactionDraftRepository) {
        this.updateDraftUseCase = new UpdateTransactionDraft(draftRepository);
    }

    /**
     * Update a single field in the draft
     * 
     * @param draftId - ID of the draft to update
     * @param field - Field name to update
     * @param value - New value for the field
     * @param confidence - Confidence score (0-1), defaults to 1.0 for user input
     * @returns Updated draft
     */
    async updateField(
        draftId: string,
        field: keyof TransactionData,
        value: unknown,
        confidence: number = 1.0
    ): Promise<TransactionDraft> {
        // Validate confidence range
        if (confidence < 0 || confidence > 1) {
            throw new Error('Confidence must be between 0 and 1');
        }

        // Create partial update
        const updates: Partial<TransactionData> = {
            [field]: value,
        };

        // Create confidence update
        const confidenceUpdates: Record<string, number> = {
            [field]: confidence,
        };

        // Use UpdateTransactionDraft use case
        return this.updateDraftUseCase.execute(draftId, updates, confidenceUpdates);
    }

    /**
     * Update multiple fields in the draft
     * 
     * @param draftId - ID of the draft to update
     * @param updates - Partial transaction data to merge
     * @param confidenceMap - Optional confidence scores for each field
     * @returns Updated draft
     */
    async updateMultipleFields(
        draftId: string,
        updates: Partial<TransactionData>,
        confidenceMap?: Record<string, number>
    ): Promise<TransactionDraft> {
        // Validate confidence values if provided
        if (confidenceMap) {
            for (const [field, confidence] of Object.entries(confidenceMap)) {
                if (confidence < 0 || confidence > 1) {
                    throw new Error(`Confidence for field '${field}' must be between 0 and 1`);
                }
            }
        }

        // Use UpdateTransactionDraft use case
        return this.updateDraftUseCase.execute(draftId, updates, confidenceMap);
    }

    /**
     * Clear a specific field from the draft
     * 
     * @param draftId - ID of the draft to update
     * @param field - Field name to clear
     * @returns Updated draft
     */
    async clearField(draftId: string, field: keyof TransactionData): Promise<TransactionDraft> {
        const updates: Partial<TransactionData> = {
            [field]: undefined,
        };

        const confidenceUpdates: Record<string, number> = {
            [field]: 0,
        };

        return this.updateDraftUseCase.execute(draftId, updates, confidenceUpdates);
    }
}
