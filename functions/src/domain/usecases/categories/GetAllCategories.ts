import type { Category } from '../../entities/Category';
import type { ICategoryRepository } from '../../repositories/ICategoryRepository';

/**
 * Use Case: Get All Categories
 * Retrieves all categories for a user
 */
export class GetAllCategories {
    private categoryRepository: ICategoryRepository;

    constructor(categoryRepository: ICategoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    async execute(userId: string): Promise<Category[]> {
        return await this.categoryRepository.getAll(userId);
    }
}


