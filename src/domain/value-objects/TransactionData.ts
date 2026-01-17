import type { TransactionType } from './Transaction';

/**
 * Transaction Data Value Object
 * Represents the transaction data within a draft
 * 
 * This is a partial representation of transaction fields that can be
 * extracted by the AI agent. All fields are optional during extraction,
 * but certain fields are REQUIRED for draft confirmation.
 * 
 * REQUIRED FIELDS FOR CONFIRMATION:
 * - poolId (must reference existing, active cash pool)
 * - amount (must be > 0)
 * - type (INCOME or EXPENSE)
 * - categoryId (must reference existing category)
 * - purpose (must be ≥ 3 characters)
 * - date (cannot be in future)
 * 
 * OPTIONAL FIELDS:
 * - notes
 * - tags
 */
export interface TransactionData {
    /**
     * Reference to the cash pool for this transaction
     */
    poolId?: string;

    /**
     * Transaction amount (always positive)
     */
    amount?: number;

    /**
     * Transaction type (INCOME or EXPENSE)
     */
    type?: TransactionType;

    /**
     * Reference to the transaction category
     */
    categoryId?: string;

    /**
     * Transaction purpose/description
     */
    purpose?: string;

    /**
     * Optional additional notes
     */
    notes?: string;

    /**
     * Optional tags for categorization
     */
    tags?: string[];

    /**
     * Transaction date
     */
    date?: Date;
}
