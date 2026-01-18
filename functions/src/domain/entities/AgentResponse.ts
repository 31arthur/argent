import { AgentState } from './AgentState';
import { ConfirmationPayload } from './ConfirmationPayload';
import { SelectableOption } from './SelectableOption';
import { TransactionDraft } from './TransactionDraft';

/**
 * Agent Response
 * Structured response from agent to UI
 */
export interface AgentResponse {
    message: string;
    agentState: AgentState;
    requiresUserInput: boolean;
    confirmationPayload?: ConfirmationPayload;
    selectableOptions?: SelectableOption[];
    updatedDraft?: TransactionDraft;
}
