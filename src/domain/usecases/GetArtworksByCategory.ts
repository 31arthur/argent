import type { Artwork } from '../entities/Artwork';
import type { IArtworkRepository } from '../repositories/IArtworkRepository';

/**
 * Use Case: Get Artworks By Category
 */
export class GetArtworksByCategory {
    private artworkRepository: IArtworkRepository;

    constructor(artworkRepository: IArtworkRepository) {
        this.artworkRepository = artworkRepository;
    }

    async execute(category: string): Promise<Artwork[]> {
        return await this.artworkRepository.getByCategory(category);
    }
}
