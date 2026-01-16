import type { TransactionType } from './Transaction';

/**
 * Domain Entity: Category
 * Represents an expense category
 * Note: name is a translation key, not literal text
 */
export interface Category {
    id: string;
    userId: string;
    name: string; // Translation key (e.g., "categories.personal.food")
    icon: string; // Icon name or emoji
    color: string; // Hex color
    type: TransactionType;
    isDefault: boolean; // System-provided categories
    createdAt: Date;
}
