import type { Transaction } from '@/domain/entities/Transaction';
import type { ITransactionRepository } from '@/domain/repositories/ITransactionRepository';
import { startOfMonth, endOfMonth } from 'date-fns';

/**
 * Use Case: Get Monthly Spending
 * Calculates total spending for the current month
 */
export class GetMonthlySpending {
    private transactionRepository: ITransactionRepository;

    constructor(transactionRepository: ITransactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    async execute(userId: string): Promise<number> {
        const now = new Date();
        const startDate = startOfMonth(now);
        const endDate = endOfMonth(now);

        const transactions = await this.transactionRepository.getByDateRange(
            userId,
            startDate,
            endDate
        );

        return transactions.reduce((total, t) => total + t.amount, 0);
    }
}
