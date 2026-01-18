/**
 * Category Entity
 */
export interface Category {
    id: string;
    userId: string;
    key: string;
    type: 'INCOME' | 'EXPENSE';
    icon: string;
    color: string;
}

/**
 * Category Repository Interface
 */
export interface ICategoryRepository {
    getById(id: string): Promise<Category | null>;
    getAll(userId: string): Promise<Category[]>;
}
