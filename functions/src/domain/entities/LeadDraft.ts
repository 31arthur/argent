import type { BaseDraft } from './DraftType';

/**
 * Lead Draft
 * Represents a draft for creating a potential income opportunity
 * 
 * INVARIANTS:
 * - title must be non-empty
 * - expectedAmount must be > 0
 * - probability must be 0-100
 * - expectedCloseDate should be in the future
 * 
 * REQUIRED FIELDS:
 * - title
 * - expectedAmount
 */
export interface LeadDraft extends BaseDraft {
    type: 'LEAD';

    // Lead Details
    title?: string;
    expectedAmount?: number;
    probability?: number; // 0-100
    source?: string;
    expectedCloseDate?: Date;
    notes?: string;

    // Extracted Confidence (AI Agent)
    confidenceScores?: {
        title?: number;
        amount?: number;
        probability?: number;
        date?: number;
    };
}

/**
 * Validates lead draft
 */
export function isValidLeadDraft(draft: LeadDraft): boolean {
    if (!draft.title || draft.title.trim().length === 0) {
        return false;
    }
    if (!draft.expectedAmount || draft.expectedAmount <= 0) {
        return false;
    }
    if (draft.probability !== undefined && (draft.probability < 0 || draft.probability > 100)) {
        return false;
    }
    return true;
}

/**
 * Gets missing fields for lead draft
 */
export function getMissingFieldsForLead(draft: LeadDraft): string[] {
    const missing: string[] = [];

    if (!draft.title) {
        missing.push('title');
    }
    if (!draft.expectedAmount) {
        missing.push('expected amount');
    }
    if (draft.probability === undefined) {
        missing.push('probability');
    }

    return missing;
}

