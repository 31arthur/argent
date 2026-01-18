import { DraftStatus } from './DraftStatus';
import { TransactionData } from '../value-objects/TransactionData';

/**
 * Transaction Draft Entity
 * Represents a partially/fully extracted transaction awaiting confirmation
 */
export interface TransactionDraft {
    id: string;
    userId: string;
    conversationId: string;
    extractedFields: Partial<TransactionData>;
    confidenceMap: Record<string, number>;
    missingFields: string[];
    status: DraftStatus;
    createdAt: Date;
    updatedAt: Date;
    confirmedAt: Date | null;
    cancelledAt: Date | null;
    finalizedAt: Date | null;
    transactionId: string | null;
    isDeleted: boolean;
}
