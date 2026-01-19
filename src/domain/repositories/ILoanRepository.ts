import type { Loan, LoanDirection, LoanStatus } from '../entities/Loan';

/**
 * Repository Interface: ILoanRepository
 * Defines the contract for loan data operations
 */
export interface ILoanRepository {
    /**
     * Get all loans for a user
     */
    getAll(userId: string): Promise<Loan[]>;

    /**
     * Get loan by ID
     */
    getById(id: string): Promise<Loan | null>;

    /**
     * Get all loans for a specific person
     */
    getByPersonId(personId: string): Promise<Loan[]>;

    /**
     * Get loans by direction (TAKEN or GIVEN)
     */
    getByDirection(userId: string, direction: LoanDirection): Promise<Loan[]>;

    /**
     * Get loans by status
     */
    getByStatus(userId: string, status: LoanStatus): Promise<Loan[]>;

    /**
     * Create a new loan
     */
    create(loan: Omit<Loan, 'id' | 'createdAt' | 'updatedAt'>): Promise<Loan>;

    /**
     * Update an existing loan
     */
    update(id: string, loan: Partial<Loan>): Promise<Loan>;

    /**
     * Delete a loan
     */
    delete(id: string): Promise<void>;
}
