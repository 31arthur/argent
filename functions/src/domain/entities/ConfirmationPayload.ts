/**
 * Confirmation Summary
 */
export interface ConfirmationSummary {
    poolName: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    categoryName: string;
    purpose: string;
    date: string; // ISO string format
    notes?: string;
    tags?: string[];
}

/**
 * Confirmation Payload
 * Data structure for confirmation UI card
 */
export interface ConfirmationPayload {
    draftId: string;
    summary: ConfirmationSummary;
    actions: string[];
}
