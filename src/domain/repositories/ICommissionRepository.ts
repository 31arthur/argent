import type { Commission } from '../entities/Commission';

/**
 * Repository Interface: ICommissionRepository
 */
export interface ICommissionRepository {
    getAll(): Promise<Commission[]>;
    getOngoing(): Promise<Commission[]>;
    getById(id: string): Promise<Commission | null>;
    create(commission: Commission): Promise<Commission>;
    update(id: string, commission: Partial<Commission>): Promise<Commission>;
}
