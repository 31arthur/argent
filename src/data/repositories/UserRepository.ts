import type { User } from '@/domain/entities/User';
import type { IUserRepository } from '@/domain/repositories/IUserRepository';
import { FirebaseAuthAdapter } from '../firebase/auth';

/**
 * User Repository Implementation
 * Implements IUserRepository using Firebase Auth
 */
export class UserRepository implements IUserRepository {
    async getCurrentUser(): Promise<User | null> {
        return FirebaseAuthAdapter.getCurrentUser();
    }

    async signInWithGoogle(): Promise<User> {
        return await FirebaseAuthAdapter.signInWithGoogle();
    }

    async signOut(): Promise<void> {
        await FirebaseAuthAdapter.signOut();
    }

    onAuthStateChange(callback: (user: User | null) => void): () => void {
        return FirebaseAuthAdapter.onAuthStateChange(callback);
    }
}
