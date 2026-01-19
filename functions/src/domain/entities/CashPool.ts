/**
 * Cash Pool Type
 * Represents different types of fund sources
 */
export type PoolType = 'bank' | 'cash' | 'digital';

/**
 * Domain Entity: CashPool
 * Represents a fund source (bank account, cash holder, digital wallet)
 */
export interface CashPool {
    id: string;
    userId: string;
    name: string;
    type: PoolType;
    balance: number;
    initialBalance: number;
    currency: string;
    icon?: string;
    color?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastTransactionAt?: Date;
}

