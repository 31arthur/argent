import type { Transaction } from '@/domain/entities/Transaction';
import type { ITransactionRepository } from '@/domain/repositories/ITransactionRepository';
import { FirebaseTransactionDataSource } from '../firebase/transaction';

/**
 * Transaction Repository Implementation
 * Implements ITransactionRepository using Firestore
 */
export class TransactionRepository implements ITransactionRepository {
    private dataSource: FirebaseTransactionDataSource;

    constructor() {
        this.dataSource = new FirebaseTransactionDataSource();
    }

    async getAll(userId: string): Promise<Transaction[]> {
        return await this.dataSource.getAll(userId);
    }

    async getById(id: string): Promise<Transaction | null> {
        return await this.dataSource.getById(id);
    }

    async getByPool(poolId: string): Promise<Transaction[]> {
        return await this.dataSource.getByPool(poolId);
    }

    async getByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
        return await this.dataSource.getByDateRange(userId, startDate, endDate);
    }

    async getByCategory(userId: string, categoryId: string): Promise<Transaction[]> {
        return await this.dataSource.getByCategory(userId, categoryId);
    }

    async search(userId: string, query: string): Promise<Transaction[]> {
        return await this.dataSource.search(userId, query);
    }

    async create(
        transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<Transaction> {
        return await this.dataSource.create(transaction);
    }

    async update(id: string, transaction: Partial<Transaction>): Promise<Transaction> {
        return await this.dataSource.update(id, transaction);
    }

    async softDelete(id: string): Promise<void> {
        await this.dataSource.softDelete(id);
    }

    async permanentDelete(_id: string): Promise<void> {
        // For now, we only support soft delete
        throw new Error('Permanent delete not implemented');
    }
}
