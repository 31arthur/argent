import type { TransactionData } from '@/domain/value-objects/TransactionData';
import type { ExtractionResult } from './StubExtractionService';
import type { ICashPoolRepository } from '@/domain/repositories/ICashPoolRepository';
import type { ICategoryRepository } from '@/domain/repositories/ICategoryRepository';

/**
 * Hint Resolution Service
 * Resolves hints from Gemini extraction to actual entity IDs
 * 
 * RULES:
 * - Match hints against existing entities (case-insensitive)
 * - If single match → Use entity ID
 * - If multiple matches → Leave null (ambiguity, will be asked)
 * - If no match → Leave null (missing, will be asked)
 * - NEVER auto-create entities
 * - NEVER guess
 */
export class HintResolutionService {
    constructor(
        private poolRepository: ICashPoolRepository,
        private categoryRepository: ICategoryRepository
    ) { }

    /**
     * Resolve all hints from extraction result
     * 
     * @param extraction - Extraction result from Gemini
     * @param userId - User ID
     * @returns Resolved fields and confidence
     */
    async resolveHints(
        extraction: ExtractionResult,
        userId: string
    ): Promise<{ fields: Partial<TransactionData>; confidence: Record<string, number> }> {
        const fields: Partial<TransactionData> = {};
        const confidence: Record<string, number> = {};

        // Copy non-hint fields directly
        if (extraction.fields.type) {
            fields.type = extraction.fields.type;
            confidence.type = extraction.confidence.type || 0.9;
        }

        if (extraction.fields.amount !== undefined && extraction.fields.amount !== null) {
            fields.amount = extraction.fields.amount;
            confidence.amount = extraction.confidence.amount || 0.9;
        }

        if (extraction.fields.purpose) {
            fields.purpose = extraction.fields.purpose;
            confidence.purpose = extraction.confidence.purpose || 0.9;
        }

        // Resolve cash pool hint
        const cashPoolHint = (extraction.fields as any).cashPoolHint;
        if (cashPoolHint) {
            const poolId = await this.resolvePoolHint(cashPoolHint, userId);
            if (poolId !== 'AMBIGUOUS' && poolId !== 'MISSING') {
                fields.poolId = poolId;
                confidence.poolId = extraction.confidence.cashPoolHint || 0.6;
            }
        }

        // Resolve category hint
        const categoryHint = (extraction.fields as any).categoryHint;
        if (categoryHint) {
            const categoryId = await this.resolveCategoryHint(
                categoryHint,
                fields.type || null,
                userId
            );
            if (categoryId !== 'AMBIGUOUS' && categoryId !== 'MISSING') {
                fields.categoryId = categoryId;
                confidence.categoryId = extraction.confidence.categoryHint || 0.6;
            }
        }

        // Resolve date hint
        const dateHint = (extraction.fields as any).dateHint;
        if (dateHint) {
            fields.date = this.resolveDateHint(dateHint);
            confidence.date = extraction.confidence.date || 0.6;
        }

        return { fields, confidence };
    }

    /**
     * Resolve cash pool hint to pool ID
     * 
     * @param hint - Pool hint (e.g., "main wallet", "SBI")
     * @param userId - User ID
     * @returns Pool ID, 'AMBIGUOUS', or 'MISSING'
     */
    private async resolvePoolHint(
        hint: string,
        userId: string
    ): Promise<string | 'AMBIGUOUS' | 'MISSING'> {
        try {
            const pools = await this.poolRepository.getAll(userId);
            const activePools = pools.filter((pool) => pool.isActive);

            const lowerHint = hint.toLowerCase();
            const matches = activePools.filter((pool) =>
                pool.name.toLowerCase().includes(lowerHint)
            );

            if (matches.length === 0) return 'MISSING';
            if (matches.length > 1) return 'AMBIGUOUS';
            return matches[0].id;
        } catch (error) {
            console.error('[HintResolution] Error resolving pool hint:', error);
            return 'MISSING';
        }
    }

    /**
     * Resolve category hint to category ID
     * 
     * @param hint - Category hint (e.g., "groceries", "salary")
     * @param type - Transaction type (for filtering)
     * @param userId - User ID
     * @returns Category ID, 'AMBIGUOUS', or 'MISSING'
     */
    private async resolveCategoryHint(
        hint: string,
        type: 'INCOME' | 'EXPENSE' | null,
        userId: string
    ): Promise<string | 'AMBIGUOUS' | 'MISSING'> {
        try {
            let categories = await this.categoryRepository.getAll(userId);

            // Filter by type if known
            if (type) {
                categories = categories.filter((cat) => cat.type === type);
            }

            const lowerHint = hint.toLowerCase();
            const matches = categories.filter((cat) =>
                cat.key.toLowerCase().includes(lowerHint)
            );

            if (matches.length === 0) return 'MISSING';
            if (matches.length > 1) return 'AMBIGUOUS';
            return matches[0].id;
        } catch (error) {
            console.error('[HintResolution] Error resolving category hint:', error);
            return 'MISSING';
        }
    }

    /**
     * Resolve date hint to Date object
     * 
     * @param hint - Date hint ("TODAY", "YESTERDAY", or ISO date)
     * @returns Resolved date
     */
    private resolveDateHint(hint: string): Date {
        const upperHint = hint.toUpperCase();

        if (upperHint === 'TODAY' || !hint) {
            return new Date();
        }

        if (upperHint === 'YESTERDAY') {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return yesterday;
        }

        // Try to parse as ISO date
        const parsed = new Date(hint);
        if (isNaN(parsed.getTime())) {
            // Invalid date - default to today
            console.warn(`[HintResolution] Invalid date hint: ${hint}, defaulting to today`);
            return new Date();
        }

        return parsed;
    }
}
