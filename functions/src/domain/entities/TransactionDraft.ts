import type { TransactionData } from '../value-objects/TransactionData';
import type { BaseDraft } from './DraftType';

/**
 * Domain Entity: TransactionDraft
 * Represents a partially or fully extracted transaction that awaits user confirmation
 * 
 * CRITICAL INVARIANTS:
 * - Drafts are MUTABLE until confirmed
 * - Drafts are NOT transactions
 * - Drafts do NOT affect cash pool balances
 * - Draft cannot be confirmed if missingFields.length > 0
 * - Once status === CONFIRMED, draft becomes IMMUTABLE
 * - confidenceMap is informational only - does NOT block confirmation
 * - Draft is user-scoped and conversation-scoped
 * 
 * LIFECYCLE:
 * 1. Created with status = IN_PROGRESS
 * 2. Agent extracts fields → updates extractedFields & confidenceMap
 * 3. Validation determines missingFields
 * 4. Status transitions based on completeness
 * 5. User confirms → status = CONFIRMED
 * 6. FinalizeTransactionDraft use case creates real transaction → status = FINALIZED
 * 
 * SEPARATION FROM TRANSACTIONS:
 * - This is a SEPARATE bounded context
 * - AI Agent operates ONLY on drafts
 * - Conversion to Transaction requires explicit user confirmation
 * - Conversion uses existing AddTransaction use case
 */
export interface TransactionDraft extends Omit<BaseDraft, 'type'> {
    type: 'TRANSACTION';

    /**
     * Extracted transaction data (partial or complete)
     * Fields are populated as the agent extracts information
     */
    extractedFields: Partial<TransactionData>;

    /**
     * Confidence scores for each extracted field (0-1)
     * Key: field name, Value: confidence score
     * 
     * This is INFORMATIONAL ONLY and does not affect validation.
     * A field with low confidence can still be confirmed if user approves.
     */
    confidenceMap: Record<string, number>;


    /**
     * When the draft was confirmed by the user
     * Only set when status === CONFIRMED or FINALIZED
     */
    confirmedAt?: Date;

    /**
     * Reference to the created transaction (if finalized)
     * Used for idempotency - prevents duplicate transaction creation
     * Only set when status === FINALIZED
     */
    transactionId?: string;

    /**
     * When the draft was finalized (converted to transaction)
     * Only set when status === FINALIZED
     */
    finalizedAt?: Date;

    /**
     * When the draft was cancelled
     * Only set when status === CANCELLED
     */
    cancelledAt?: Date;
}

