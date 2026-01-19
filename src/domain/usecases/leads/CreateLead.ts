import type { Lead } from '@/domain/entities/Lead';
import type { ILeadRepository } from '@/domain/repositories/ILeadRepository';

/**
 * Use Case: Create Lead
 * Creates a new potential income opportunity
 */
export class CreateLead {
    constructor(private leadRepository: ILeadRepository) { }

    async execute(
        userId: string,
        title: string,
        expectedAmount: number,
        probability: number,
        source?: string,
        expectedCloseDate?: Date,
        notes?: string,
        tags?: string[]
    ): Promise<Lead> {
        // Validate inputs
        if (!title || title.trim().length === 0) {
            throw new Error('Title is required');
        }
        if (expectedAmount <= 0) {
            throw new Error('Expected amount must be greater than 0');
        }
        if (probability < 0 || probability > 100) {
            throw new Error('Probability must be between 0 and 100');
        }

        // Create lead
        return await this.leadRepository.create({
            userId,
            title: title.trim(),
            source,
            expectedAmount,
            probability,
            expectedCloseDate,
            status: 'OPEN',
            notes,
            tags,
        });
    }
}
