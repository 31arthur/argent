import type { CashPool } from '../../entities/CashPool';
import type { ICashPoolRepository } from '../../repositories/ICashPoolRepository';

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


