import type { AgentState } from './AgentState';
import type { TransactionDraft } from './TransactionDraft';
import type { ConfirmationPayload } from './ConfirmationPayload';
import type { SelectableOption } from './SelectableOption';

/**
 * Agent Response
 * Structured response from agent to UI
 * 
 * PURPOSE:
 * - Provide all data needed for UI rendering
 * - Enable different UI patterns (text, options, confirmation)
 * - Decouple agent logic from UI implementation
 * 
 * UI RENDERING LOGIC:
 * - If confirmationPayload exists → render confirmation card
 * - Else if selectableOptions exists → render message + option buttons
 * - Else → render plain text message + input field
 */
export interface AgentResponse {
    /**
     * Message to display to the user
     * Plain text, no formatting
     */
    message: string;

    /**
     * Current agent state after processing
     */
    agentState: AgentState;

    /**
     * Whether the agent is waiting for user input
     * - true: Show input field or options
     * - false: Processing complete, no input needed
     */
    requiresUserInput: boolean;

    /**
     * Optional confirmation payload
     * Present when agentState === WAITING_CONFIRMATION
     */
    confirmationPayload?: ConfirmationPayload;

    /**
     * Optional selectable options
     * Present when agent needs user to choose from options
     */
    selectableOptions?: SelectableOption[];

    /**
     * Updated draft (if changed during this interaction)
     * Allows UI to update draft display without additional query
     */
    updatedDraft?: TransactionDraft;
}
