/**
 * Transaction Data Value Object
 * Represents the fields of a transaction being extracted
 */
export interface TransactionData {
    poolId: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    categoryId: string;
    purpose: string;
    date: Date;
    notes?: string;
    tags?: string[];
}

