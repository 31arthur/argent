import type { ITransactionRepository } from '../../repositories/ITransactionRepository';
import type { ICashPoolRepository } from '../../repositories/ICashPoolRepository';

/**
 * Use Case: Delete Transaction
 * Soft deletes a transaction and restores pool balance
 */
export class DeleteTransaction {
    private transactionRepository: ITransactionRepository;
    private poolRepository: ICashPoolRepository;

    constructor(
        transactionRepository: ITransactionRepository,
        poolRepository: ICashPoolRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.poolRepository = poolRepository;
    }

    async execute(id: string): Promise<void> {
        // Get transaction to restore balance
        const transaction = await this.transactionRepository.getById(id);
        if (!transaction) {
            throw new Error('Transaction not found');
        }

        if (transaction.isDeleted) {
            throw new Error('Transaction already deleted');
        }

        // Soft delete transaction
        await this.transactionRepository.softDelete(id);

        // Restore pool balance
        const pool = await this.poolRepository.getById(transaction.poolId);
        if (pool) {
            const newBalance = pool.balance + transaction.amount;
            await this.poolRepository.updateBalance(pool.id, newBalance);
        }
    }
}


