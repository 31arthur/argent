import type { Sale } from '../entities/Sale';
import type { ISaleRepository } from '../repositories/ISaleRepository';

/**
 * Use Case: Get Latest Sales
 */
export class GetLatestSales {
    private saleRepository: ISaleRepository;

    constructor(saleRepository: ISaleRepository) {
        this.saleRepository = saleRepository;
    }

    async execute(limit: number = 10): Promise<Sale[]> {
        return await this.saleRepository.getLatest(limit);
    }
}
