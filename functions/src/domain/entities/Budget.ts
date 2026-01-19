/**
 * Budget Entity
 * Represents a monthly budget container
 * 
 * INVARIANTS:
 * - One budget per month per user
 * - Budget is a planning tool, not actual money
 * - Categories are allocated through BudgetCategory join entity
 * - month must be 1-12
 * - year must be >= 2000
 */
export interface Budget {
    id: string;
    userId: string;
    month: number; // 1-12
    year: number; // e.g., 2026
    totalPlanned: number; // Total planned budget amount
    totalActual: number; // Total actual spent amount
    name?: string; // Optional custom name
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Composite key helper
 * Creates a unique key for budget lookup
 */
export function getBudgetKey(year: number, month: number): string {
    return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Validates budget month and year
 */
export function isValidBudgetPeriod(year: number, month: number): boolean {
    return year >= 2000 && month >= 1 && month <= 12;
}
