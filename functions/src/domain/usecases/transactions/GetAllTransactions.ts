import type { Transaction } from '../../entities/Transaction';
import type { ITransactionRepository } from '../../repositories/ITransactionRepository';

/**
 * Use Case: Get All Transactions
 * Retrieves all non-deleted transactions for a user
 */
export class GetAllTransactions {
    private transactionRepository: ITransactionRepository;

    constructor(transactionRepository: ITransactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    async execute(userId: string): Promise<Transaction[]> {
        return await this.transactionRepository.getAll(userId);
    }
}


