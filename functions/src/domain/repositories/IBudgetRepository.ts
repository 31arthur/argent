import type { Budget } from '../entities/Budget';

/**
 * Repository Interface: IBudgetRepository
 * Defines the contract for budget data operations
 */
export interface IBudgetRepository {
    /**
     * Get all budgets for a user
     */
    getAll(userId: string): Promise<Budget[]>;

    /**
     * Get budget by ID
     */
    getById(id: string): Promise<Budget | null>;

    /**
     * Get budget for a specific month and year
     * Returns null if no budget exists for that period
     */
    getByMonthYear(userId: string, year: number, month: number): Promise<Budget | null>;

    /**
     * Get all budgets for a specific year
     */
    getByYear(userId: string, year: number): Promise<Budget[]>;

    /**
     * Create a new budget
     */
    create(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Budget>;

    /**
     * Update an existing budget
     */
    update(id: string, budget: Partial<Budget>): Promise<Budget>;

    /**
     * Delete a budget
     * Note: Should also delete associated BudgetCategories
     */
    delete(id: string): Promise<void>;
}

