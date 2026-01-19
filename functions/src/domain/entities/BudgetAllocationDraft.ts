import type { BaseDraft } from './DraftType';

/**
 * Budget Allocation Draft
 * Represents a draft for setting/updating a budget allocation for a category in a specific month
 * 
 * INVARIANTS:
 * - month must be 1-12
 * - year must be >= current year - 1
 * - plannedAmount must be >= 0
 * - categoryId must reference a valid category
 * 
 * REQUIRED FIELDS:
 * - month
 * - year
 * - categoryId
 * - plannedAmount
 */
export interface BudgetAllocationDraft extends BaseDraft {
    type: 'BUDGET_ALLOCATION';

    // Budget Details
    month?: number; // 1-12
    year?: number;
    categoryId?: string;
    plannedAmount?: number;

    // Extracted Confidence (AI Agent)
    confidenceScores?: {
        month?: number;
        year?: number;
        category?: number;
        amount?: number;
    };
}

/**
 * Validates budget allocation draft
 */
export function isValidBudgetAllocationDraft(draft: BudgetAllocationDraft): boolean {
    if (!draft.month || draft.month < 1 || draft.month > 12) {
        return false;
    }
    if (!draft.year || draft.year < new Date().getFullYear() - 1) {
        return false;
    }
    if (!draft.categoryId) {
        return false;
    }
    if (draft.plannedAmount === undefined || draft.plannedAmount < 0) {
        return false;
    }
    return true;
}

/**
 * Gets missing fields for budget allocation draft
 */
export function getMissingFieldsForBudgetAllocation(draft: BudgetAllocationDraft): string[] {
    const missing: string[] = [];

    if (!draft.month) {
        missing.push('month');
    }
    if (!draft.year) {
        missing.push('year');
    }
    if (!draft.categoryId) {
        missing.push('category');
    }
    if (draft.plannedAmount === undefined) {
        missing.push('planned amount');
    }

    return missing;
}

