import { TransactionData } from '../value-objects/TransactionData';
import { ExtractionResult } from './ExtractionResult';
import { ICashPoolRepository } from '../repositories/ICashPoolRepository';
import { ICategoryRepository } from '../repositories/ICategoryRepository';

/**
 * Hint Resolution Service
 * Resolves hints from Gemini extraction to actual entity IDs
 */
export class HintResolutionService {
    constructor(
        private poolRepository: ICashPoolRepository,
        private categoryRepository: ICategoryRepository
    ) {}

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
        const cashPoolHint = extraction.fields.cashPoolHint;
        if (cashPoolHint) {
            const poolId = await this.resolvePoolHint(cashPoolHint, userId);
            if (poolId !== 'AMBIGUOUS' && poolId !== 'MISSING') {
                fields.poolId = poolId;
                confidence.poolId = extraction.confidence.cashPoolHint || 0.6;
            }
        }

        // Resolve category hint
        const categoryHint = extraction.fields.categoryHint;
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
        const dateHint = extraction.fields.dateHint;
        if (dateHint) {
            fields.date = this.resolveDateHint(dateHint);
            confidence.date = extraction.confidence.date || 0.6;
        }

        return { fields, confidence };
    }

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

    private async resolveCategoryHint(
        hint: string,
        type: 'INCOME' | 'EXPENSE' | null,
        userId: string
    ): Promise<string | 'AMBIGUOUS' | 'MISSING'> {
        try {
            let categories = await this.categoryRepository.getAll(userId);

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

        const parsed = new Date(hint);
        if (isNaN(parsed.getTime())) {
            console.warn(`[HintResolution] Invalid date hint: ${hint}, defaulting to today`);
            return new Date();
        }

        return parsed;
    }
}
