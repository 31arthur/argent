import type { Person } from '@/domain/entities/Person';
import type { IPersonRepository } from '@/domain/repositories/IPersonRepository';

/**
 * Use Case: Create Person
 * Creates a new person for loan tracking
 */
export class CreatePerson {
    constructor(private personRepository: IPersonRepository) { }

    async execute(
        userId: string,
        name: string,
        email?: string,
        phone?: string,
        notes?: string
    ): Promise<Person> {
        // Validate inputs
        if (!name || name.trim().length < 2) {
            throw new Error('Name must be at least 2 characters');
        }

        // Generate random avatar using DiceBear API
        const seed = encodeURIComponent(name.trim());
        const profileImageUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${seed}`;

        // Create person
        return await this.personRepository.create({
            userId,
            name: name.trim(),
            email,
            phone,
            profileImageUrl,
            notes,
        });
    }
}
