/**
 * Cash Pool Entity
 */
export interface CashPool {
    id: string;
    userId: string;
    name: string;
    balance: number;
    currency: string;
    isActive: boolean;
}

/**
 * Cash Pool Repository Interface
 */
export interface ICashPoolRepository {
    getById(id: string): Promise<CashPool | null>;
    getAll(userId: string): Promise<CashPool[]>;
}
