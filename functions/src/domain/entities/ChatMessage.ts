import type { AgentState } from './AgentState';
import type { DraftStatus } from './DraftStatus';

/**
 * Chat Message Sender Type
 */
export type MessageSender = 'user' | 'agent';

/**
 * Domain Entity: ChatMessage
 * Represents a single message in the conversation history
 * 
 * PURPOSE:
 * - UI display and audit trail
 * - Append-only, never modified
 * - Ordered by timestamp
 * 
 * CRITICAL RULE:
 * - Agent logic NEVER reads chat history for decisions
 * - Chat history is for humans, not logic
 * - All agent decisions are based on structured state (TransactionDraft, AgentConversation)
 * 
 * STORAGE:
 * - Separate collection from AgentConversation
 * - Ordered by timestamp
 * - Can be loaded for UI display
 */
export interface ChatMessage {
    /**
     * Unique identifier for the message
     */
    id: string;

    /**
     * Reference to the conversation this message belongs to
     */
    conversationId: string;

    /**
     * Who sent this message
     */
    sender: MessageSender;

    /**
     * Message content (plain text)
     */
    content: string;

    /**
     * When the message was sent
     */
    timestamp: Date;

    /**
     * Optional metadata for debugging and audit
     * NOT used for agent logic
     */
    metadata?: {
        /**
         * Agent state at the time of this message
         */
        agentStateAtTime?: AgentState;

        /**
         * Draft status at the time of this message
         */
        draftStatusAtTime?: DraftStatus;
    };
}

