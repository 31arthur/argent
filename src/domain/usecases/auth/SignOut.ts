import type { IUserRepository } from '@/domain/repositories/IUserRepository';

/**
 * Use Case: Sign Out
 * Handles user sign out
 */
export class SignOut {
    private userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    async execute(): Promise<void> {
        await this.userRepository.signOut();
    }
}
