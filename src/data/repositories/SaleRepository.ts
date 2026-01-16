import type { Sale } from '@/domain/entities/Sale';
import type { ISaleRepository } from '@/domain/repositories/ISaleRepository';
import { MockSaleDataSource } from '../datasources/MockSaleDataSource';

/**
 * Concrete Repository Implementation: SaleRepository
 */
export class SaleRepository implements ISaleRepository {
    private dataSource: MockSaleDataSource;

    constructor(dataSource: MockSaleDataSource) {
        this.dataSource = dataSource;
    }

    async getAll(): Promise<Sale[]> {
        return await this.dataSource.getAll();
    }

    async getLatest(limit?: number): Promise<Sale[]> {
        return await this.dataSource.getLatest(limit);
    }

    async getById(id: string): Promise<Sale | null> {
        return await this.dataSource.getById(id);
    }

    async create(sale: Sale): Promise<Sale> {
        return await this.dataSource.create(sale);
    }
}
