import { TransactionDraft } from '../entities/TransactionDraft';
import { TransactionData } from '../value-objects/TransactionData';
import { DraftStatus } from '../entities/DraftStatus';
import { ITransactionDraftRepository } from '../repositories/ITransactionDraftRepository';
import { ValidateTransactionDraft } from './ValidateTransactionDraft';

/**
 * Use Case: Update Transaction Draft
 */
export class UpdateTransactionDraft {
    private validator: ValidateTransactionDraft;

    constructor(private draftRepository: ITransactionDraftRepository) {
        this.validator = new ValidateTransactionDraft();
    }

    async execute(
        draftId: string,
        updates: Partial<TransactionData>,
        confidenceUpdates?: Record<string, number>
    ): Promise<TransactionDraft> {
        const draft = await this.draftRepository.getById(draftId);
        if (!draft) {
            throw new Error('Draft not found');
        }

        if (draft.status === DraftStatus.CONFIRMED || draft.status === DraftStatus.CANCELLED) {
            throw new Error(`Cannot update draft with status: ${draft.status}`);
        }

        const updatedFields: Partial<TransactionData> = {
            ...draft.extractedFields,
            ...updates,
        };

        const updatedConfidence: Record<string, number> = {
            ...draft.confidenceMap,
            ...(confidenceUpdates || {}),
        };

        const validation = this.validator.execute({
            ...draft,
            extractedFields: updatedFields,
        });

        let newStatus = draft.status;

        if (validation.isValid) {
            if (
                draft.status === DraftStatus.IN_PROGRESS ||
                draft.status === DraftStatus.WAITING_FOR_INPUT
            ) {
                newStatus = DraftStatus.WAITING_FOR_CONFIRMATION;
            }
        } else {
            if (draft.status === DraftStatus.IN_PROGRESS) {
                newStatus = DraftStatus.WAITING_FOR_INPUT;
            }
        }

        return this.draftRepository.update(draftId, {
            extractedFields: updatedFields,
            confidenceMap: updatedConfidence,
            missingFields: validation.missingFields,
            status: newStatus,
        });
    }
}
