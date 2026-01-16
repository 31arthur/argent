import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@/domain/entities/User';
import { UserRepository } from '@/data/repositories/UserRepository';
import { SignInWithGoogle } from '@/domain/usecases/auth/SignInWithGoogle';
import { SignOut } from '@/domain/usecases/auth/SignOut';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const userRepository = new UserRepository();
const signInWithGoogleUseCase = new SignInWithGoogle(userRepository);
const signOutUseCase = new SignOut(userRepository);

/**
 * Auth Provider
 * Manages authentication state across the application
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen to auth state changes
        const unsubscribe = userRepository.onAuthStateChange((user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            const user = await signInWithGoogleUseCase.execute();
            setUser(user);
        } catch (error) {
            console.error('Sign in failed:', error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await signOutUseCase.execute();
            setUser(null);
        } catch (error) {
            console.error('Sign out failed:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * useAuth Hook
 * Access authentication state and methods
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
