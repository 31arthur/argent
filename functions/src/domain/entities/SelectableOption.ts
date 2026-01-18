/**
 * Selectable Option
 * Represents an option in a selection UI
 */
export interface SelectableOption {
    id: string;
    label: string;
    value: string;
    metadata?: Record<string, unknown>;
}
