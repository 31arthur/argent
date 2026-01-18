import { TransactionDraft } from '../entities/TransactionDraft';
import { SelectableOption } from '../entities/SelectableOption';
import { ICashPoolRepository } from '../repositories/ICashPoolRepository';
import { ICategoryRepository } from '../repositories/ICategoryRepository';

/**
 * Clarification Question
 */
export interface ClarificationQuestion {
    field: string;
    question: string;
    options?: SelectableOption[];
}

/**
 * Clarification Strategy Service
 * Determines which field to ask about next
 */
export class ClarificationStrategy {
    constructor(
        private poolRepository: ICashPoolRepository,
        private categoryRepository: ICategoryRepository
    ) {}

    async getNextClarification(
        draft: TransactionDraft,
        userId: string
    ): Promise<ClarificationQuestion | null> {
        if (draft.missingFields.length === 0) {
            return null;
        }

        // Priority 1: poolId
        if (draft.missingFields.includes('poolId')) {
            return this.askForPool(userId);
        }

        // Priority 2: amount
        if (draft.missingFields.includes('amount')) {
            return {
                field: 'amount',
                question: 'What is the transaction amount?',
            };
        }

        // Priority 3: type
        if (draft.missingFields.includes('type')) {
            return {
                field: 'type',
                question: 'Is this an income or expense?',
                options: [
                    { id: 'income', label: 'Income', value: 'INCOME' },
                    { id: 'expense', label: 'Expense', value: 'EXPENSE' },
                ],
            };
        }

        // Priority 4: categoryId
        if (draft.missingFields.includes('categoryId')) {
            return this.askForCategory(userId, draft.extractedFields.type);
        }

        // Priority 5: purpose
        if (draft.missingFields.includes('purpose')) {
            return {
                field: 'purpose',
                question: 'What is the purpose of this transaction?',
            };
        }

        // Priority 6: date
        if (draft.missingFields.includes('date')) {
            return {
                field: 'date',
                question: 'When did this transaction occur? (e.g., today, yesterday, or a specific date)',
            };
        }

        return null;
    }

    private async askForPool(userId: string): Promise<ClarificationQuestion> {
        try {
            const pools = await this.poolRepository.getAll(userId);
            const activePools = pools.filter((pool) => pool.isActive);

            if (activePools.length === 0) {
                return {
                    field: 'poolId',
                    question: 'You have no active cash pools. Please create one first.',
                };
            }

            const options: SelectableOption[] = activePools.map((pool) => ({
                id: pool.id,
                label: `${pool.name} (${pool.currency} ${pool.balance.toFixed(2)})`,
                value: pool.id,
                metadata: {
                    poolName: pool.name,
                    balance: pool.balance,
                    currency: pool.currency,
                },
            }));

            return {
                field: 'poolId',
                question: 'Which cash pool should I use for this transaction?',
                options,
            };
        } catch (error) {
            return {
                field: 'poolId',
                question: 'Which cash pool should I use for this transaction?',
            };
        }
    }

    private async askForCategory(
        userId: string,
        type?: 'INCOME' | 'EXPENSE'
    ): Promise<ClarificationQuestion> {
        try {
            const categories = await this.categoryRepository.getAll(userId);

            const filteredCategories = type
                ? categories.filter((cat) => cat.type === type)
                : categories;

            if (filteredCategories.length === 0) {
                return {
                    field: 'categoryId',
                    question: 'Which category does this transaction belong to?',
                };
            }

            const options: SelectableOption[] = filteredCategories.map((category) => ({
                id: category.id,
                label: `${category.icon} ${category.key}`,
                value: category.id,
                metadata: {
                    categoryKey: category.key,
                    icon: category.icon,
                    color: category.color,
                },
            }));

            return {
                field: 'categoryId',
                question: 'Which category does this transaction belong to?',
                options,
            };
        } catch (error) {
            return {
                field: 'categoryId',
                question: 'Which category does this transaction belong to?',
            };
        }
    }
}
