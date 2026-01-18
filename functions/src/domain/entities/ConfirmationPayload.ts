/**
 * Confirmation Summary
 */
export interface ConfirmationSummary {
    poolName: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    categoryName: string;
    purpose: string;
    date: Date;
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
