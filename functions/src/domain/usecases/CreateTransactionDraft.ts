import { TransactionDraft } from '../entities/TransactionDraft';
import { DraftStatus } from '../entities/DraftStatus';
import { ITransactionDraftRepository } from '../repositories/ITransactionDraftRepository';

/**
 * Use Case: Create Transaction Draft
 */
export class CreateTransactionDraft {
    constructor(private draftRepository: ITransactionDraftRepository) {}

    async execute(conversationId: string, userId: string): Promise<TransactionDraft> {
        const draft = await this.draftRepository.create({
            userId,
            conversationId,
            extractedFields: {},
            confidenceMap: {},
            missingFields: ['poolId', 'amount', 'type', 'categoryId', 'purpose', 'date'],
            status: DraftStatus.IN_PROGRESS,
        });

        return draft;
    }
}
