/**
 * Loan Direction
 * - TAKEN: User borrowed money (liability)
 * - GIVEN: User lent money (receivable)
 */
export type LoanDirection = 'TAKEN' | 'GIVEN';

/**
 * Loan Status
 * Represents the current state of a loan
 */
export type LoanStatus = 'ACTIVE' | 'REPAID' | 'DEFAULTED';

/**
 * Loan Entity
 * Represents money borrowed or lent
 * 
 * INVARIANTS:
 * - Always references a Person
 * - direction determines if it's a liability or receivable
 * - principalAmount is always positive
 * - No automatic transaction creation
 * - No balance tracking yet (future enhancement)
 * - interestRate is annual percentage (0-100)
 */
export interface Loan {
    id: string;
    userId: string;
    personId: string; // Reference to Person
    direction: LoanDirection; // TAKEN or GIVEN
    principalAmount: number; // Original loan amount (always > 0)
    interestRate?: number; // Annual interest rate (percentage, 0-100)
    borrowedDate: Date; // When loan was taken/given
    expectedRepaymentDate?: Date;
    actualRepaymentDate?: Date;
    status: LoanStatus;
    totalRepaid: number; // Total amount repaid so far
    outstandingAmount: number; // Outstanding amount remaining
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
}

/**
 * Loan Repayment Record
 * Represents a single repayment towards a loan
 */
export interface LoanRepayment {
    id: string;
    loanId: string;
    amount: number;
    date: Date;
    linkedTransactionId?: string; // Optional link to transaction
    notes?: string;
    createdAt: Date;
}

/**
 * Validates loan data
 */
export function isValidLoan(loan: Partial<Loan>): boolean {
    if (!loan.personId) {
        return false;
    }
    if (loan.principalAmount !== undefined && loan.principalAmount <= 0) {
        return false;
    }
    if (loan.totalRepaid !== undefined && loan.totalRepaid < 0) {
        return false;
    }
    if (loan.principalAmount !== undefined && loan.totalRepaid !== undefined && loan.totalRepaid > loan.principalAmount) {
        return false;
    }
    if (loan.interestRate !== undefined && (loan.interestRate < 0 || loan.interestRate > 100)) {
        return false;
    }
    return true;
}

/**
 * Checks if loan is a liability (user borrowed)
 */
export function isLiability(loan: Loan): boolean {
    return loan.direction === 'TAKEN';
}

/**
 * Checks if loan is a receivable (user lent)
 */
export function isReceivable(loan: Loan): boolean {
    return loan.direction === 'GIVEN';
}

/**
 * Calculates outstanding amount for a loan
 */
export function calculateOutstandingAmount(principalAmount: number, totalRepaid: number): number {
    return Math.max(0, principalAmount - totalRepaid);
}

/**
 * Checks if loan should be marked as repaid
 */
export function shouldMarkAsRepaid(principalAmount: number, totalRepaid: number): boolean {
    return totalRepaid >= principalAmount;
}
