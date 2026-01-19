import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LeadRepository } from '@/data/repositories/LeadRepository';
import { CreateLead } from '@/domain/usecases/leads/CreateLead';
import { useAuth } from '../contexts/AuthContext';
import type { LeadStatus } from '@/domain/entities/Lead';

// Initialize repositories and use cases
const leadRepository = new LeadRepository();
const createLeadUseCase = new CreateLead(leadRepository);

/**
 * Hook: useLeads
 * Manages lead data fetching and mutations
 */
export function useLeads() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Fetch all leads
    const {
        data: leads = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['leads', user?.id],
        queryFn: () => leadRepository.getAll(user!.id),
        enabled: !!user,
    });

    // Create lead mutation
    const createLead = useMutation({
        mutationFn: (input: {
            title: string;
            expectedAmount: number;
            probability: number;
            source?: string;
            expectedCloseDate?: Date;
            notes?: string;
            tags?: string[];
        }) => createLeadUseCase.execute(
            user!.id,
            input.title,
            input.expectedAmount,
            input.probability,
            input.source,
            input.expectedCloseDate,
            input.notes,
            input.tags
        ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
    });

    // Update lead status mutation
    const updateLeadStatus = useMutation({
        mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
            leadRepository.update(id, { status, closedAt: status !== 'OPEN' ? new Date() : undefined }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
    });

    // Delete lead mutation
    const deleteLead = useMutation({
        mutationFn: (id: string) => leadRepository.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
    });

    return {
        leads,
        isLoading,
        error,
        createLead,
        updateLeadStatus,
        deleteLead,
    };
}
