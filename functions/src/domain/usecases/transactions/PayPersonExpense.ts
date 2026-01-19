import type { Transaction } from '../../entities/Transaction';
import type { ITransactionRepository } from '../../repositories/ITransactionRepository';
import type { IPersonRepository } from '../../repositories/IPersonRepository';
import type { ICashPoolRepository } from '../../repositories/ICashPoolRepository';

/**
 * Use Case: Pay Person Expense
 * Creates an expense transaction linked to a person
 * 
 * RESPONSIBILITIES:
 * 1. Validate person exists and belongs to user
 * 2. Validate cash pool exists and has sufficient balance
 * 3. Create expense transaction with person linkage
 * 4. Update cash pool balance
 * 
 * IMPORTANT:
 * - This does NOT create a loan
 * - This is for regular expenses paid to a person (e.g., driver, vendor)
 * - Category determines the nature of the expense
 * 
 * INVARIANTS:
 * - Person must exist and belong to user
 * - Amount must be > 0
 * - Cash pool must have sufficient balance
 * - Always creates EXPENSE transaction
 */
export class PayPersonExpense {
    constructor(
        private transactionRepository: ITransactionRepository,
        private personRepository: IPersonRepository,
        private cashPoolRepository: ICashPoolRepository
    ) { }

    async execute(input: {
        userId: string;
        personId: string;
        amount: number;
        categoryId: string;
        poolId: string;
        purpose: string;
        date?: Date;
        notes?: string;
    }): Promise<Transaction> {
        // 1. Validate person exists and belongs to user
        const person = await this.personRepository.getById(input.personId);
        if (!person) {
            throw new Error('Person not found');
        }
        if (person.userId !== input.userId) {
            throw new Error('Unauthorized: Person does not belong to user');
        }

        // 2. Validate amount
        if (input.amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }

        // 3. Validate cash pool
        const pool = await this.cashPoolRepository.getById(input.poolId);
        if (!pool) {
            throw new Error('Cash pool not found');
        }
        if (pool.userId !== input.userId) {
            throw new Error('Unauthorized: Cash pool does not belong to user');
        }
        if (pool.balance < input.amount) {
            throw new Error(`Insufficient balance in ${pool.name}. Available: ${pool.balance}, Required: ${input.amount}`);
        }

        // 4. Create expense transaction with person linkage
        const transaction = await this.transactionRepository.create({
            userId: input.userId,
            poolId: input.poolId,
            amount: input.amount,
            type: 'EXPENSE',
            categoryId: input.categoryId,
            purpose: input.purpose,
            notes: input.notes,
            date: input.date || new Date(),

            // Person payment linkage (AI Agent Expansion)
            payeeType: 'PERSON',
            payeeId: input.personId,

            isDeleted: false,
        });

        // 5. Update cash pool balance
        await this.cashPoolRepository.update(input.poolId, {
            balance: pool.balance - input.amount,
        });

        return transaction;
    }
}


