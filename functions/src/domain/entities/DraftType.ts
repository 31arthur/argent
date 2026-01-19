/**
 * Draft Type Enum
 * Defines the type of financial action the AI agent is processing
 * 
 * TYPES:
 * - TRANSACTION: Regular income/expense transaction
 * - LOAN_CREATION: Creating a new loan (borrowed or lent)
 * - LOAN_REPAYMENT: Repaying an existing loan (full or partial)
 * - LEAD: Tracking potential future income
 * - BUDGET_ALLOCATION: Setting budget for a category in a specific month
 */
export type DraftType =
    | 'TRANSACTION'
    | 'LOAN_CREATION'
    | 'LOAN_REPAYMENT'
    | 'LEAD'
    | 'BUDGET_ALLOCATION';

/**
 * Draft Status
 * Tracks the lifecycle of a draft
 */
export type DraftStatus =
    | 'INCOMPLETE' // Missing required fields
    | 'READY' // All fields present, awaiting confirmation
    | 'CONFIRMED' // User approved, ready for finalization
    | 'FINALIZED' // Converted to actual entity
    | 'CANCELLED'; // User rejected or abandoned

/**
 * Base Draft Interface
 * Common fields for all draft types
 */
export interface BaseDraft {
    id: string;
    userId: string;
    conversationId: string;
    type: DraftType;
    status: DraftStatus;
    missingFields: string[]; // Fields that need clarification
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
}

