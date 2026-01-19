import type { TransactionDraft } from '../entities/TransactionDraft';

/**
 * Repository Interface: ITransactionDraftRepository
 * Defines the contract for transaction draft data operations
 * 
 * STORAGE STRATEGY:
 * - Separate Firestore collection: 'transactionDrafts'
 * - User-scoped queries with composite indexes
 * - Soft delete by default
 * - Drafts older than 30 days can be auto-purged (future enhancement)
 * 
 * REQUIRED FIRESTORE INDEXES:
 * - userId + createdAt (descending)
 * - conversationId + status
 */
export interface ITransactionDraftRepository {
    /**
     * Retrieve a draft by its ID
     */
    getById(id: string): Promise<TransactionDraft | null>;

    /**
     * Retrieve the active draft for a conversation
     * Returns null if no draft exists or if draft is cancelled/confirmed
     */
    getByConversation(conversationId: string): Promise<TransactionDraft | null>;

    /**
     * Retrieve all drafts for a user (including cancelled/confirmed)
     * Ordered by createdAt descending
     */
    getAllByUser(userId: string): Promise<TransactionDraft[]>;

    /**
     * Create a new draft
     */
    create(
        draft: Omit<TransactionDraft, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<TransactionDraft>;

    /**
     * Update a draft with partial data
     * Automatically updates 'updatedAt' timestamp
     */
    update(id: string, updates: Partial<TransactionDraft>): Promise<TransactionDraft>;

    /**
     * Mark a draft as confirmed
     * Sets status to CONFIRMED and sets confirmedAt timestamp
     * Draft becomes immutable after this operation
     */
    markAsConfirmed(id: string): Promise<TransactionDraft>;

    /**
     * Mark a draft as cancelled
     * Sets status to CANCELLED and sets cancelledAt timestamp
     */
    markAsCancelled(id: string): Promise<TransactionDraft>;

    /**
     * Mark a draft as finalized
     * Sets status to FINALIZED, sets finalizedAt timestamp, and stores transactionId
     * This is called ONLY by FinalizeTransactionDraft use case
     */
    markAsFinalized(id: string, transactionId: string): Promise<TransactionDraft>;

    /**
     * Soft delete a draft
     * Draft remains in database but is excluded from normal queries
     */
    softDelete(id: string): Promise<void>;

    /**
     * Permanently delete a draft
     * Use with caution - this cannot be undone
     */
    permanentDelete(id: string): Promise<void>;
}

