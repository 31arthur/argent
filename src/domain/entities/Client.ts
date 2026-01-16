/**
 * Domain Entity: Client
 * Represents a client (museum, gallery, collector, etc.)
 */
export interface Client {
    id: string;
    name: string;
    type: 'Museum' | 'Gallery' | 'Private Collector' | 'Art Dealer';
    location?: string;
    country?: string;
}
