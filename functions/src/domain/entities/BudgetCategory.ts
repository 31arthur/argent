/**
 * Budget Category Entity
 * Join/Allocation entity connecting Budget and Category
 * Represents a planned amount for a specific category in a budget period
 */
export interface BudgetCategory {
    id: string;
    budgetId: string;
    categoryId: string;
    plannedAmount: number;
    actualAmount: number; // Actual spent amount for this category
    createdAt: Date;
    updatedAt: Date;
}
