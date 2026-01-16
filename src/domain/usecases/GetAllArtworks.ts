import type { Artwork } from '../entities/Artwork';
import type { IArtworkRepository } from '../repositories/IArtworkRepository';

/**
 * Use Case: Get All Artworks
 * Business logic for retrieving all artworks
 * Depends only on domain repository interface, not implementation
 * This follows the Dependency Inversion Principle
 */
export class GetAllArtworks {
    private artworkRepository: IArtworkRepository;

    constructor(artworkRepository: IArtworkRepository) {
        this.artworkRepository = artworkRepository;
    }

    async execute(): Promise<Artwork[]> {
        return await this.artworkRepository.getAll();
    }
}
