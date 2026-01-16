import type { User } from '@/domain/entities/User';
import type { IUserRepository } from '@/domain/repositories/IUserRepository';

/**
 * Use Case: Sign In With Google
 * Handles Google OAuth authentication
 */
export class SignInWithGoogle {
    private userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    async execute(): Promise<User> {
        return await this.userRepository.signInWithGoogle();
    }
}
