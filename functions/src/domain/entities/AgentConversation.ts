import type { AgentState } from './AgentState';

/**
 * Domain Entity: AgentConversation
 * Represents an AI conversation session focused on creating a transaction
 * 
 * INVARIANTS:
 * - One conversation can have at most ONE active draft
 * - Conversation can be resumed if agentState !== COMPLETED && agentState !== CANCELLED
 * - lastActivityAt updates on every state transition
 * - Conversation is user-scoped
 * 
 * PURPOSE:
 * - Track agent state machine
 * - Reference active draft
 * - Enable conversation resumption after page refresh
 * - Maintain conversation context
 * 
 * LIFECYCLE:
 * 1. Created with agentState = IDLE
 * 2. State transitions as agent processes user input
 * 3. References a TransactionDraft via activeDraftId
 * 4. Completes when draft is confirmed and converted
 * 5. Can be cancelled at any time
 * 
 * NOTE: This is NOT a chat log - it's a state machine container.
 * Chat messages (if implemented) would be stored separately.
 */
export interface AgentConversation {
    /**
     * Unique identifier for the conversation
     */
    id: string;

    /**
     * User who owns this conversation
     */
    userId: string;

    /**
     * Current state of the AI agent
     * Determines what actions are allowed and what the agent should do next
     */
    agentState: AgentState;

    /**
     * Reference to the active transaction draft
     * Only set when a draft is being worked on
     */
    activeDraftId?: string;

    /**
     * Reference to the finalized draft (if conversation completed successfully)
     * Only set when agentState === COMPLETED
     */
    finalizedDraftId?: string;

    /**
     * When the conversation started
     */
    startedAt: Date;

    /**
     * When the last activity occurred
     * Updated on every state transition or user interaction
     */
    lastActivityAt: Date;

    /**
     * When the conversation was completed
     * Only set when agentState === COMPLETED
     */
    completedAt?: Date;

    /**
     * Soft delete flag
     * Allows conversation history to be preserved
     */
    isDeleted: boolean;

    /**
     * When the conversation was soft deleted
     */
    deletedAt?: Date;
}

