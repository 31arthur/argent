import type { Category } from '../entities/Category';
import type { TransactionType } from '../entities/Transaction';

/**
 * Repository Interface: ICategoryRepository
 * Defines the contract for category data operations
 */
export interface ICategoryRepository {
    getAll(userId: string): Promise<Category[]>;
    getById(id: string): Promise<Category | null>;
    getByType(userId: string, type: TransactionType): Promise<Category[]>;
    create(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category>;
    update(id: string, category: Partial<Category>): Promise<Category>;
    delete(id: string): Promise<void>;
    initializeDefaultCategories(userId: string): Promise<void>;
}
