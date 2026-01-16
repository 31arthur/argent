import {
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    type User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from './config';
import type { User } from '@/domain/entities/User';

/**
 * Firebase Auth Adapter
 * Abstracts Firebase authentication from domain layer
 * Google Sign-In only
 */
export class FirebaseAuthAdapter {
    /**
     * Sign in with Google
     */
    static async signInWithGoogle(): Promise<User> {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return this.toDomainUser(result.user);
        } catch (error: any) {
            throw new Error(error.message || 'Google sign-in failed');
        }
    }

    /**
     * Sign out current user
     */
    static async signOut(): Promise<void> {
        await firebaseSignOut(auth);
    }

    /**
     * Get current user
     */
    static getCurrentUser(): User | null {
        const firebaseUser = auth.currentUser;
        return firebaseUser ? this.toDomainUser(firebaseUser) : null;
    }

    /**
     * Listen to auth state changes
     */
    static onAuthStateChange(callback: (user: User | null) => void): () => void {
        return onAuthStateChanged(auth, (firebaseUser) => {
            callback(firebaseUser ? this.toDomainUser(firebaseUser) : null);
        });
    }

    /**
     * Maps Firebase user to domain User entity
     */
    private static toDomainUser(firebaseUser: FirebaseUser): User {
        return {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || undefined,
            photoURL: firebaseUser.photoURL || undefined,
            createdAt: new Date(firebaseUser.metadata.creationTime!),
            lastLoginAt: new Date(firebaseUser.metadata.lastSignInTime!),
        };
    }
}
