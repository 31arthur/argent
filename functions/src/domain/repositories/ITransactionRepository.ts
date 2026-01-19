import type { Transaction } from '../entities/Transaction';

/**
 * Repository Interface: ITransactionRepository
 * Defines the contract for transaction data operations
 */
export interface ITransactionRepository {
    getAll(userId: string): Promise<Transaction[]>;
    getById(id: string): Promise<Transaction | null>;
    getByPool(poolId: string): Promise<Transaction[]>;
    getByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]>;
    getByCategory(userId: string, categoryId: string): Promise<Transaction[]>;
    search(userId: string, query: string): Promise<Transaction[]>;
    create(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction>;
    update(id: string, transaction: Partial<Transaction>): Promise<Transaction>;
    softDelete(id: string): Promise<void>;
    permanentDelete(id: string): Promise<void>;
}

