/**
 * Agent State Enum
 * Defines the AI agent's operational state during a conversation
 */
export enum AgentState {
    IDLE = 'IDLE',
    EXTRACTING = 'EXTRACTING',
    ASKING_CLARIFICATION = 'ASKING_CLARIFICATION',
    WAITING_CONFIRMATION = 'WAITING_CONFIRMATION',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}
