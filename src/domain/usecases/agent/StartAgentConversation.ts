import type { AgentConversation } from '@/domain/entities/AgentConversation';
import type { IAgentConversationRepository } from '@/domain/repositories/IAgentConversationRepository';
import { AgentState } from '@/domain/entities/AgentState';

/**
 * Use Case: Start Agent Conversation
 * Initiates a new agent conversation for a user
 * 
 * RULES:
 * - User can only have ONE active conversation at a time
 * - Active = agentState not in [COMPLETED, CANCELLED]
 * - Initial state is IDLE
 * - No draft is created yet (happens when agent starts extracting)
 */
export class StartAgentConversation {
    constructor(private conversationRepository: IAgentConversationRepository) { }

    /**
     * Execute conversation start
     * 
     * @param userId - ID of the user starting the conversation
     * @returns The created conversation
     * @throws Error if user already has an active conversation
     */
    async execute(userId: string): Promise<AgentConversation> {
        // Check for existing active conversation
        const existing = await this.conversationRepository.getActiveByUser(userId);
        if (existing) {
            throw new Error(
                'User already has an active conversation. Please complete or cancel it first.'
            );
        }

        // Create new conversation
        return this.conversationRepository.create({
            userId,
            agentState: AgentState.IDLE,
            isDeleted: false,
        });
    }
}
