/**
 * Domain Entity: User
 * Represents an authenticated user in the system
 */
export interface User {
    id: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    createdAt: Date;
    lastLoginAt: Date;
    preferences?: UserPreferences;
}

/**
 * User Preferences
 * Stored separately in Firestore
 */
export interface UserPreferences {
    language: 'en' | 'hi' | 'te';
    currency: 'INR' | 'USD';
    theme: 'light' | 'dark';
    defaultPoolId?: string; // Last used or preferred cash pool
}

