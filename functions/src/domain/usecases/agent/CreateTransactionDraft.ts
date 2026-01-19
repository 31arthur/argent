import type { TransactionDraft } from '../../entities/TransactionDraft';
import type { ITransactionDraftRepository } from '../../repositories/ITransactionDraftRepository';
import { DraftStatus } from '../../entities/DraftStatus';

/**
 * Use Case: Create Transaction Draft
 * Creates a new transaction draft for a conversation
 * 
 * INITIAL STATE:
 * - All fields are empty
 * - All required fields are listed in missingFields
 * - Status is IN_PROGRESS
 * - Confidence map is empty
 */
export class CreateTransactionDraft {
    constructor(private draftRepository: ITransactionDraftRepository) { }

    /**
     * Execute draft creation
     * 
     * @param conversationId - ID of the conversation this draft belongs to
     * @param userId - ID of the user creating the draft
     * @returns The created draft
     */
    async execute(conversationId: string, userId: string): Promise<TransactionDraft> {
        const draft = await this.draftRepository.create({
            userId,
            conversationId,
            type: 'TRANSACTION',
            extractedFields: {},
            confidenceMap: {},
            missingFields: ['poolId', 'amount', 'type', 'categoryId', 'purpose', 'date'],
            status: 'INCOMPLETE',
            isDeleted: false,
        });

        return draft;
    }
}

