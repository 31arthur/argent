import type { TransactionDraft } from '@/domain/entities/TransactionDraft';
import type { ITransactionDraftRepository } from '@/domain/repositories/ITransactionDraftRepository';
import { DraftStatus } from '@/domain/entities/DraftStatus';

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
            extractedFields: {},
            confidenceMap: {},
            missingFields: ['poolId', 'amount', 'type', 'categoryId', 'purpose', 'date'],
            status: DraftStatus.IN_PROGRESS,
            isDeleted: false,
        });

        return draft;
    }
}
