import type { AgentConversation } from '../../entities/AgentConversation';
import type { IAgentConversationRepository } from '../../repositories/IAgentConversationRepository';
import { AgentState } from '../../entities/AgentState';

/**
 * Allowed State Transitions
 * Defines the state machine for agent state transitions
 */
const ALLOWED_TRANSITIONS: Record<AgentState, AgentState[]> = {
    [AgentState.IDLE]: [AgentState.EXTRACTING, AgentState.CANCELLED],
    [AgentState.EXTRACTING]: [
        AgentState.ASKING_CLARIFICATION,
        AgentState.WAITING_CONFIRMATION,
        AgentState.CANCELLED,
    ],
    [AgentState.ASKING_CLARIFICATION]: [AgentState.EXTRACTING, AgentState.CANCELLED],
    [AgentState.WAITING_CONFIRMATION]: [AgentState.COMPLETED, AgentState.CANCELLED],
    [AgentState.COMPLETED]: [], // Terminal state
    [AgentState.CANCELLED]: [], // Terminal state
};

/**
 * Use Case: Transition Agent State
 * Manages agent state transitions with validation
 * 
 * RULES:
 * - State transitions must follow the state machine
 * - Invalid transitions throw an error
 * - Terminal states (COMPLETED, CANCELLED) cannot transition
 * - Every transition updates lastActivityAt
 * 
 * STATE MACHINE:
 * IDLE → EXTRACTING | CANCELLED
 * EXTRACTING → ASKING_CLARIFICATION | WAITING_CONFIRMATION | CANCELLED
 * ASKING_CLARIFICATION → EXTRACTING | CANCELLED
 * WAITING_CONFIRMATION → COMPLETED | CANCELLED
 * COMPLETED → (none)
 * CANCELLED → (none)
 */
export class TransitionAgentState {
    constructor(private conversationRepository: IAgentConversationRepository) { }

    /**
     * Execute state transition
     * 
     * @param conversationId - ID of the conversation
     * @param newState - The new state to transition to
     * @returns The updated conversation
     * @throws Error if conversation not found or transition is invalid
     */
    async execute(conversationId: string, newState: AgentState): Promise<AgentConversation> {
        const conversation = await this.conversationRepository.getById(conversationId);
        if (!conversation) {
            throw new Error('Conversation not found');
        }

        // Validate transition
        this.validateTransition(conversation.agentState, newState);

        // Update state
        const updated = await this.conversationRepository.updateState(conversationId, newState);

        // Update activity timestamp
        await this.conversationRepository.updateActivity(conversationId);

        return updated;
    }

    /**
     * Validate state transition
     * 
     * @param from - Current state
     * @param to - Target state
     * @throws Error if transition is not allowed
     */
    private validateTransition(from: AgentState, to: AgentState): void {
        const allowedStates = ALLOWED_TRANSITIONS[from];

        if (!allowedStates.includes(to)) {
            throw new Error(
                `Invalid state transition: ${from} → ${to}. Allowed transitions from ${from}: ${allowedStates.join(', ')}`
            );
        }
    }
}

