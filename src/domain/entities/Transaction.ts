/**
 * Transaction Type
 * Determines the direction of money flow
 * - INCOME: Money flows INTO the cash pool (increases balance)
 * - EXPENSE: Money flows OUT of the cash pool (decreases balance)
 */
export type TransactionType = 'INCOME' | 'EXPENSE';

/**
 * Domain Entity: Transaction
 * Represents a single financial transaction
 * 
 * INVARIANTS:
 * - amount is always positive (direction is determined by type)
 * - type determines whether money flows in or out
 * - purpose must be non-empty (min 3 characters)
 * - date cannot be in the future
 */
export interface Transaction {
    id: string;
    userId: string;
    poolId: string; // Reference to CashPool
    amount: number; // Always positive - direction determined by type
    type: TransactionType; // INCOME or EXPENSE
    categoryId: string;
    purpose: string;
    notes?: string;
    tags?: string[];
    date: Date;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean; // Soft delete
    deletedAt?: Date;
}
