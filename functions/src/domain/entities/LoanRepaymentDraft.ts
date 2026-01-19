import type { BaseDraft } from './DraftType';

/**
 * Loan Repayment Draft
 * Represents a draft for repaying an existing loan
 * 
 * INVARIANTS:
 * - Must reference either loanId OR personId (for AI to identify loan)
 * - amount must be > 0 and <= loan's outstandingAmount
 * - Always creates an EXPENSE transaction
 * - Updates loan's totalRepaid and outstandingAmount
 * 
 * REQUIRED FIELDS:
 * - loanId (or personId to identify loan)
 * - amount
 * - cashPoolId
 * - date
 */
export interface LoanRepaymentDraft extends BaseDraft {
    type: 'LOAN_REPAYMENT';

    // Loan Identification
    loanId?: string; // Direct loan reference
    personId?: string; // For AI to identify loan when loanId unknown

    // Repayment Details
    amount?: number;
    cashPoolId?: string;
    date?: Date;
    notes?: string;

    // Extracted Confidence (AI Agent)
    confidenceScores?: {
        loan?: number;
        amount?: number;
        pool?: number;
    };
}

/**
 * Validates loan repayment draft
 */
export function isValidLoanRepaymentDraft(draft: LoanRepaymentDraft): boolean {
    // Must have either loanId or personId
    if (!draft.loanId && !draft.personId) {
        return false;
    }
    // Must have amount
    if (!draft.amount || draft.amount <= 0) {
        return false;
    }
    // Must have cash pool
    if (!draft.cashPoolId) {
        return false;
    }
    return true;
}

/**
 * Gets missing fields for loan repayment draft
 */
export function getMissingFieldsForLoanRepayment(draft: LoanRepaymentDraft): string[] {
    const missing: string[] = [];

    if (!draft.loanId && !draft.personId) {
        missing.push('loan or person');
    }
    if (!draft.amount) {
        missing.push('amount');
    }
    if (!draft.cashPoolId) {
        missing.push('cash pool');
    }
    if (!draft.date) {
        missing.push('date');
    }

    return missing;
}

