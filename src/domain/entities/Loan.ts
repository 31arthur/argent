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
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
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
    if (loan.interestRate !== undefined && (loan.interestRate < 0 || loan.interestRate > 100)) {
        return false;
    }
    return true;
}

/**
 * Checks if loan is a liability (user borrowed)
 */
export function isLiability(direction: LoanDirection): boolean {
    return direction === 'TAKEN';
}

/**
 * Checks if loan is a receivable (user lent)
 */
export function isReceivable(direction: LoanDirection): boolean {
    return direction === 'GIVEN';
}
