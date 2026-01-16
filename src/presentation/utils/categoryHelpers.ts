import type { TransactionType } from '@/domain/entities/Transaction';

/**
 * Constructs the full i18n key for a category
 * @param categoryKey - The category key (e.g., "food")
 * @param type - Transaction type (INCOME or EXPENSE)
 * @returns Full i18n key (e.g., "categories.expense.food")
 */
export function getCategoryI18nKey(categoryKey: string, type: TransactionType): string {
    const typeKey = type.toLowerCase(); // "expense" or "income"
    return `categories.${typeKey}.${categoryKey}`;
}

/**
 * Gets the translated category name
 * @param t - Translation function from useTranslation
 * @param categoryKey - The category key
 * @param type - Transaction type
 * @returns Translated category name
 */
export function getCategoryName(
    t: (key: string) => string,
    categoryKey: string,
    type: TransactionType
): string {
    return t(getCategoryI18nKey(categoryKey, type));
}
