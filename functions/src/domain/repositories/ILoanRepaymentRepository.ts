import type { LoanRepayment } from '../entities/Loan';

/**
 * Loan Repayment Repository Interface
 * Manages loan repayment records
 * 
 * RESPONSIBILITIES:
 * - Track individual repayment transactions
 * - Link repayments to loans and transactions
 * - Provide repayment history
 */
export interface ILoanRepaymentRepository {
    /**
     * Get all repayments for a loan
     */
    getAll(loanId: string): Promise<LoanRepayment[]>;

    /**
     * Get repayment by ID
     */
    getById(id: string): Promise<LoanRepayment | null>;

    /**
     * Create a new repayment record
     */
    create(repayment: Omit<LoanRepayment, 'id' | 'createdAt'>): Promise<LoanRepayment>;

    /**
     * Update a repayment record
     */
    update(id: string, repayment: Partial<LoanRepayment>): Promise<LoanRepayment>;

    /**
     * Delete a repayment record
     */
    delete(id: string): Promise<void>;
}

