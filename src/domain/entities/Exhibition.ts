/**
 * Domain Entity: Exhibition
 * Represents an exhibition where artwork is displayed
 */
export interface Exhibition {
    id: string;
    artworkId: string;
    artworkTitle: string;
    category: string; // e.g., "Photography", "Painting"
    venue: string; // e.g., "Biennale XY"
    location?: string;
    startDate: Date;
    endDate?: Date;
}
