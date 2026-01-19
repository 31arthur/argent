import type { Budget } from '@/domain/entities/Budget';
import type { IBudgetRepository } from '@/domain/repositories/IBudgetRepository';

/**
 * Use Case: Create Budget
 * Creates a new monthly budget for the user
 */
export class CreateBudget {
    constructor(private budgetRepository: IBudgetRepository) { }

    async execute(
        userId: string,
        month: number,
        year: number,
        name?: string,
        notes?: string
    ): Promise<Budget> {
        // Validate month and year
        if (month < 1 || month > 12) {
            throw new Error('Month must be between 1 and 12');
        }
        if (year < 2000) {
            throw new Error('Year must be 2000 or later');
        }

        // Check if budget already exists for this month/year
        const existing = await this.budgetRepository.getByMonthYear(userId, year, month);
        if (existing) {
            throw new Error(`Budget already exists for ${month}/${year}`);
        }

        // Create budget
        return await this.budgetRepository.create({
            userId,
            month,
            year,
            name,
            notes,
        });
    }
}
