/**
 * Transaction Type
 * Categorizes transactions as personal or office expenses
 */
export type TransactionType = 'personal' | 'office';

/**
 * Domain Entity: Transaction
 * Represents a single expense transaction
 */
export interface Transaction {
    id: string;
    userId: string;
    poolId: string; // Reference to CashPool
    amount: number;
    type: TransactionType;
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
