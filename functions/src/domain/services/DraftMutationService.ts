import type { TransactionDraft } from '../entities/TransactionDraft';
import type { TransactionData } from '../value-objects/TransactionData';
import type { ITransactionDraftRepository } from '../repositories/ITransactionDraftRepository';
import { UpdateTransactionDraft } from '../usecases/agent/UpdateTransactionDraft';

/**
 * Draft Mutation Service
 * Centralized service for all TransactionDraft mutations
 */
export class DraftMutationService {
    private updateDraftUseCase: UpdateTransactionDraft;

    constructor(private draftRepository: ITransactionDraftRepository) {
        this.updateDraftUseCase = new UpdateTransactionDraft(draftRepository);
    }

    async updateField(
        draftId: string,
        field: keyof TransactionData,
        value: unknown,
        confidence: number = 1.0
    ): Promise<TransactionDraft> {
        if (confidence < 0 || confidence > 1) {
            throw new Error('Confidence must be between 0 and 1');
        }

        const updates: Partial<TransactionData> = {
            [field]: value,
        };

        const confidenceUpdates: Record<string, number> = {
            [field]: confidence,
        };

        return this.updateDraftUseCase.execute(draftId, updates, confidenceUpdates);
    }

    async updateMultipleFields(
        draftId: string,
        updates: Partial<TransactionData>,
        confidenceMap?: Record<string, number>
    ): Promise<TransactionDraft> {
        if (confidenceMap) {
            for (const [field, confidence] of Object.entries(confidenceMap)) {
                if (confidence < 0 || confidence > 1) {
                    throw new Error(`Confidence for field '${field}' must be between 0 and 1`);
                }
            }
        }

        return this.updateDraftUseCase.execute(draftId, updates, confidenceMap);
    }

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

