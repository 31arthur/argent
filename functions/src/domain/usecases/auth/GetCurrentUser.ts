import type { User } from '../../entities/User';
import type { IUserRepository } from '../../repositories/IUserRepository';

/**
 * Use Case: Get Current User
 * Retrieves the currently authenticated user
 */
export class GetCurrentUser {
    private userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    async execute(): Promise<User | null> {
        return await this.userRepository.getCurrentUser();
    }
}


