import { TransactionData } from '../value-objects/TransactionData';

/**
 * Extraction Result
 * Result of extraction from user message
 */
export interface ExtractionResult {
    fields: Partial<TransactionData> & {
        cashPoolHint?: string;
        categoryHint?: string;
        dateHint?: string;
    };
    confidence: Record<string, number>;
}

