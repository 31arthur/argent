/**
 * Domain Entity: Commission
 * Represents an ongoing commission project
 */
export interface Commission {
    id: string;
    title: string;
    client: string;
    gallery?: string;
    price: number;
    currency: string;
    status: 'ongoing' | 'completed' | 'pending';
    startDate: Date;
    expectedCompletionDate?: Date;
}
