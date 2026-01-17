/**
 * Draft Status Enum
 * Defines the lifecycle states of a TransactionDraft
 * 
 * STATE TRANSITIONS:
 * - IN_PROGRESS → WAITING_FOR_INPUT (when required fields missing)
 * - IN_PROGRESS → WAITING_FOR_CONFIRMATION (when all fields present)
 * - WAITING_FOR_INPUT → WAITING_FOR_CONFIRMATION (when user provides missing data)
 * - WAITING_FOR_CONFIRMATION → CONFIRMED (user approves)
 * - WAITING_FOR_CONFIRMATION → CANCELLED (user rejects)
 * - CONFIRMED → FINALIZED (via FinalizeTransactionDraft use case ONLY)
 * - CONFIRMED → CANCELLED (user cancels before finalization)
 * - Any state → CANCELLED (user abandons)
 * 
 * TERMINAL STATES:
 * - FINALIZED (draft converted to transaction, immutable)
 * - CANCELLED (draft rejected, immutable)
 * 
 * i18n KEYS (to be defined in presentation layer):
 * - agent.draft.status.in_progress
 * - agent.draft.status.waiting_for_input
 * - agent.draft.status.waiting_for_confirmation
 * - agent.draft.status.confirmed
 * - agent.draft.status.finalized
 * - agent.draft.status.cancelled
 */
export enum DraftStatus {
    /**
     * Agent is actively extracting data from user input
     */
    IN_PROGRESS = 'IN_PROGRESS',

    /**
     * Draft is missing required fields and needs user input
     */
    WAITING_FOR_INPUT = 'WAITING_FOR_INPUT',

    /**
     * All required fields are present, awaiting user confirmation
     */
    WAITING_FOR_CONFIRMATION = 'WAITING_FOR_CONFIRMATION',

    /**
     * User has approved the draft - ready for conversion to transaction
     */
    CONFIRMED = 'CONFIRMED',

    /**
     * Draft has been converted to a real transaction (terminal state)
     * ONLY set by FinalizeTransactionDraft use case
     */
    FINALIZED = 'FINALIZED',

    /**
     * User has rejected or abandoned the draft (terminal state)
     */
    CANCELLED = 'CANCELLED',
}
