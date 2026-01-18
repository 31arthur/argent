/**
 * Draft Status Enum
 * Defines the lifecycle states of a TransactionDraft
 */
export enum DraftStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    WAITING_FOR_INPUT = 'WAITING_FOR_INPUT',
    WAITING_FOR_CONFIRMATION = 'WAITING_FOR_CONFIRMATION',
    CONFIRMED = 'CONFIRMED',
    FINALIZED = 'FINALIZED',
    CANCELLED = 'CANCELLED',
}
