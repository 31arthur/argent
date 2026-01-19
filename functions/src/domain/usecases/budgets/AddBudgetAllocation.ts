import type { Budget } from '../../entities/Budget';
import type { BudgetCategory } from '../../entities/BudgetCategory';
import type { IBudgetRepository } from '../../repositories/IBudgetRepository';
import type { IBudgetCategoryRepository } from '../../repositories/IBudgetCategoryRepository';
import type { ICategoryRepository } from '../../repositories/ICategoryRepository';
import { getBudgetKey } from '../../entities/Budget';

/**
 * Use Case: Add Budget Allocation
 * Sets or updates planned amount for a category in a specific month
 * 
 * RESPONSIBILITIES:
 * 1. Get or create budget for month/year
 * 2. Validate category exists and belongs to user
 * 3. Create or update budget category allocation
 * 4. Return both budget and allocation
 * 
 * INVARIANTS:
 * - Month must be 1-12
 * - Year must be >= current year - 1
 * - Planned amount must be >= 0
 * - Category must exist and belong to user
 * 
 * IDEMPOTENCY:
 * - If allocation exists, it will be updated
 * - If budget doesn't exist, it will be created
 */
export class AddBudgetAllocation {
    constructor(
        private budgetRepository: IBudgetRepository,
        private budgetCategoryRepository: IBudgetCategoryRepository,
        private categoryRepository: ICategoryRepository
    ) { }

    async execute(input: {
        userId: string;
        month: number;
        year: number;
        categoryId: string;
        plannedAmount: number;
    }): Promise<{
        budget: Budget;
        allocation: BudgetCategory;
    }> {
        // 1. Validate month and year
        if (input.month < 1 || input.month > 12) {
            throw new Error('Month must be between 1 and 12');
        }
        const currentYear = new Date().getFullYear();
        if (input.year < currentYear - 1) {
            throw new Error(`Year must be >= ${currentYear - 1}`);
        }

        // 2. Validate planned amount
        if (input.plannedAmount < 0) {
            throw new Error('Planned amount must be >= 0');
        }

        // 3. Validate category exists and belongs to user
        const category = await this.categoryRepository.getById(input.categoryId);
        if (!category) {
            throw new Error('Category not found');
        }
        if (category.userId !== input.userId) {
            throw new Error('Unauthorized: Category does not belong to user');
        }

        // 4. Get or create budget for month/year
        const budgetKey = getBudgetKey(input.month, input.year);
        let budget = await this.budgetRepository.getByMonthYear(input.userId, input.month, input.year);

        if (!budget) {
            // Create new budget
            budget = await this.budgetRepository.create({
                userId: input.userId,
                month: input.month,
                year: input.year,
                totalPlanned: input.plannedAmount,
                totalActual: 0,
            });
        }

        // 5. Check if allocation already exists
        const existingAllocations = await this.budgetCategoryRepository.getByBudgetId(budget.id);
        const existingAllocation = existingAllocations.find(a => a.categoryId === input.categoryId);

        let allocation: BudgetCategory;

        if (existingAllocation) {
            // Update existing allocation
            allocation = await this.budgetCategoryRepository.update(existingAllocation.id, {
                plannedAmount: input.plannedAmount,
            });
        } else {
            // Create new allocation
            allocation = await this.budgetCategoryRepository.create({
                budgetId: budget.id,
                categoryId: input.categoryId,
                plannedAmount: input.plannedAmount,
                actualAmount: 0,
            });
        }

        // 6. Update budget total planned amount
        const allAllocations = await this.budgetCategoryRepository.getByBudgetId(budget.id);
        const totalPlanned = allAllocations.reduce((sum, a) => sum + a.plannedAmount, 0);

        budget = await this.budgetRepository.update(budget.id, {
            totalPlanned,
        });

        return {
            budget,
            allocation,
        };
    }
}


