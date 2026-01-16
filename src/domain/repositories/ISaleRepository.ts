import type { Sale } from '../entities/Sale';

/**
 * Repository Interface: ISaleRepository
 */
export interface ISaleRepository {
    getAll(): Promise<Sale[]>;
    getLatest(limit?: number): Promise<Sale[]>;
    getById(id: string): Promise<Sale | null>;
    create(sale: Sale): Promise<Sale>;
}
