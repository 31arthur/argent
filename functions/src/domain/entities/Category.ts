import type { TransactionType } from './Transaction';

/**
 * Category Entity
 * Represents a spending/income category
 * 
 * Invariants:
 * - Categories are filtered by type (INCOME or EXPENSE)
 * - Each category has a unique key within its type
 * - The 'key' is used to construct the i18n path: categories.{type}.{key}
 * - Display names come from i18n files, not the database
 */
export interface Category {
    id: string;
    userId: string;
    key: string; // Category key (e.g., "food", "transport") - used for i18n lookup
    icon: string;
    color: string;
    type: TransactionType; // INCOME or EXPENSE
    isDefault?: boolean; // System-provided categories
    createdAt?: Date;
    updatedAt?: Date; // Track when category was last modified
}


