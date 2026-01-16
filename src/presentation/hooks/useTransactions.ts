import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Transaction } from '@/domain/entities/Transaction';
import { TransactionRepository } from '@/data/repositories/TransactionRepository';
import { CashPoolRepository } from '@/data/repositories/CashPoolRepository';
import { GetAllTransactions } from '@/domain/usecases/transactions/GetAllTransactions';
import { AddTransaction } from '@/domain/usecases/transactions/AddTransaction';
import { DeleteTransaction } from '@/domain/usecases/transactions/DeleteTransaction';
import { useAuth } from '../contexts/AuthContext';

// Initialize repositories and use cases
const transactionRepository = new TransactionRepository();
const poolRepository = new CashPoolRepository();
const getAllTransactionsUseCase = new GetAllTransactions(transactionRepository);
const addTransactionUseCase = new AddTransaction(transactionRepository, poolRepository);
const deleteTransactionUseCase = new DeleteTransaction(transactionRepository, poolRepository);

/**
 * Hook: useTransactions
 * Manages transaction data fetching and mutations
 */
export function useTransactions() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Fetch all transactions
    const {
        data: transactions = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['transactions', user?.id],
        queryFn: () => getAllTransactionsUseCase.execute(user!.id),
        enabled: !!user,
    });

    // Add transaction mutation
    const addTransaction = useMutation({
        mutationFn: (input: Parameters<typeof addTransactionUseCase.execute>[0]) =>
            addTransactionUseCase.execute(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['cashPools'] }); // Update pool balances
        },
    });

    // Delete transaction mutation
    const deleteTransaction = useMutation({
        mutationFn: (id: string) => deleteTransactionUseCase.execute(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['cashPools'] }); // Update pool balances
        },
    });

    return {
        transactions,
        isLoading,
        error,
        addTransaction,
        deleteTransaction,
    };
}
