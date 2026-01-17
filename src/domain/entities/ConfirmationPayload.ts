import type { TransactionType } from './Transaction';

/**
 * Confirmation Action Type
 */
export type ConfirmationAction = 'confirm' | 'edit' | 'cancel';

/**
 * Confirmation Summary
 * Structured data for displaying transaction summary to user
 */
export interface ConfirmationSummary {
    /**
     * Cash pool name
     */
    poolName: string;

    /**
     * Transaction amount
     */
    amount: number;

    /**
     * Transaction type (INCOME or EXPENSE)
     */
    type: TransactionType;

    /**
     * Category name
     */
    categoryName: string;

    /**
     * Transaction purpose/description
     */
    purpose: string;

    /**
     * Transaction date
     */
    date: Date;

    /**
     * Optional notes
     */
    notes?: string;

    /**
     * Optional tags
     */
    tags?: string[];
}

/**
 * Confirmation Payload
 * Structured data for confirmation UI
 * 
 * PURPOSE:
 * - Provide all data needed for confirmation card
 * - Include available actions
 * - Enable UI to render confirmation without additional queries
 */
export interface ConfirmationPayload {
    /**
     * ID of the draft being confirmed
     */
    draftId: string;

    /**
     * Human-readable summary of the transaction
     */
    summary: ConfirmationSummary;

    /**
     * Available actions for the user
     */
    actions: ConfirmationAction[];
}
