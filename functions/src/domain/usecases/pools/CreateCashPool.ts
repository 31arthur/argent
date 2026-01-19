import type { CashPool, PoolType } from '../../entities/CashPool';
import type { ICashPoolRepository } from '../../repositories/ICashPoolRepository';

interface CreateCashPoolInput {
    userId: string;
    name: string;
    type: PoolType;
    initialBalance: number;
    currency?: string;
    icon?: string;
    color?: string;
}

/**
 * Use Case: Create Cash Pool
 * Creates a new cash pool for a user
 */
export class CreateCashPool {
    private poolRepository: ICashPoolRepository;

    constructor(poolRepository: ICashPoolRepository) {
        this.poolRepository = poolRepository;
    }

    async execute(input: CreateCashPoolInput): Promise<CashPool> {
        // Validation
        if (!input.name || input.name.trim().length < 2) {
            throw new Error('Pool name must be at least 2 characters');
        }

        if (input.initialBalance < 0) {
            throw new Error('Initial balance cannot be negative');
        }

        // Determine default icon and color based on pool type if not provided
        const getDefaultIcon = (type: PoolType): string => {
            switch (type) {
                case 'bank':
                    return '🏦';
                case 'cash':
                    return '💵';
                case 'digital':
                    return '💳';
                default:
                    return '💰';
            }
        };

        const getDefaultColor = (type: PoolType): string => {
            switch (type) {
                case 'bank':
                    return '#1C4B9B';
                case 'cash':
                    return '#4CAF50';
                case 'digital':
                    return '#2196F3';
                default:
                    return '#666666';
            }
        };

        const pool: Omit<CashPool, 'id' | 'createdAt' | 'updatedAt'> = {
            userId: input.userId,
            name: input.name.trim(),
            type: input.type,
            balance: input.initialBalance,
            initialBalance: input.initialBalance,
            currency: input.currency || 'INR',
            icon: input.icon || getDefaultIcon(input.type),
            color: input.color || getDefaultColor(input.type),
            isActive: true,
        };

        return await this.poolRepository.create(pool);
    }
}


