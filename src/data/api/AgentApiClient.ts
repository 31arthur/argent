import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * Response types from Cloud Functions
 */
export interface AgentMessageResponse {
    conversationId: string;
    agentState: string;
    message: string;
    confirmationPayload?: ConfirmationPayload;
    selectableOptions?: SelectableOption[];
    updatedDraft?: any;
    requiresUserInput: boolean;
}

export interface ConfirmationPayload {
    draftId: string;
    summary: {
        poolName: string;
        amount: number;
        type: string;
        categoryName: string;
        purpose: string;
        date: Date;
        notes?: string;
        tags?: string[];
    };
    actions: string[];
}

export interface SelectableOption {
    id: string;
    label: string;
    value: string;
}

export interface ConfirmDraftResponse {
    status: 'SUCCESS' | 'ALREADY_FINALIZED' | 'ERROR';
    transactionId?: string;
    errorCode?: string;
    errorMessage?: string;
}

export interface CancelConversationResponse {
    success: boolean;
    conversationId: string;
}

/**
 * AgentApiClient
 * 
 * Firebase Cloud Functions client for AI agent.
 * Handles communication with backend agent functions.
 * 
 * Features:
 * - Auto-attaches Firebase auth token
 * - Handles request/response mapping
 * - Throws structured errors
 * - No UI logic
 */
export class AgentApiClient {
    private functions = getFunctions();

    /**
     * Send a message to the AI agent
     * 
     * @param conversationId - Existing conversation ID (null for new conversation)
     * @param message - User message
     * @returns Agent response with conversation state
     */
    async sendMessage(
        conversationId: string | null,
        message: string
    ): Promise<AgentMessageResponse> {
        try {
            const agentMessage = httpsCallable<
                { conversationId?: string; message: string },
                AgentMessageResponse
            >(this.functions, 'agentMessage');

            // Only include conversationId if it's a valid string
            const payload: { conversationId?: string; message: string } = { message };
            if (conversationId) {
                payload.conversationId = conversationId;
            }

            const response = await agentMessage(payload);

            return response.data;
        } catch (error: any) {
            throw this.handleError(error, 'sendMessage');
        }
    }

    /**
     * Confirm a transaction draft
     * 
     * @param draftId - Draft ID to confirm
     * @returns Confirmation result
     */
    async confirmDraft(draftId: string): Promise<ConfirmDraftResponse> {
        try {
            const agentConfirmDraft = httpsCallable<
                { draftId: string },
                ConfirmDraftResponse
            >(this.functions, 'agentConfirmDraft');

            const response = await agentConfirmDraft({ draftId });

            return response.data;
        } catch (error: any) {
            throw this.handleError(error, 'confirmDraft');
        }
    }

    /**
     * Cancel an active conversation
     * 
     * @param conversationId - Conversation ID to cancel
     * @returns Cancellation result
     */
    async cancelConversation(conversationId: string): Promise<CancelConversationResponse> {
        try {
            const agentCancelConversation = httpsCallable<
                { conversationId: string },
                CancelConversationResponse
            >(this.functions, 'agentCancelConversation');

            const response = await agentCancelConversation({ conversationId });

            return response.data;
        } catch (error: any) {
            throw this.handleError(error, 'cancelConversation');
        }
    }

    /**
     * Handle errors from Cloud Functions
     * 
     * @param error - Error from Cloud Functions
     * @param context - Context of the error
     * @returns Structured error
     */
    private handleError(error: any, context: string): Error {
        console.error(`[AgentApiClient.${context}]`, error);

        // Extract error code and message
        const code = error.code || 'unknown';
        const message = error.message || 'An unknown error occurred';

        // Create structured error
        const structuredError = new Error(message);
        (structuredError as any).code = code;
        (structuredError as any).context = context;

        return structuredError;
    }
}

// Export singleton instance
export const agentApiClient = new AgentApiClient();
