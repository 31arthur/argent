import type { Commission } from '@/domain/entities/Commission';
import type { ICommissionRepository } from '@/domain/repositories/ICommissionRepository';
import { MockCommissionDataSource } from '../datasources/MockCommissionDataSource';

/**
 * Concrete Repository Implementation: CommissionRepository
 */
export class CommissionRepository implements ICommissionRepository {
    private dataSource: MockCommissionDataSource;

    constructor(dataSource: MockCommissionDataSource) {
        this.dataSource = dataSource;
    }

    async getAll(): Promise<Commission[]> {
        return await this.dataSource.getAll();
    }

    async getOngoing(): Promise<Commission[]> {
        return await this.dataSource.getOngoing();
    }

    async getById(id: string): Promise<Commission | null> {
        return await this.dataSource.getById(id);
    }

    async create(commission: Commission): Promise<Commission> {
        return await this.dataSource.create(commission);
    }

    async update(id: string, commission: Partial<Commission>): Promise<Commission> {
        const updated = await this.dataSource.update(id, commission);
        if (!updated) {
            throw new Error(`Commission with id ${id} not found`);
        }
        return updated;
    }
}
