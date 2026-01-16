import type { ITransactionRepository } from '@/domain/repositories/ITransactionRepository';
import { startOfDay, endOfDay } from 'date-fns';

/**
 * Use Case: Get Daily Spending
 * Calculates total spending for today
 */
export class GetDailySpending {
    private transactionRepository: ITransactionRepository;

    constructor(transactionRepository: ITransactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    async execute(userId: string): Promise<number> {
        const now = new Date();
        const startDate = startOfDay(now);
        const endDate = endOfDay(now);

        const transactions = await this.transactionRepository.getByDateRange(
            userId,
            startDate,
            endDate
        );

        return transactions.reduce((total, t) => total + t.amount, 0);
    }
}
