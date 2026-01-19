import type { CashPool } from '../../entities/CashPool';
import type { ICashPoolRepository } from '../../repositories/ICashPoolRepository';

/**
 * Use Case: Update Cash Pool
 * Updates an existing cash pool
 */
export class UpdateCashPool {
    private poolRepository: ICashPoolRepository;

    constructor(poolRepository: ICashPoolRepository) {
        this.poolRepository = poolRepository;
    }

    async execute(id: string, updates: Partial<CashPool>): Promise<CashPool> {
        // Validation
        if (updates.name && updates.name.trim().length < 2) {
            throw new Error('Pool name must be at least 2 characters');
        }

        return await this.poolRepository.update(id, updates);
    }
}


