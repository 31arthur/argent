import type { ConfidenceLevel } from './ConfidenceLevel';

/**
 * Extraction Schema
 * Strict schema for Gemini extraction output
 * 
 * RULES:
 * - All fields are nullable (use null when unsure)
 * - transactionType must be exact enum value or null
 * - amount must be number or null (NOT string)
 * - Hints are strings for matching, not IDs
 * - dateHint can be ISO date, symbolic ("TODAY", "YESTERDAY"), or null
 * - Confidence is per-field
 * 
 * GEMINI MUST RETURN ONLY THIS SCHEMA:
 * - NO prose
 * - NO explanations
 * - NO markdown
 * - NO additional keys
 */
export interface ExtractionSchema {
    /**
     * Transaction type
     * Must be exact enum value or null
     */
    transactionType: 'INCOME' | 'EXPENSE' | null;

    /**
     * Transaction amount
     * Must be number or null (NOT string)
     */
    amount: number | null;

    /**
     * Cash pool hint for matching
     * NOT a pool ID - will be resolved by orchestrator
     */
    cashPoolHint: string | null;

    /**
     * Category hint for matching
     * NOT a category ID - will be resolved by orchestrator
     */
    categoryHint: string | null;

    /**
     * Transaction description
     */
    description: string | null;

    /**
     * Date hint
     * Can be:
     * - ISO date string (e.g., "2024-01-15")
     * - "TODAY"
     * - "YESTERDAY"
     * - null (defaults to TODAY)
     */
    dateHint: string | null;

    /**
     * Per-field confidence levels
     */
    confidence: {
        transactionType: ConfidenceLevel;
        amount: ConfidenceLevel;
        cashPoolHint: ConfidenceLevel;
        categoryHint: ConfidenceLevel;
        description: ConfidenceLevel;
        dateHint: ConfidenceLevel;
    };
}
