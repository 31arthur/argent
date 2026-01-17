import type { ITransactionDraftRepository } from '@/domain/repositories/ITransactionDraftRepository';

/**
 * Use Case: Cancel Transaction Draft
 * Marks a draft as cancelled
 * 
 * RULES:
 * - Draft cannot be already confirmed
 * - Draft cannot be already cancelled
 * - Once cancelled, draft becomes immutable
 */
export class CancelTransactionDraft {
    constructor(private draftRepository: ITransactionDraftRepository) { }

    /**
     * Execute draft cancellation
     * 
     * @param draftId - ID of the draft to cancel
     * @throws Error if draft not found or already in terminal state
     */
    async execute(draftId: string): Promise<void> {
        const draft = await this.draftRepository.getById(draftId);
        if (!draft) {
            throw new Error('Draft not found');
        }

        // Cannot cancel confirmed or already cancelled drafts
        if (draft.status === 'CONFIRMED') {
            throw new Error('Cannot cancel a confirmed draft');
        }

        if (draft.status === 'CANCELLED') {
            throw new Error('Draft is already cancelled');
        }

        // Mark as cancelled
        await this.draftRepository.markAsCancelled(draftId);
    }
}
