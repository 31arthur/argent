import type { Category } from '@/domain/entities/Category';
import type { ICategoryRepository } from '@/domain/repositories/ICategoryRepository';
import { FirebaseCategoryDataSource } from '../firebase/category';

/**
 * Category Repository Implementation
 * Implements ICategoryRepository using Firestore
 */
export class CategoryRepository implements ICategoryRepository {
    private dataSource: FirebaseCategoryDataSource;

    constructor() {
        this.dataSource = new FirebaseCategoryDataSource();
    }

    async getAll(userId: string): Promise<Category[]> {
        return await this.dataSource.getAll(userId);
    }

    async getById(_id: string): Promise<Category | null> {
        // Not implemented for now
        throw new Error('Not implemented');
    }

    async getByType(userId: string, type: 'personal' | 'office'): Promise<Category[]> {
        return await this.dataSource.getByType(userId, type);
    }

    async create(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
        return await this.dataSource.create(category);
    }

    async update(_id: string, _category: Partial<Category>): Promise<Category> {
        // Not implemented for now
        throw new Error('Not implemented');
    }

    async delete(_id: string): Promise<void> {
        // Not implemented for now
        throw new Error('Not implemented');
    }

    async initializeDefaultCategories(userId: string): Promise<void> {
        await this.dataSource.initializeDefaultCategories(userId);
    }
}
