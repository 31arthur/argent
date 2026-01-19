import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PersonRepository } from '@/data/repositories/PersonRepository';
import { CreatePerson } from '@/domain/usecases/persons/CreatePerson';
import { useAuth } from '../contexts/AuthContext';

// Initialize repositories and use cases
const personRepository = new PersonRepository();
const createPersonUseCase = new CreatePerson(personRepository);

/**
 * Hook: usePersons
 * Manages person data fetching and mutations
 */
export function usePersons() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Fetch all persons
    const {
        data: persons = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['persons', user?.id],
        queryFn: () => personRepository.getAll(user!.id),
        enabled: !!user,
    });

    // Create person mutation
    const createPerson = useMutation({
        mutationFn: (input: {
            name: string;
            email?: string;
            phone?: string;
            notes?: string;
        }) => createPersonUseCase.execute(user!.id, input.name, input.email, input.phone, input.notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['persons'] });
        },
    });

    // Delete person mutation
    const deletePerson = useMutation({
        mutationFn: (id: string) => personRepository.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['persons'] });
        },
    });

    return {
        persons,
        isLoading,
        error,
        createPerson,
        deletePerson,
    };
}
