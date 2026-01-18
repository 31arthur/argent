import { AgentConversation } from '../entities/AgentConversation';
import { AgentState } from '../entities/AgentState';
import { IAgentConversationRepository } from '../repositories/IAgentConversationRepository';

const ALLOWED_TRANSITIONS: Record<AgentState, AgentState[]> = {
    [AgentState.IDLE]: [AgentState.EXTRACTING, AgentState.CANCELLED],
    [AgentState.EXTRACTING]: [
        AgentState.ASKING_CLARIFICATION,
        AgentState.WAITING_CONFIRMATION,
        AgentState.CANCELLED,
    ],
    [AgentState.ASKING_CLARIFICATION]: [
        AgentState.EXTRACTING,
        AgentState.WAITING_CONFIRMATION,
        AgentState.CANCELLED,
    ],
    [AgentState.WAITING_CONFIRMATION]: [AgentState.COMPLETED, AgentState.CANCELLED],
    [AgentState.COMPLETED]: [],
    [AgentState.CANCELLED]: [],
};

/**
 * Use Case: Transition Agent State
 */
export class TransitionAgentState {
    constructor(private conversationRepository: IAgentConversationRepository) {}

    async execute(conversationId: string, newState: AgentState): Promise<AgentConversation> {
        const conversation = await this.conversationRepository.getById(conversationId);
        if (!conversation) {
            throw new Error('Conversation not found');
        }

        this.validateTransition(conversation.agentState, newState);

        const updated = await this.conversationRepository.updateState(conversationId, newState);
        await this.conversationRepository.updateActivity(conversationId);

        return updated;
    }

    private validateTransition(from: AgentState, to: AgentState): void {
        const allowedStates = ALLOWED_TRANSITIONS[from];

        if (!allowedStates.includes(to)) {
            throw new Error(
                `Invalid state transition: ${from} → ${to}. Allowed transitions from ${from}: ${allowedStates.join(', ')}`
            );
        }
    }
}
