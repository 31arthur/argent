import { TransactionDraft } from '../entities/TransactionDraft';

/**
 * Validation Result
 */
export interface ValidationResult {
    isValid: boolean;
    missingFields: string[];
}

/**
 * Use Case: Validate Transaction Draft
 */
export class ValidateTransactionDraft {
    execute(draft: TransactionDraft): ValidationResult {
        const missingFields: string[] = [];
        const fields = draft.extractedFields;

        if (!fields.poolId) {
            missingFields.push('poolId');
        }

        if (fields.amount === undefined || fields.amount === null || fields.amount <= 0) {
            missingFields.push('amount');
        }

        if (!fields.type || (fields.type !== 'INCOME' && fields.type !== 'EXPENSE')) {
            missingFields.push('type');
        }

        if (!fields.categoryId) {
            missingFields.push('categoryId');
        }

        if (!fields.purpose || fields.purpose.length < 3) {
            missingFields.push('purpose');
        }

        if (!fields.date) {
            missingFields.push('date');
        }

        return {
            isValid: missingFields.length === 0,
            missingFields,
        };
    }
}
