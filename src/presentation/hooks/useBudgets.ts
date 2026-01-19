import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BudgetRepository } from '@/data/repositories/BudgetRepository';
import { CreateBudget } from '@/domain/usecases/budgets/CreateBudget';
import { useAuth } from '../contexts/AuthContext';

// Initialize repositories and use cases
const budgetRepository = new BudgetRepository();
const createBudgetUseCase = new CreateBudget(budgetRepository);

/**
 * Hook: useBudgets
 * Manages budget data fetching and mutations
 */
export function useBudgets() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Fetch all budgets
    const {
        data: budgets = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['budgets', user?.id],
        queryFn: () => budgetRepository.getAll(user!.id),
        enabled: !!user,
    });

    // Create budget mutation
    const createBudget = useMutation({
        mutationFn: (input: {
            month: number;
            year: number;
            name?: string;
            notes?: string;
        }) => createBudgetUseCase.execute(user!.id, input.month, input.year, input.name, input.notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
        },
    });

    // Delete budget mutation
    const deleteBudget = useMutation({
        mutationFn: (id: string) => budgetRepository.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
        },
    });

    return {
        budgets,
        isLoading,
        error,
        createBudget,
        deleteBudget,
    };
}
