/**
 * Domain Entity: Sale
 * Represents a completed sale transaction
 */
export interface Sale {
    id: string;
    artworkId: string;
    artworkTitle: string;
    artworkThumbnail: string;
    year: number;
    dimensions: string;
    client: string;
    type: 'Museum' | 'Art Dealer' | 'Private Collector' | 'Gallery';
    price: number;
    currency: string; // e.g., "USD"
    date: Date;
    status: 'latest' | 'completed';
}
