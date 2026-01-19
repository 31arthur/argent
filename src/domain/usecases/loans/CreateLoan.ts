import type { Loan } from '@/domain/entities/Loan';
import type { ILoanRepository } from '@/domain/repositories/ILoanRepository';
import type { IPersonRepository } from '@/domain/repositories/IPersonRepository';

/**
 * Use Case: Create Loan
 * Creates a new loan (borrowed or lent)
 */
export class CreateLoan {
    constructor(
        private loanRepository: ILoanRepository,
        private personRepository: IPersonRepository
    ) { }

    async execute(
        userId: string,
        personId: string,
        direction: 'TAKEN' | 'GIVEN',
        principalAmount: number,
        borrowedDate: Date,
        interestRate?: number,
        expectedRepaymentDate?: Date,
        notes?: string
    ): Promise<Loan> {
        // Validate inputs
        if (principalAmount <= 0) {
            throw new Error('Principal amount must be greater than 0');
        }
        if (interestRate !== undefined && (interestRate < 0 || interestRate > 100)) {
            throw new Error('Interest rate must be between 0 and 100');
        }

        // Verify person exists
        const person = await this.personRepository.getById(personId);
        if (!person) {
            throw new Error('Person not found');
        }
        if (person.userId !== userId) {
            throw new Error('Person does not belong to this user');
        }

        // Create loan
        return await this.loanRepository.create({
            userId,
            personId,
            direction,
            principalAmount,
            interestRate,
            borrowedDate,
            expectedRepaymentDate,
            status: 'ACTIVE',
            notes,
        });
    }
}
