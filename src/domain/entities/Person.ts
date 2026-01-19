/**
 * Person Entity
 * Represents an individual (for loans, future settlements, etc.)
 * 
 * INVARIANTS:
 * - Lightweight entity
 * - Designed to expand later (trust score, history, etc.)
 * - Name must be non-empty (min 2 characters)
 * - User-scoped
 */
export interface Person {
    id: string;
    userId: string;
    name: string; // Full name (min 2 characters)
    email?: string;
    phone?: string;
    profileImageUrl?: string; // Avatar URL, defaults to random avatar
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Validates person data
 */
export function isValidPerson(person: Partial<Person>): boolean {
    if (!person.name || person.name.trim().length < 2) {
        return false;
    }
    return true;
}
