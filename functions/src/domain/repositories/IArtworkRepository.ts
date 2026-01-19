import type { Artwork } from '../entities/Artwork';

/**
 * Repository Interface: IArtworkRepository
 * Defines the contract for artwork data operations
 * Domain layer defines the interface, data layer implements it
 * This follows the Dependency Inversion Principle
 */
export interface IArtworkRepository {
    getAll(): Promise<Artwork[]>;
    getById(id: string): Promise<Artwork | null>;
    getByCategory(category: string): Promise<Artwork[]>;
    create(artwork: Artwork): Promise<Artwork>;
    update(id: string, artwork: Partial<Artwork>): Promise<Artwork>;
    delete(id: string): Promise<void>;
}

