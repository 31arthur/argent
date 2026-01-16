import { useQuery } from '@tanstack/react-query';
import type { Artwork } from '@/domain/entities/Artwork';
import { GetAllArtworks } from '@/domain/usecases/GetAllArtworks';
import { ArtworkRepository } from '@/data/repositories/ArtworkRepository';
import { MockArtworkDataSource } from '@/data/datasources/MockArtworkDataSource';

/**
 * Custom Hook: useArtworks
 * Presentation layer's interface to domain use cases
 * Uses TanStack Query for data fetching, caching, and state management
 */
export function useArtworks() {
    return useQuery<Artwork[], Error>({
        queryKey: ['artworks'],
        queryFn: async () => {
            // Dependency injection: create instances
            const dataSource = new MockArtworkDataSource();
            const repository = new ArtworkRepository(dataSource);
            const useCase = new GetAllArtworks(repository);

            // Execute use case
            return await useCase.execute();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}
