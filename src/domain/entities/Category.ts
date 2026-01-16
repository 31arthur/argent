import type { TransactionType } from './Transaction';

/**
 * Domain Entity: Category
 * Represents a transaction category
 * Categories are filtered by transaction type (INCOME or EXPENSE)
 * Note: name is a translation key, not literal text
 */
export interface Category {
    id: string;
    userId: string;
    name: string; // Translation key (e.g., "categories.expense.food")
    icon: string; // Icon name or emoji
    color: string; // Hex color
    type: TransactionType; // INCOME or EXPENSE
    isDefault: boolean; // System-provided categories
    createdAt: Date;
}
