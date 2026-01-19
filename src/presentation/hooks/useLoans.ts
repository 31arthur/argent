import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoanRepository } from '@/data/repositories/LoanRepository';
import { PersonRepository } from '@/data/repositories/PersonRepository';
import { CreateLoan } from '@/domain/usecases/loans/CreateLoan';
import { useAuth } from '../contexts/AuthContext';
import type { LoanDirection, LoanStatus } from '@/domain/entities/Loan';

// Initialize repositories and use cases
const loanRepository = new LoanRepository();
const personRepository = new PersonRepository();
const createLoanUseCase = new CreateLoan(loanRepository, personRepository);

/**
 * Hook: useLoans
 * Manages loan data fetching and mutations
 */
export function useLoans() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Fetch all loans
    const {
        data: loans = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['loans', user?.id],
        queryFn: () => loanRepository.getAll(user!.id),
        enabled: !!user,
    });

    // Create loan mutation
    const createLoan = useMutation({
        mutationFn: (input: {
            personId: string;
            direction: LoanDirection;
            principalAmount: number;
            borrowedDate: Date;
            interestRate?: number;
            expectedRepaymentDate?: Date;
            notes?: string;
        }) => createLoanUseCase.execute(
            user!.id,
            input.personId,
            input.direction,
            input.principalAmount,
            input.borrowedDate,
            input.interestRate,
            input.expectedRepaymentDate,
            input.notes
        ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loans'] });
        },
    });

    // Update loan status mutation
    const updateLoanStatus = useMutation({
        mutationFn: ({ id, status }: { id: string; status: LoanStatus }) =>
            loanRepository.update(id, {
                status,
                actualRepaymentDate: status === 'REPAID' ? new Date() : undefined,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loans'] });
        },
    });

    // Delete loan mutation
    const deleteLoan = useMutation({
        mutationFn: (id: string) => loanRepository.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loans'] });
        },
    });

    return {
        loans,
        isLoading,
        error,
        createLoan,
        updateLoanStatus,
        deleteLoan,
    };
}
