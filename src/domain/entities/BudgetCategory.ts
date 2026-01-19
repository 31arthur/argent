/**
 * BudgetCategory Entity
 * Join entity between Budget and Category
 * Represents the planned allocation for a category in a specific month
 * 
 * INVARIANTS:
 * - One allocation per category per budget
 * - plannedAmount is always >= 0
 * - Categories are referenced, never duplicated
 * - budgetId and categoryId must reference existing entities
 */
export interface BudgetCategory {
    id: string;
    budgetId: string; // Reference to Budget
    categoryId: string; // Reference to Category
    plannedAmount: number; // Allocated budget for this category (always >= 0)
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Validates budget category data
 */
export function isValidBudgetCategory(budgetCategory: Partial<BudgetCategory>): boolean {
    if (!budgetCategory.budgetId || !budgetCategory.categoryId) {
        return false;
    }
    if (budgetCategory.plannedAmount !== undefined && budgetCategory.plannedAmount < 0) {
        return false;
    }
    return true;
}
