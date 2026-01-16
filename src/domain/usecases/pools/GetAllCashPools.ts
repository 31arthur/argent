import type { CashPool } from '@/domain/entities/CashPool';
import type { ICashPoolRepository } from '@/domain/repositories/ICashPoolRepository';

/**
 * Use Case: Get All Cash Pools
 * Retrieves all active cash pools for a user
 */
export class GetAllCashPools {
    private poolRepository: ICashPoolRepository;

    constructor(poolRepository: ICashPoolRepository) {
        this.poolRepository = poolRepository;
    }

    async execute(userId: string): Promise<CashPool[]> {
        return await this.poolRepository.getAll(userId);
    }
}
