import { useQuery } from '@tanstack/react-query';
import { CategoryRepository } from '@/data/repositories/CategoryRepository';
import { GetAllCategories } from '@/domain/usecases/categories/GetAllCategories';
import { InitializeDefaultCategories } from '@/domain/usecases/categories/InitializeDefaultCategories';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

// Initialize repository and use cases
const categoryRepository = new CategoryRepository();
const getAllCategoriesUseCase = new GetAllCategories(categoryRepository);
const initializeDefaultCategoriesUseCase = new InitializeDefaultCategories(categoryRepository);

/**
 * Hook: useCategories
 * Manages category data fetching and initialization
 */
export function useCategories() {
    const { user } = useAuth();

    // Fetch all categories
    const { data: categories = [], isLoading, error } = useQuery({
        queryKey: ['categories', user?.id],
        queryFn: () => getAllCategoriesUseCase.execute(user!.id),
        enabled: !!user,
    });

    // Initialize default categories on first load
    useEffect(() => {
        if (user && categories.length === 0 && !isLoading) {
            initializeDefaultCategoriesUseCase.execute(user.id).catch(console.error);
        }
    }, [user, categories.length, isLoading]);

    return {
        categories,
        isLoading,
        error,
    };
}
