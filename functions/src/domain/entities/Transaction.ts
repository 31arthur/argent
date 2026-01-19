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

    // Person Payment Support (AI Agent Expansion)
    payeeType?: 'PERSON' | 'NONE'; // Who received the money (for expenses)
    payeeId?: string; // Person ID when payeeType === 'PERSON'

    // Loan Linkage (AI Agent Expansion)
    linkedLoanId?: string; // Reference to Loan if this is a repayment
    isLoanRepayment?: boolean; // True if this transaction is a loan repayment

    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean; // Soft delete
    deletedAt?: Date;
}

/**
 * Validates transaction invariants
 */
export function isValidTransaction(transaction: Partial<Transaction>): boolean {
    if (transaction.amount !== undefined && transaction.amount <= 0) {
        return false;
    }
    if (transaction.purpose && transaction.purpose.trim().length < 3) {
        return false;
    }
    // If payeeType is PERSON, payeeId must be provided
    if (transaction.payeeType === 'PERSON' && !transaction.payeeId) {
        return false;
    }
    // If isLoanRepayment is true, linkedLoanId must be provided
    if (transaction.isLoanRepayment && !transaction.linkedLoanId) {
        return false;
    }
    return true;
}

