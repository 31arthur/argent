import type { Loan } from '../../entities/Loan';
import type { Transaction } from '../../entities/Transaction';
import type { LoanRepayment } from '../../entities/Loan';
import type { ILoanRepository } from '../../repositories/ILoanRepository';
import type { ITransactionRepository } from '../../repositories/ITransactionRepository';
import type { ILoanRepaymentRepository } from '../../repositories/ILoanRepaymentRepository';
import type { ICashPoolRepository } from '../../repositories/ICashPoolRepository';
import { calculateOutstandingAmount, shouldMarkAsRepaid } from '../../entities/Loan';

/**
 * Use Case: Repay Loan
 * Handles full or partial loan repayments
 * 
 * RESPONSIBILITIES:
 * 1. Validate repayment amount
 * 2. Create expense transaction
 * 3. Create repayment record
 * 4. Update loan totals
 * 5. Auto-update loan status if fully repaid
 * 6. Update cash pool balance
 * 
 * INVARIANTS:
 * - Repayment amount must be > 0
 * - Repayment amount must be <= outstanding amount
 * - Always creates an EXPENSE transaction
 * - Loan status auto-updates to REPAID when outstandingAmount === 0
 * 
 * IDEMPOTENCY:
 * - Each repayment creates a unique transaction
 * - Duplicate calls will create duplicate repayments (by design)
 */
export class RepayLoan {
    constructor(
        private loanRepository: ILoanRepository,
        private transactionRepository: ITransactionRepository,
        private loanRepaymentRepository: ILoanRepaymentRepository,
        private cashPoolRepository: ICashPoolRepository
    ) { }

    async execute(input: {
        userId: string;
        loanId: string;
        amount: number;
        cashPoolId: string;
        categoryId: string; // Category for the expense transaction
        date?: Date;
        notes?: string;
    }): Promise<{
        loan: Loan;
        transaction: Transaction;
        repayment: LoanRepayment;
    }> {
        // 1. Validate loan exists and belongs to user
        const loan = await this.loanRepository.getById(input.loanId);
        if (!loan) {
            throw new Error('Loan not found');
        }
        if (loan.userId !== input.userId) {
            throw new Error('Unauthorized: Loan does not belong to user');
        }

        // 2. Validate repayment amount
        if (input.amount <= 0) {
            throw new Error('Repayment amount must be greater than 0');
        }
        if (input.amount > loan.outstandingAmount) {
            throw new Error(`Repayment amount (${input.amount}) exceeds outstanding amount (${loan.outstandingAmount})`);
        }

        // 3. Validate cash pool exists and belongs to user
        const pool = await this.cashPoolRepository.getById(input.cashPoolId);
        if (!pool) {
            throw new Error('Cash pool not found');
        }
        if (pool.userId !== input.userId) {
            throw new Error('Unauthorized: Cash pool does not belong to user');
        }

        // 4. Create expense transaction
        const transaction = await this.transactionRepository.create({
            userId: input.userId,
            poolId: input.cashPoolId,
            amount: input.amount,
            type: 'EXPENSE',
            categoryId: input.categoryId,
            purpose: `Loan repayment to ${loan.personId}`,
            notes: input.notes,
            date: input.date || new Date(),

            // Link to loan (AI Agent Expansion)
            linkedLoanId: input.loanId,
            isLoanRepayment: true,

            isDeleted: false,
        });

        // 5. Create repayment record
        const repayment = await this.loanRepaymentRepository.create({
            loanId: input.loanId,
            amount: input.amount,
            date: input.date || new Date(),
            linkedTransactionId: transaction.id,
            notes: input.notes,
        });

        // 6. Update loan totals
        const newTotalRepaid = loan.totalRepaid + input.amount;
        const newOutstandingAmount = calculateOutstandingAmount(loan.principalAmount, newTotalRepaid);
        const newStatus = shouldMarkAsRepaid(loan.principalAmount, newTotalRepaid) ? 'REPAID' : loan.status;

        const updatedLoan = await this.loanRepository.update(input.loanId, {
            totalRepaid: newTotalRepaid,
            outstandingAmount: newOutstandingAmount,
            status: newStatus as any,
            actualRepaymentDate: newStatus === 'REPAID' ? new Date() : loan.actualRepaymentDate,
        });

        // 7. Update cash pool balance
        await this.cashPoolRepository.updateBalance(input.cashPoolId, pool.balance - input.amount);

        return {
            loan: updatedLoan,
            transaction,
            repayment,
        };
    }
}
