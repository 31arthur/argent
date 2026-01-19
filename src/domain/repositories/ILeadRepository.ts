import type { Lead, LeadStatus } from '../entities/Lead';

/**
 * Repository Interface: ILeadRepository
 * Defines the contract for lead data operations
 */
export interface ILeadRepository {
    /**
     * Get all leads for a user
     */
    getAll(userId: string): Promise<Lead[]>;

    /**
     * Get lead by ID
     */
    getById(id: string): Promise<Lead | null>;

    /**
     * Get leads by status
     */
    getByStatus(userId: string, status: LeadStatus): Promise<Lead[]>;

    /**
     * Get all open leads (status = OPEN)
     */
    getOpenLeads(userId: string): Promise<Lead[]>;

    /**
     * Create a new lead
     */
    create(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead>;

    /**
     * Update an existing lead
     */
    update(id: string, lead: Partial<Lead>): Promise<Lead>;

    /**
     * Delete a lead
     */
    delete(id: string): Promise<void>;
}
