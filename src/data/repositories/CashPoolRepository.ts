import type { CashPool } from '@/domain/entities/CashPool';
import type { ICashPoolRepository } from '@/domain/repositories/ICashPoolRepository';
import { FirebaseCashPoolDataSource } from '../firebase/cashpool';

/**
 * Cash Pool Repository Implementation
 * Implements ICashPoolRepository using Firestore
 */
export class CashPoolRepository implements ICashPoolRepository {
    private dataSource: FirebaseCashPoolDataSource;

    constructor() {
        this.dataSource = new FirebaseCashPoolDataSource();
    }

    async getAll(userId: string): Promise<CashPool[]> {
        return await this.dataSource.getAll(userId);
    }

    async getById(id: string): Promise<CashPool | null> {
        return await this.dataSource.getById(id);
    }

    async create(pool: Omit<CashPool, 'id' | 'createdAt' | 'updatedAt'>): Promise<CashPool> {
        return await this.dataSource.create(pool);
    }

    async update(id: string, pool: Partial<CashPool>): Promise<CashPool> {
        return await this.dataSource.update(id, pool);
    }

    async delete(id: string): Promise<void> {
        await this.dataSource.delete(id);
    }

    async updateBalance(id: string, amount: number): Promise<void> {
        await this.dataSource.updateBalance(id, amount);
    }
}
