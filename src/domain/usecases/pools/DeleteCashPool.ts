import type { ICashPoolRepository } from '@/domain/repositories/ICashPoolRepository';

/**
 * Use Case: Delete Cash Pool
 * Soft deletes a cash pool
 */
export class DeleteCashPool {
    private poolRepository: ICashPoolRepository;

    constructor(poolRepository: ICashPoolRepository) {
        this.poolRepository = poolRepository;
    }

    async execute(id: string): Promise<void> {
        await this.poolRepository.delete(id);
    }
}
