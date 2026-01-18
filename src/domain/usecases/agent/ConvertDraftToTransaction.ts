import type { Transaction } from '@/domain/entities/Transaction';
import type { ITransactionDraftRepository } from '@/domain/repositories/ITransactionDraftRepository';
import { DraftStatus } from '@/domain/entities/DraftStatus';
import { AddTransaction } from '@/domain/usecases/transactions/AddTransaction';
import { ValidateTransactionDraft } from './ValidateTransactionDraft';

/**
 * Use Case: Convert Draft to Transaction
 * Converts a confirmed draft into a real transaction
 * 
 * CRITICAL RULES:
 * - Draft MUST have status === CONFIRMED
 * - Reuses existing AddTransaction use case
 * - This is the ONLY way a draft becomes a transaction
 * - AI Agent CANNOT bypass this flow
 * 
 * GUARANTEES:
 * - All existing transaction validation rules apply
 * - Cash pool balance updates happen via existing logic
 * - No duplication of transaction creation logic
 * 
 * WORKFLOW:
 * 1. Retrieve draft by ID
 * 2. Verify draft is confirmed
 * 3. Validate completeness (double-check)
 * 4. Call AddTransaction use case with extracted data
 * 5. Return created transaction
 */
export class ConvertDraftToTransaction {
    private validator: ValidateTransactionDraft;

    constructor(
        private draftRepository: ITransactionDraftRepository,
        private addTransaction: AddTransaction
    ) {
        this.validator = new ValidateTransactionDraft();
    }

    /**
     * Execute conversion
     * 
     * @param draftId - ID of the draft to convert
     * @returns The created transaction
     * @throws Error if draft is not found, not confirmed, or incomplete
     */
    async execute(draftId: string): Promise<Transaction> {
        // Retrieve draft
        const draft = await this.draftRepository.getById(draftId);
        if (!draft) {
            throw new Error('Draft not found');
        }

        // Verify draft is confirmed
        if (draft.status !== DraftStatus.CONFIRMED) {
            throw new Error(
                `Draft must be confirmed before conversion. Current status: ${draft.status}`
            );
        }

        // Validate completeness (double-check)
        const validation = this.validator.execute(draft);
        if (!validation.isValid) {
            throw new Error(
                `Draft is missing required fields: ${validation.missingFields.join(', ')}`
            );
        }

        // Extract fields (we know they exist due to validation)
        const { poolId, amount, type, categoryId, purpose, notes, tags, date } =
            draft.extractedFields;

        // Convert to transaction using existing use case
        // This ensures all existing validation rules and balance updates apply
        const transaction = await this.addTransaction.execute({
            userId: draft.userId,
            poolId: poolId!,
            amount: amount!,
            type: type!,
            categoryId: categoryId!,
            purpose: purpose!,
            notes,
            tags,
            date: date && typeof (date as any).toDate === 'function'
                ? (date as any).toDate()
                : new Date(date!),
        });

        return transaction;
    }
}
