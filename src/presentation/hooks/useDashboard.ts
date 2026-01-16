import { useQuery } from '@tanstack/react-query';
import { TransactionRepository } from '@/data/repositories/TransactionRepository';
import { CategoryRepository } from '@/data/repositories/CategoryRepository';
import { GetMonthlySpending } from '@/domain/usecases/dashboard/GetMonthlySpending';
import { GetDailySpending } from '@/domain/usecases/dashboard/GetDailySpending';
import { GetRecentTransactions } from '@/domain/usecases/dashboard/GetRecentTransactions';
import { GetCategoryBreakdown } from '@/domain/usecases/dashboard/GetCategoryBreakdown';
import { useAuth } from '../contexts/AuthContext';

// Initialize repositories and use cases
const transactionRepository = new TransactionRepository();
const categoryRepository = new CategoryRepository();
const getMonthlySpendingUseCase = new GetMonthlySpending(transactionRepository);
const getDailySpendingUseCase = new GetDailySpending(transactionRepository);
const getRecentTransactionsUseCase = new GetRecentTransactions(transactionRepository);
const getCategoryBreakdownUseCase = new GetCategoryBreakdown(
    transactionRepository,
    categoryRepository
);

/**
 * Hook: useDashboard
 * Fetches dashboard analytics data
 */
export function useDashboard() {
    const { user } = useAuth();

    // Monthly spending
    const { data: monthlySpending = 0, isLoading: isLoadingMonthly } = useQuery({
        queryKey: ['dashboard', 'monthly', user?.id],
        queryFn: () => getMonthlySpendingUseCase.execute(user!.id),
        enabled: !!user,
    });

    // Daily spending
    const { data: dailySpending = 0, isLoading: isLoadingDaily } = useQuery({
        queryKey: ['dashboard', 'daily', user?.id],
        queryFn: () => getDailySpendingUseCase.execute(user!.id),
        enabled: !!user,
    });

    // Recent transactions
    const { data: recentTransactions = [], isLoading: isLoadingRecent } = useQuery({
        queryKey: ['dashboard', 'recent', user?.id],
        queryFn: () => getRecentTransactionsUseCase.execute(user!.id, 5),
        enabled: !!user,
    });

    // Category breakdown
    const { data: categoryBreakdown = [], isLoading: isLoadingCategories } = useQuery({
        queryKey: ['dashboard', 'categories', user?.id],
        queryFn: () => getCategoryBreakdownUseCase.execute(user!.id),
        enabled: !!user,
    });

    return {
        monthlySpending,
        dailySpending,
        recentTransactions,
        categoryBreakdown,
        isLoading:
            isLoadingMonthly || isLoadingDaily || isLoadingRecent || isLoadingCategories,
    };
}
