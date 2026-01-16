import type { User } from '../entities/User';

/**
 * Repository Interface: IUserRepository
 * Defines the contract for user data operations
 */
export interface IUserRepository {
    getCurrentUser(): Promise<User | null>;
    signInWithGoogle(): Promise<User>;
    signOut(): Promise<void>;
    onAuthStateChange(callback: (user: User | null) => void): () => void;
}
