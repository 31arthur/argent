import type { TransactionDraft } from '@/domain/entities/TransactionDraft';
import type { Transaction } from '@/domain/entities/Transaction';
import type { ITransactionDraftRepository } from '@/domain/repositories/ITransactionDraftRepository';
import type { IAgentConversationRepository } from '@/domain/repositories/IAgentConversationRepository';
import type { ITransactionRepository } from '@/domain/repositories/ITransactionRepository';
import { DraftStatus } from '@/domain/entities/DraftStatus';
import { AgentState } from '@/domain/entities/AgentState';
import { AddTransaction } from '@/domain/usecases/transactions/AddTransaction';

/**
 * Finalization Result
 */
export interface FinalizationResult {
    status: 'SUCCESS' | 'ALREADY_FINALIZED' | 'ERROR';
    transactionId?: string;
    transaction?: Transaction;
    errorCode?: string;
    errorMessage?: string;
}

/**
 * Use Case: FinalizeTransactionDraft
 * 
 * PURPOSE:
 * This is the ONLY use case allowed to convert CONFIRMED drafts into real transactions.
 * 
 * CORE RULE:
 * A real Transaction may be created ONLY from a TransactionDraft with status === CONFIRMED.
 * 
 * RESPONSIBILITIES:
 * - Verify draft ownership
 * - Verify draft status === CONFIRMED
 * - Implement idempotency (prevent duplicate transactions)
 * - Validate all required fields
 * - Convert draft → transaction data
 * - Create transaction (via AddTransaction use case)
 * - Mark draft as FINALIZED
 * - Close agent conversation
 * 
 * SAFETY GUARANTEES:
 * - Idempotent (safe to call multiple times)
 * - No duplicate transactions
 * - Deterministic error handling
 * - Audit trail preserved
 */
export class FinalizeTransactionDraft {
    constructor(
        private draftRepository: ITransactionDraftRepository,
        private conversationRepository: IAgentConversationRepository,
        private transactionRepository: ITransactionRepository,
        private addTransaction: AddTransaction
    ) { }

    /**
     * Execute finalization
     * 
     * @param draftId - ID of the draft to finalize
     * @param userId - ID of the user (for ownership verification)
     * @returns Finalization result
     */
    async execute(draftId: string, userId: string): Promise<FinalizationResult> {
        try {
            // 1. Load draft
            const draft = await this.draftRepository.getById(draftId);

            if (!draft) {
                return {
                    status: 'ERROR',
                    errorCode: 'DRAFT_NOT_FOUND',
                    errorMessage: 'Draft not found',
                };
            }

            // 2. Verify ownership
            if (draft.userId !== userId) {
                return {
                    status: 'ERROR',
                    errorCode: 'UNAUTHORIZED',
                    errorMessage: 'You do not have permission to finalize this draft',
                };
            }

            // 3. Idempotency check - already finalized?
            if (draft.status === DraftStatus.FINALIZED && draft.transactionId) {
                // Already finalized - return existing transaction
                const transaction = await this.transactionRepository.getById(
                    draft.transactionId
                );

                return {
                    status: 'ALREADY_FINALIZED',
                    transactionId: draft.transactionId,
                    transaction: transaction || undefined,
                };
            }

            // 4. Verify status === CONFIRMED
            if (draft.status !== DraftStatus.CONFIRMED) {
                return {
                    status: 'ERROR',
                    errorCode: 'DRAFT_NOT_CONFIRMED',
                    errorMessage: 'Draft must be confirmed before finalization',
                };
            }

            // 5. Validate all required fields
            const validationError = this.validateDraftFields(draft);
            if (validationError) {
                return {
                    status: 'ERROR',
                    errorCode: 'INCOMPLETE_DRAFT',
                    errorMessage: validationError,
                };
            }

            // 6. Convert draft → transaction data
            const transactionData = this.mapDraftToTransactionData(draft);

            // 7. Create transaction (via AddTransaction use case)
            // AddTransaction.execute takes extracted fields, not the Omit<Transaction...> object directly
            // I need to adapt the call or map properly.
            // Let's check AddTransaction signature from file view previously...
            // It takes { userId, poolId, amount, type, categoryId, purpose, notes?, tags?, date }

            const transaction = await this.addTransaction.execute({
                userId: transactionData.userId,
                poolId: transactionData.poolId, // fixed from cashPoolId
                amount: transactionData.amount,
                type: transactionData.type,
                categoryId: transactionData.categoryId,
                purpose: transactionData.purpose, // fixed from description
                notes: transactionData.notes,
                tags: transactionData.tags,
                date: transactionData.date,
            });

            // 8. Mark draft as FINALIZED
            await this.draftRepository.update(draftId, {
                status: DraftStatus.FINALIZED,
                transactionId: transaction.id,
                finalizedAt: new Date(),
            });

            // 9. Close conversation
            const conversation = await this.conversationRepository.getById(draft.conversationId);
            if (conversation) {
                await this.conversationRepository.updateState(
                    conversation.id,
                    AgentState.COMPLETED
                );
            }

            // 10. Return success
            return {
                status: 'SUCCESS',
                transactionId: transaction.id,
                transaction,
            };
        } catch (error) {
            console.error('[FinalizeTransactionDraft] Error:', error);

            return {
                status: 'ERROR',
                errorCode: 'TRANSACTION_CREATION_FAILED',
                errorMessage:
                    error instanceof Error ? error.message : 'Failed to create transaction',
            };
        }
    }

    /**
     * Validate draft has all required fields
     */
    private validateDraftFields(draft: TransactionDraft): string | null {
        const { extractedFields } = draft;

        if (!extractedFields.type) {
            return 'Transaction type is required';
        }

        if (extractedFields.amount === undefined || extractedFields.amount === null) {
            return 'Amount is required';
        }

        if (extractedFields.amount <= 0) {
            return 'Amount must be positive';
        }

        if (!extractedFields.poolId) {
            return 'Cash pool is required';
        }

        if (!extractedFields.categoryId) {
            return 'Category is required';
        }

        if (!extractedFields.date) {
            return 'Date is required';
        }

        return null;
    }

    /**
     * Map draft fields to transaction data
     */
    private mapDraftToTransactionData(draft: TransactionDraft): {
        userId: string;
        type: any; // TransactionType
        amount: number;
        poolId: string;
        categoryId: string;
        purpose: string;
        date: Date;
        tags: string[];
        notes?: string;
    } {
        const { extractedFields } = draft;

        return {
            userId: draft.userId,
            type: extractedFields.type!,
            amount: Math.abs(extractedFields.amount!), // Always positive
            poolId: extractedFields.poolId!,
            categoryId: extractedFields.categoryId!,
            purpose: extractedFields.purpose || '',
            date: extractedFields.date!,
            tags: extractedFields.tags || [],
            notes: extractedFields.notes,
        };
    }
}
