import type { ChatMessage } from '../entities/ChatMessage';

/**
 * Repository Interface: IChatMessageRepository
 * Defines the contract for chat message data operations
 * 
 * STORAGE STRATEGY:
 * - Firestore collection: 'chatMessages'
 * - Ordered by timestamp (ascending)
 * - Append-only (messages are never modified)
 * 
 * REQUIRED FIRESTORE INDEXES:
 * - conversationId + timestamp (ascending)
 * 
 * PURPOSE:
 * - Store UI chat history
 * - Enable conversation display
 * - Provide audit trail
 * 
 * CRITICAL RULE:
 * - Agent logic NEVER queries this repository for decision-making
 * - Only used for UI display
 */
export interface IChatMessageRepository {
    /**
     * Retrieve all messages for a conversation
     * Ordered by timestamp (ascending)
     */
    getByConversation(conversationId: string): Promise<ChatMessage[]>;

    /**
     * Create a new message
     * Timestamp is set automatically
     */
    create(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage>;

    /**
     * Delete all messages for a conversation
     * Used when conversation is permanently deleted
     */
    deleteByConversation(conversationId: string): Promise<void>;
}

