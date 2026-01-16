/**
 * Domain Entity: Artwork
 * Represents a piece of artwork in the artist's catalog
 * This is a pure business entity with no framework dependencies
 */
export interface Artwork {
    id: string;
    title: string;
    year: number;
    dimensions: string; // e.g., "240 x 180 mm"
    medium: string; // e.g., "silver print, photo paper matt"
    workId: string; // e.g., "W0001"
    thumbnailUrl: string;
    imageUrl: string;
    edition?: string; // e.g., "1-3"
    category?: string; // e.g., "Conceptual Drawings", "Gradient Photography"
}
