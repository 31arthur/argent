import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CashPool } from '@/domain/entities/CashPool';
import { CashPoolRepository } from '@/data/repositories/CashPoolRepository';
import { GetAllCashPools } from '@/domain/usecases/pools/GetAllCashPools';
import { CreateCashPool } from '@/domain/usecases/pools/CreateCashPool';
import { UpdateCashPool } from '@/domain/usecases/pools/UpdateCashPool';
import { DeleteCashPool } from '@/domain/usecases/pools/DeleteCashPool';
import { useAuth } from '../contexts/AuthContext';

// Initialize repository and use cases
const poolRepository = new CashPoolRepository();
const getAllCashPoolsUseCase = new GetAllCashPools(poolRepository);
const createCashPoolUseCase = new CreateCashPool(poolRepository);
const updateCashPoolUseCase = new UpdateCashPool(poolRepository);
const deleteCashPoolUseCase = new DeleteCashPool(poolRepository);

/**
 * Hook: useCashPools
 * Manages cash pool data fetching and mutations
 */
export function useCashPools() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Fetch all pools
    const { data: pools = [], isLoading, error } = useQuery({
        queryKey: ['cashPools', user?.id],
        queryFn: () => getAllCashPoolsUseCase.execute(user!.id),
        enabled: !!user,
    });

    // Create pool mutation
    const createPool = useMutation({
        mutationFn: (input: Parameters<typeof createCashPoolUseCase.execute>[0]) =>
            createCashPoolUseCase.execute(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cashPools'] });
        },
    });

    // Update pool mutation
    const updatePool = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<CashPool> }) =>
            updateCashPoolUseCase.execute(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cashPools'] });
        },
    });

    // Delete pool mutation
    const deletePool = useMutation({
        mutationFn: (id: string) => deleteCashPoolUseCase.execute(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cashPools'] });
        },
    });

    return {
        pools,
        isLoading,
        error,
        createPool,
        updatePool,
        deletePool,
    };
}
