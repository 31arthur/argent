import type { ICategoryRepository } from '@/domain/repositories/ICategoryRepository';

/**
 * Use Case: Initialize Default Categories
 * Creates default categories for a new user
 */
export class InitializeDefaultCategories {
    private categoryRepository: ICategoryRepository;

    constructor(categoryRepository: ICategoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    async execute(userId: string): Promise<void> {
        // Check if user already has categories
        const existing = await this.categoryRepository.getAll(userId);
        if (existing.length > 0) {
            return; // Already initialized
        }

        await this.categoryRepository.initializeDefaultCategories(userId);
    }
}
