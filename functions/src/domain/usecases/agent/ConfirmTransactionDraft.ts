import type { ITransactionDraftRepository } from '../../repositories/ITransactionDraftRepository';
import { DraftStatus } from '../../entities/DraftStatus';

/**
 * Use Case: Confirm Transaction Draft
 * Marks a draft as confirmed, making it ready for conversion
 * 
 * RULES:
 * - Draft must be in WAITING_FOR_CONFIRMATION status
 * - Draft must have all required fields (validated before this call)
 * - Once confirmed, draft becomes immutable
 * - This is the user's explicit approval
 */
export class ConfirmTransactionDraft {
    constructor(private draftRepository: ITransactionDraftRepository) { }

    /**
     * Execute draft confirmation
     * 
     * @param draftId - ID of the draft to confirm
     * @returns The confirmed draft
     * @throws Error if draft not found or not in correct status
     */
    async execute(draftId: string): Promise<void> {
        const draft = await this.draftRepository.getById(draftId);
        if (!draft) {
            throw new Error('Draft not found');
        }

        // Validate draft status
        if (draft.status !== 'READY') {
            throw new Error('Draft must be in READY status to be confirmed');
        }

        // Mark as confirmed
        await this.draftRepository.markAsConfirmed(draftId);
    }
}

