import type { Artwork } from '@/domain/entities/Artwork';
import type { IArtworkRepository } from '@/domain/repositories/IArtworkRepository';
import { MockArtworkDataSource } from '../datasources/MockArtworkDataSource';

/**
 * Concrete Repository Implementation: ArtworkRepository
 * Implements the domain repository interface
 * Depends on data sources (can be swapped: mock → real API)
 * This follows the Dependency Inversion Principle
 */
export class ArtworkRepository implements IArtworkRepository {
    private dataSource: MockArtworkDataSource;

    constructor(dataSource: MockArtworkDataSource) {
        this.dataSource = dataSource;
    }

    async getAll(): Promise<Artwork[]> {
        return await this.dataSource.getAll();
    }

    async getById(id: string): Promise<Artwork | null> {
        return await this.dataSource.getById(id);
    }

    async getByCategory(category: string): Promise<Artwork[]> {
        return await this.dataSource.getByCategory(category);
    }

    async create(artwork: Artwork): Promise<Artwork> {
        return await this.dataSource.create(artwork);
    }

    async update(id: string, artwork: Partial<Artwork>): Promise<Artwork> {
        const updated = await this.dataSource.update(id, artwork);
        if (!updated) {
            throw new Error(`Artwork with id ${id} not found`);
        }
        return updated;
    }

    async delete(id: string): Promise<void> {
        const deleted = await this.dataSource.delete(id);
        if (!deleted) {
            throw new Error(`Artwork with id ${id} not found`);
        }
    }
}
