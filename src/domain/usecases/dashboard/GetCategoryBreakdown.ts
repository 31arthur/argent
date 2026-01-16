import type { ITransactionRepository } from '@/domain/repositories/ITransactionRepository';
import type { ICategoryRepository } from '@/domain/repositories/ICategoryRepository';
import type { TransactionType } from '@/domain/entities/Transaction';

interface CategorySpending {
    categoryId: string;
    categoryKey: string;      // Category key (e.g., "food")
    categoryType: TransactionType;  // INCOME or EXPENSE
    icon: string;
    color: string;
    amount: number;
    percentage: number;
}

/**
 * Use Case: Get Category Breakdown
 * Calculates spending by category
 */
export class GetCategoryBreakdown {
    private transactionRepository: ITransactionRepository;
    private categoryRepository: ICategoryRepository;

    constructor(
        transactionRepository: ITransactionRepository,
        categoryRepository: ICategoryRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
    }

    async execute(userId: string): Promise<CategorySpending[]> {
        const [transactions, categories] = await Promise.all([
            this.transactionRepository.getAll(userId),
            this.categoryRepository.getAll(userId),
        ]);

        // Calculate total spending
        const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);

        // Group by category
        const categoryMap = new Map<string, number>();
        transactions.forEach((t) => {
            const current = categoryMap.get(t.categoryId) || 0;
            categoryMap.set(t.categoryId, current + t.amount);
        });

        // Build result
        const result: CategorySpending[] = [];
        categoryMap.forEach((amount, categoryId) => {
            const category = categories.find((c) => c.id === categoryId);
            if (category) {
                result.push({
                    categoryId,
                    categoryKey: category.key,
                    categoryType: category.type,
                    icon: category.icon,
                    color: category.color,
                    amount,
                    percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
                });
            }
        });

        // Sort by amount descending
        return result.sort((a, b) => b.amount - a.amount);
    }
}
