import type { WorkGroup } from '../entities/WorkGroup';

/**
 * Repository Interface: IWorkGroupRepository
 */
export interface IWorkGroupRepository {
    getAll(): Promise<WorkGroup[]>;
    getById(id: string): Promise<WorkGroup | null>;
}
