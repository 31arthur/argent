import type { Transaction } from '@/domain/entities/Transaction';
import type { ITransactionRepository } from '@/domain/repositories/ITransactionRepository';

/**
 * Use Case: Get Recent Transactions
 * Retrieves the most recent transactions
 */
export class GetRecentTransactions {
    private transactionRepository: ITransactionRepository;

    constructor(transactionRepository: ITransactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    async execute(userId: string, limit: number = 5): Promise<Transaction[]> {
        const allTransactions = await this.transactionRepository.getAll(userId);
        return allTransactions.slice(0, limit);
    }
}
