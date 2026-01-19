/**
 * Lead Status
 * Represents the current state of a lead
 */
export type LeadStatus = 'OPEN' | 'WON' | 'LOST' | 'CANCELLED';

/**
 * Lead Entity
 * Represents potential future income
 * 
 * INVARIANTS:
 * - Leads are NOT transactions
 * - Never auto-converted to transactions
 * - probability is 0-100
 * - expectedAmount is always positive
 * - title must be non-empty
 */
export interface Lead {
    id: string;
    userId: string;
    title: string; // e.g., "Freelance Project - ABC Corp"
    source?: string; // e.g., "Referral", "Cold Outreach"
    expectedAmount: number; // Potential income amount (always > 0)
    probability: number; // 0-100 (percentage)
    expectedCloseDate?: Date; // When we expect to win/lose
    status: LeadStatus;
    notes?: string;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
    closedAt?: Date; // When status changed to WON/LOST/CANCELLED
}

/**
 * Validates lead data
 */
export function isValidLead(lead: Partial<Lead>): boolean {
    if (!lead.title || lead.title.trim().length === 0) {
        return false;
    }
    if (lead.expectedAmount !== undefined && lead.expectedAmount <= 0) {
        return false;
    }
    if (lead.probability !== undefined && (lead.probability < 0 || lead.probability > 100)) {
        return false;
    }
    return true;
}

/**
 * Checks if lead is closed
 */
export function isLeadClosed(status: LeadStatus): boolean {
    return status === 'WON' || status === 'LOST' || status === 'CANCELLED';
}
