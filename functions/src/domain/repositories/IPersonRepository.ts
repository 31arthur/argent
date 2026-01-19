import type { Person } from '../entities/Person';

/**
 * Repository Interface: IPersonRepository
 * Defines the contract for person data operations
 */
export interface IPersonRepository {
    /**
     * Get all persons for a user
     */
    getAll(userId: string): Promise<Person[]>;

    /**
     * Get person by ID
     */
    getById(id: string): Promise<Person | null>;

    /**
     * Create a new person
     */
    create(person: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>): Promise<Person>;

    /**
     * Update an existing person
     */
    update(id: string, person: Partial<Person>): Promise<Person>;

    /**
     * Delete a person
     * Note: Should validate that no active loans reference this person
     */
    delete(id: string): Promise<void>;
}
