/**
 * Agent State Enum
 * Defines the AI agent's operational state during a conversation
 * 
 * STATE TRANSITIONS:
 * - IDLE → EXTRACTING (conversation starts)
 * - EXTRACTING → ASKING_CLARIFICATION (missing required data)
 * - EXTRACTING → WAITING_CONFIRMATION (draft complete)
 * - ASKING_CLARIFICATION → EXTRACTING (user provides info)
 * - WAITING_CONFIRMATION → COMPLETED (draft confirmed & converted)
 * - WAITING_CONFIRMATION → CANCELLED (user rejects)
 * - Any state → CANCELLED (user abandons)
 * 
 * i18n KEYS (to be defined in presentation layer):
 * - agent.state.idle
 * - agent.state.extracting
 * - agent.state.asking_clarification
 * - agent.state.waiting_confirmation
 * - agent.state.completed
 * - agent.state.cancelled
 */
export enum AgentState {
    /**
     * No active conversation or processing
     */
    IDLE = 'IDLE',

    /**
     * Agent is processing user input and extracting transaction data
     */
    EXTRACTING = 'EXTRACTING',

    /**
     * Agent needs clarification on missing or ambiguous information
     */
    ASKING_CLARIFICATION = 'ASKING_CLARIFICATION',

    /**
     * Draft is complete and awaiting user confirmation
     */
    WAITING_CONFIRMATION = 'WAITING_CONFIRMATION',

    /**
     * Draft has been confirmed and converted to a real transaction
     * This is a terminal state
     */
    COMPLETED = 'COMPLETED',

    /**
     * Conversation has been cancelled or abandoned
     * This is a terminal state
     */
    CANCELLED = 'CANCELLED',
}
