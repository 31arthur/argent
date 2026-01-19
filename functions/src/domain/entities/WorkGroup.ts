/**
 * Domain Entity: WorkGroup
 * Represents a categorized group of artworks
 */
export interface WorkGroup {
    id: string;
    name: string; // e.g., "Conceptual Drawings", "Gradient Photography"
    artworkCount: number;
}

