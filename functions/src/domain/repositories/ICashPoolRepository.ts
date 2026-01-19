import type { CashPool } from '../entities/CashPool';

/**
 * Repository Interface: ICashPoolRepository
 * Defines the contract for cash pool data operations
 */
export interface ICashPoolRepository {
    getAll(userId: string): Promise<CashPool[]>;
    getById(id: string): Promise<CashPool | null>;
    create(pool: Omit<CashPool, 'id' | 'createdAt' | 'updatedAt'>): Promise<CashPool>;
    update(id: string, pool: Partial<CashPool>): Promise<CashPool>;
    delete(id: string): Promise<void>;
    updateBalance(id: string, amount: number): Promise<void>;
}

