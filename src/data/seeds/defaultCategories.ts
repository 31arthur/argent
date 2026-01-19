import type { TransactionType } from '@/domain/entities/Transaction';

/**
 * Default Category Data Structure
 * Used for seeding initial categories for new users
 */
export interface DefaultCategoryData {
    key: string; // i18n key
    icon: string; // Emoji
    color: string; // Hex color
    type: TransactionType;
}

/**
 * Default Expense Categories
 * Seeded when user first creates a budget or transaction
 */
export const DEFAULT_EXPENSE_CATEGORIES: DefaultCategoryData[] = [
    { key: 'food', icon: '🍔', color: '#FF6B6B', type: 'EXPENSE' },
    { key: 'rent', icon: '🏠', color: '#4ECDC4', type: 'EXPENSE' },
    { key: 'travel', icon: '✈️', color: '#45B7D1', type: 'EXPENSE' },
    { key: 'utilities', icon: '💡', color: '#FFA07A', type: 'EXPENSE' },
    { key: 'personal', icon: '👤', color: '#98D8C8', type: 'EXPENSE' },
    { key: 'office', icon: '💼', color: '#6C5CE7', type: 'EXPENSE' },
    { key: 'savings', icon: '💰', color: '#00B894', type: 'EXPENSE' },
    { key: 'miscellaneous', icon: '📦', color: '#95A5A6', type: 'EXPENSE' },
];

/**
 * Default Income Categories
 * Seeded when user first creates a budget or transaction
 */
export const DEFAULT_INCOME_CATEGORIES: DefaultCategoryData[] = [
    { key: 'salary', icon: '💵', color: '#00B894', type: 'INCOME' },
    { key: 'freelance', icon: '💻', color: '#6C5CE7', type: 'INCOME' },
    { key: 'investment', icon: '📈', color: '#FDCB6E', type: 'INCOME' },
    { key: 'other', icon: '💸', color: '#74B9FF', type: 'INCOME' },
];

/**
 * Get all default categories (expense + income)
 */
export function getAllDefaultCategories(): DefaultCategoryData[] {
    return [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];
}
