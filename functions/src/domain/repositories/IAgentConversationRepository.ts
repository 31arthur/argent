import { AgentConversation } from '../entities/AgentConversation';
import { AgentState } from '../entities/AgentState';

/**
 * Agent Conversation Repository Interface
 */
export interface IAgentConversationRepository {
    getById(id: string): Promise<AgentConversation | null>;
    getActiveByUser(userId: string): Promise<AgentConversation | null>;
    getAllByUser(userId: string): Promise<AgentConversation[]>;
    create(conversation: Omit<AgentConversation, 'id' | 'startedAt' | 'lastActivityAt'>): Promise<AgentConversation>;
    updateState(id: string, newState: AgentState): Promise<AgentConversation>;
    updateActivity(id: string): Promise<AgentConversation>;
    updateActiveDraftId(id: string, draftId: string): Promise<AgentConversation>;
    markAsCompleted(id: string): Promise<AgentConversation>;
    markAsCancelled(id: string): Promise<AgentConversation>;
    softDelete(id: string): Promise<void>;
}
