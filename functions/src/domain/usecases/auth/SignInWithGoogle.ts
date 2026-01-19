import type { User } from '../../entities/User';
import type { IUserRepository } from '../../repositories/IUserRepository';

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


