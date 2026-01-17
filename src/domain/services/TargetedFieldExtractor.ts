import type { TransactionData } from '@/domain/value-objects/TransactionData';
import type { ICashPoolRepository } from '@/domain/repositories/ICashPoolRepository';
import type { ICategoryRepository } from '@/domain/repositories/ICategoryRepository';
import { GeminiExtractionService } from './GeminiExtractionService';

/**
 * Field Extraction Result
 */
export interface FieldExtractionResult {
    /**
     * Extracted value (type depends on field)
     */
    value: unknown;

    /**
     * Confidence score (0-1)
     */
    confidence: number;
}

/**
 * Targeted Field Extractor
 * Extracts value for a specific field using Gemini
 * 
 * PURPOSE:
 * - Extract ONLY the specified field from user message
 * - Use full extraction but focus on target field
 * - Resolve hints if needed
 * - Return typed value + confidence
 * 
 * RULES:
 * - Use existing GeminiExtractionService
 * - Extract full context but return only target field
 * - Validate extracted value
 * - Resolve hints for poolId, categoryId, date
 */
export class TargetedFieldExtractor {
    private readonly geminiService: GeminiExtractionService;

    constructor(
        private poolRepository: ICashPoolRepository,
        private categoryRepository: ICategoryRepository
    ) {
        this.geminiService = new GeminiExtractionService();
    }

    /**
     * Extract value for a specific field
     * 
     * @param field - Field to extract
     * @param message - User message
     * @param userId - User ID
     * @returns Extracted value + confidence
     */
    async extractField(
        field: keyof TransactionData,
        message: string,
        userId: string
    ): Promise<FieldExtractionResult> {
        // Use full extraction (Gemini works best with full context)
        const extraction = await this.geminiService.extract(message);

        // Resolve field value from extraction
        const resolvedValue = await this.resolveFieldValue(field, extraction, userId);

        // Calculate confidence
        const confidence = this.calculateConfidence(field, extraction);

        return {
            value: resolvedValue,
            confidence
        };
    }

    // ==================== Value Resolution ====================

    private async resolveFieldValue(
        field: keyof TransactionData,
        extraction: any,
        userId: string
    ): Promise<unknown> {
        switch (field) {
            case 'amount':
                return extraction.fields.amount;

            case 'poolId': {
                const cashPoolHint = (extraction.fields as any).cashPoolHint;
                if (cashPoolHint) {
                    // Get all pools and find match
                    const pools = await this.poolRepository.getAll(userId);
                    const activePools = pools.filter((pool) => pool.isActive);
                    const lowerHint = cashPoolHint.toLowerCase();
                    const matches = activePools.filter((pool) =>
                        pool.name.toLowerCase().includes(lowerHint)
                    );

                    if (matches.length === 1) {
                        return matches[0].id;
                    }
                }
                return null;
            }

            case 'categoryId': {
                const categoryHint = (extraction.fields as any).categoryHint;
                if (categoryHint) {
                    // Get all categories and find match
                    let categories = await this.categoryRepository.getAll(userId);

                    // Filter by type if known
                    if (extraction.fields.type) {
                        categories = categories.filter((cat) => cat.type === extraction.fields.type);
                    }

                    const lowerHint = categoryHint.toLowerCase();
                    const matches = categories.filter((cat) =>
                        cat.key.toLowerCase().includes(lowerHint)
                    );

                    if (matches.length === 1) {
                        return matches[0].id;
                    }
                }
                return null;
            }

            case 'date': {
                const dateHint = (extraction.fields as any).dateHint;
                if (dateHint) {
                    const upperHint = dateHint.toUpperCase();

                    if (upperHint === 'TODAY' || !dateHint) {
                        return new Date();
                    }

                    if (upperHint === 'YESTERDAY') {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        return yesterday;
                    }

                    // Try to parse as ISO date
                    const parsed = new Date(dateHint);
                    if (!isNaN(parsed.getTime())) {
                        return parsed;
                    }
                }
                return new Date(); // Default to today
            }

            case 'purpose':
                return extraction.fields.purpose;

            case 'type':
                return extraction.fields.type;

            case 'notes':
                return (extraction.fields as any).notes;

            case 'tags':
                return (extraction.fields as any).tags;

            default:
                return null;
        }
    }

    // ==================== Confidence Calculation ====================

    private calculateConfidence(field: keyof TransactionData, extraction: any): number {
        // Get confidence from extraction
        const confidenceValue = extraction.confidence[field] || extraction.confidence[`${field}Hint`];

        if (typeof confidenceValue === 'number') {
            return confidenceValue;
        }

        return 0.5; // Default medium confidence
    }
}
