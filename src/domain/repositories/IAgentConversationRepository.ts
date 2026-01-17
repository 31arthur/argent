import type { AgentConversation } from '../entities/AgentConversation';
import type { AgentState } from '../entities/AgentState';

/**
 * Repository Interface: IAgentConversationRepository
 * Defines the contract for agent conversation data operations
 * 
 * STORAGE STRATEGY:
 * - Separate Firestore collection: 'agentConversations'
 * - User-scoped queries
 * - Soft delete by default
 * - Conversations can be resumed after page refresh
 * 
 * REQUIRED FIRESTORE INDEXES:
 * - userId + lastActivityAt (descending)
 * - userId + agentState
 */
export interface IAgentConversationRepository {
    /**
     * Retrieve a conversation by its ID
     */
    getById(id: string): Promise<AgentConversation | null>;

    /**
     * Retrieve the active conversation for a user
     * Returns null if no active conversation exists
     * Active = agentState not in [COMPLETED, CANCELLED]
     */
    getActiveByUser(userId: string): Promise<AgentConversation | null>;

    /**
     * Retrieve all conversations for a user
     * Ordered by lastActivityAt descending
     */
    getAllByUser(userId: string): Promise<AgentConversation[]>;

    /**
     * Create a new conversation
     */
    create(
        conversation: Omit<AgentConversation, 'id' | 'startedAt' | 'lastActivityAt'>
    ): Promise<AgentConversation>;

    /**
     * Update the agent state
     * Automatically updates 'lastActivityAt' timestamp
     */
    updateState(id: string, newState: AgentState): Promise<AgentConversation>;

    /**
     * Update the last activity timestamp
     * Called on every user interaction or state change
     */
    updateActivity(id: string): Promise<AgentConversation>;

    /**
     * Mark a conversation as completed
     * Sets agentState to COMPLETED and sets completedAt timestamp
     */
    markAsCompleted(id: string): Promise<AgentConversation>;

    /**
     * Mark a conversation as cancelled
     * Sets agentState to CANCELLED
     */
    markAsCancelled(id: string): Promise<AgentConversation>;

    /**
     * Soft delete a conversation
     * Conversation remains in database but is excluded from normal queries
     */
    softDelete(id: string): Promise<void>;
}
