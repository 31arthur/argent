/**
 * Selectable Option
 * Represents a choice that can be presented to the user
 * 
 * USE CASES:
 * - Multiple cash pools → select one
 * - Multiple categories → select one
 * - Date disambiguation → select date
 * - Yes/No questions → select answer
 */
export interface SelectableOption {
    /**
     * Unique identifier for this option
     */
    id: string;

    /**
     * Display label for the user
     */
    label: string;

    /**
     * Value to use when this option is selected
     */
    value: string;

    /**
     * Optional metadata for additional context
     */
    metadata?: Record<string, unknown>;
}
