import type { TransactionDraft } from '@/domain/entities/TransactionDraft';
import type { SelectableOption } from '@/domain/entities/SelectableOption';
import type { ICashPoolRepository } from '@/domain/repositories/ICashPoolRepository';
import type { ICategoryRepository } from '@/domain/repositories/ICategoryRepository';

/**
 * Clarification Question
 * Represents a question to ask the user
 */
export interface ClarificationQuestion {
    /**
     * The field being clarified
     */
    field: string;

    /**
     * The question to ask the user
     */
    question: string;

    /**
     * Optional selectable options
     */
    options?: SelectableOption[];
}

/**
 * Clarification Strategy Service
 * Determines which field to ask about next and generates clarification questions
 * 
 * PRIORITY ORDER:
 * 1. poolId - "Which cash pool should I use?"
 * 2. amount - "What's the transaction amount?"
 * 3. type - "Is this an income or expense?"
 * 4. categoryId - "Which category does this belong to?"
 * 5. purpose - "What's the purpose of this transaction?"
 * 6. date - "When did this transaction occur?"
 * 
 * RULES:
 * - Ask only ONE question at a time
 * - Ask highest-priority missing field first
 * - Provide options when possible (pools, categories)
 * - Never overwhelm the user with multiple questions
 */
export class ClarificationStrategy {
    constructor(
        private poolRepository: ICashPoolRepository,
        private categoryRepository: ICategoryRepository
    ) { }

    /**
     * Get the next clarification question
     * 
     * @param draft - Current transaction draft
     * @param userId - User ID for fetching pools/categories
     * @returns Clarification question with optional options
     */
    async getNextClarification(
        draft: TransactionDraft,
        userId: string
    ): Promise<ClarificationQuestion | null> {
        // If no missing fields, no clarification needed
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

        // Should never reach here if missingFields is not empty
        return null;
    }

    /**
     * Ask for cash pool selection
     * Provides list of available pools as options
     */
    private async askForPool(userId: string): Promise<ClarificationQuestion> {
        try {
            const pools = await this.poolRepository.getAll(userId);

            // Filter active pools only
            const activePools = pools.filter((pool) => pool.isActive);

            if (activePools.length === 0) {
                return {
                    field: 'poolId',
                    question: 'You have no active cash pools. Please create one first.',
                };
            }

            // If only one pool, could auto-select, but we ask for confirmation
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
            // Fallback if repository fails
            return {
                field: 'poolId',
                question: 'Which cash pool should I use for this transaction?',
            };
        }
    }

    /**
     * Ask for category selection
     * Provides list of categories filtered by transaction type
     */
    private async askForCategory(
        userId: string,
        type?: 'INCOME' | 'EXPENSE'
    ): Promise<ClarificationQuestion> {
        try {
            const categories = await this.categoryRepository.getAll(userId);

            // Filter by type if known
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
            // Fallback if repository fails
            return {
                field: 'categoryId',
                question: 'Which category does this transaction belong to?',
            };
        }
    }
}
