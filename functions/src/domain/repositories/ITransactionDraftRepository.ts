import { TransactionDraft } from '../entities/TransactionDraft';

/**
 * Transaction Draft Repository Interface
 */
export interface ITransactionDraftRepository {
    getById(id: string): Promise<TransactionDraft | null>;
    getByConversation(conversationId: string): Promise<TransactionDraft | null>;
    getAllByUser(userId: string): Promise<TransactionDraft[]>;
    create(draft: Omit<TransactionDraft, 'id' | 'createdAt' | 'updatedAt' | 'confirmedAt' | 'cancelledAt' | 'finalizedAt' | 'transactionId' | 'isDeleted'>): Promise<TransactionDraft>;
    update(id: string, updates: Partial<TransactionDraft>): Promise<TransactionDraft>;
    markAsConfirmed(id: string): Promise<TransactionDraft>;
    markAsCancelled(id: string): Promise<TransactionDraft>;
    markAsFinalized(id: string, transactionId: string): Promise<TransactionDraft>;
    softDelete(id: string): Promise<void>;
}
