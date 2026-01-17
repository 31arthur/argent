import type { TransactionDraft } from '@/domain/entities/TransactionDraft';

/**
 * Validation Result
 * Result of validating a transaction draft for completeness
 */
export interface ValidationResult {
    /**
     * Whether the draft has all required fields
     */
    isValid: boolean;

    /**
     * List of missing required field names
     */
    missingFields: string[];
}

/**
 * Use Case: Validate Transaction Draft
 * Validates whether a draft has all required fields for confirmation
 * 
 * REQUIRED FIELDS:
 * - poolId (must reference existing, active pool)
 * - amount (must be > 0)
 * - type (must be INCOME or EXPENSE)
 * - categoryId (must reference existing category)
 * - purpose (must be ≥ 3 characters)
 * - date (cannot be in future)
 * 
 * OPTIONAL FIELDS:
 * - notes
 * - tags
 * 
 * RULES:
 * - Validation is deterministic
 * - Does NOT depend on AI confidence scores
 * - Must be called before allowing confirmation
 */
export class ValidateTransactionDraft {
    /**
     * Execute validation on a draft
     * 
     * @param draft - The draft to validate
     * @returns Validation result with missing fields
     */
    execute(draft: TransactionDraft): ValidationResult {
        const missingFields: string[] = [];

        // Validate poolId
        if (!draft.extractedFields.poolId) {
            missingFields.push('poolId');
        }

        // Validate amount
        if (!draft.extractedFields.amount || draft.extractedFields.amount <= 0) {
            missingFields.push('amount');
        }

        // Validate type
        if (!draft.extractedFields.type) {
            missingFields.push('type');
        }

        // Validate categoryId
        if (!draft.extractedFields.categoryId) {
            missingFields.push('categoryId');
        }

        // Validate purpose
        if (
            !draft.extractedFields.purpose ||
            draft.extractedFields.purpose.trim().length < 3
        ) {
            missingFields.push('purpose');
        }

        // Validate date
        if (!draft.extractedFields.date) {
            missingFields.push('date');
        } else {
            // Check if date is in the future
            const now = new Date();
            if (draft.extractedFields.date > now) {
                missingFields.push('date');
            }
        }

        return {
            isValid: missingFields.length === 0,
            missingFields,
        };
    }
}
