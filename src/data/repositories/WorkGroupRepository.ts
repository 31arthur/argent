import type { WorkGroup } from '@/domain/entities/WorkGroup';
import type { IWorkGroupRepository } from '@/domain/repositories/IWorkGroupRepository';
import { MockWorkGroupDataSource } from '../datasources/MockWorkGroupDataSource';

/**
 * Concrete Repository Implementation: WorkGroupRepository
 */
export class WorkGroupRepository implements IWorkGroupRepository {
    private dataSource: MockWorkGroupDataSource;

    constructor(dataSource: MockWorkGroupDataSource) {
        this.dataSource = dataSource;
    }

    async getAll(): Promise<WorkGroup[]> {
        return await this.dataSource.getAll();
    }

    async getById(id: string): Promise<WorkGroup | null> {
        return await this.dataSource.getById(id);
    }
}
