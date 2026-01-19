import type { BudgetCategory } from '../entities/BudgetCategory';

/**
 * Repository Interface: IBudgetCategoryRepository
 * Defines the contract for budget category allocation operations
 */
export interface IBudgetCategoryRepository {
    /**
     * Get all budget categories for a specific budget
     */
    getByBudgetId(budgetId: string): Promise<BudgetCategory[]>;

    /**
     * Get budget category by ID
     */
    getById(id: string): Promise<BudgetCategory | null>;

    /**
     * Create a new budget category allocation
     */
    create(budgetCategory: Omit<BudgetCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<BudgetCategory>;

    /**
     * Update an existing budget category allocation
     */
    update(id: string, budgetCategory: Partial<BudgetCategory>): Promise<BudgetCategory>;

    /**
     * Delete a budget category allocation
     */
    delete(id: string): Promise<void>;

    /**
     * Delete all budget categories for a specific budget
     * Used when deleting a budget
     */
    deleteByBudgetId(budgetId: string): Promise<void>;

    /**
     * Batch create multiple budget category allocations
     * Useful for carrying forward from previous month
     */
    createMany(budgetCategories: Omit<BudgetCategory, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<BudgetCategory[]>;
}

