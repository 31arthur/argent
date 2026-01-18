import { ConfidenceLevel } from './ConfidenceLevel';

/**
 * Extraction Schema
 * Structure returned by Gemini extraction
 */
export interface ExtractionSchema {
    transactionType: 'INCOME' | 'EXPENSE' | null;
    amount: number | null;
    cashPoolHint: string | null;
    categoryHint: string | null;
    description: string | null;
    dateHint: string | null;
    confidence: {
        transactionType: ConfidenceLevel;
        amount: ConfidenceLevel;
        cashPoolHint: ConfidenceLevel;
        categoryHint: ConfidenceLevel;
        description: ConfidenceLevel;
        dateHint: ConfidenceLevel;
    };
}
