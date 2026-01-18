import { AgentState } from './AgentState';

/**
 * Agent Conversation Entity
 * Represents an AI conversation session for creating a transaction
 */
export interface AgentConversation {
    id: string;
    userId: string;
    agentState: AgentState;
    activeDraftId: string | null;
    isDeleted: boolean;
    completedAt: Date | null;
    startedAt: Date;
    lastActivityAt: Date;
}
