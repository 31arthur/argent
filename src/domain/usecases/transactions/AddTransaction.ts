import type { Transaction, TransactionType } from '@/domain/entities/Transaction';
import type { ITransactionRepository } from '@/domain/repositories/ITransactionRepository';
import type { ICashPoolRepository } from '@/domain/repositories/ICashPoolRepository';

interface AddTransactionInput {
    userId: string;
    poolId: string;
    amount: number;
    type: TransactionType;
    categoryId: string;
    purpose: string;
    notes?: string;
    tags?: string[];
    date?: Date;
}

/**
 * Use Case: Add Transaction
 * Creates a new transaction and updates pool balance
 */
export class AddTransaction {
    private transactionRepository: ITransactionRepository;
    private poolRepository: ICashPoolRepository;

    constructor(
        transactionRepository: ITransactionRepository,
        poolRepository: ICashPoolRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.poolRepository = poolRepository;
    }

    async execute(input: AddTransactionInput): Promise<Transaction> {
        // Validation
        if (input.amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }

        if (!input.purpose || input.purpose.trim().length < 3) {
            throw new Error('Purpose must be at least 3 characters');
        }

        // Get pool to verify it exists and has sufficient balance
        const pool = await this.poolRepository.getById(input.poolId);
        if (!pool) {
            throw new Error('Cash pool not found');
        }

        if (pool.balance < input.amount) {
            throw new Error('Insufficient balance in cash pool');
        }

        // Create transaction
        const transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
            userId: input.userId,
            poolId: input.poolId,
            amount: input.amount,
            type: input.type,
            categoryId: input.categoryId,
            purpose: input.purpose.trim(),
            notes: input.notes?.trim(),
            tags: input.tags || [],
            date: input.date || new Date(),
            isDeleted: false,
        };

        const created = await this.transactionRepository.create(transaction);

        // Update pool balance
        const newBalance = pool.balance - input.amount;
        await this.poolRepository.updateBalance(pool.id, newBalance);

        return created;
    }
}
