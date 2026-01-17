import { https } from 'firebase-functions/v2';

/**
 * Input Validation Helpers
 * Validate and sanitize function inputs
 */

/**
 * Validate agentMessage input
 */
export interface AgentMessageInput {
    conversationId?: string;
    message: string;
}

export function validateAgentMessageInput(data: unknown): AgentMessageInput {
    if (!data || typeof data !== 'object') {
        throw new https.HttpsError('invalid-argument', 'Invalid input data');
    }

    const { conversationId, message } = data as any;

    // Validate message
    if (!message || typeof message !== 'string') {
        throw new https.HttpsError('invalid-argument', 'Message is required and must be a string');
    }

    const trimmedMessage = message.trim();

    if (trimmedMessage.length === 0) {
        throw new https.HttpsError('invalid-argument', 'Message cannot be empty');
    }

    if (trimmedMessage.length > 1000) {
        throw new https.HttpsError(
            'invalid-argument',
            'Message is too long (maximum 1000 characters)'
        );
    }

    // Validate conversationId (optional)
    if (conversationId !== undefined && typeof conversationId !== 'string') {
        throw new https.HttpsError('invalid-argument', 'ConversationId must be a string');
    }

    return {
        conversationId,
        message: trimmedMessage,
    };
}

/**
 * Validate agentConfirmDraft input
 */
export interface AgentConfirmDraftInput {
    draftId: string;
}

export function validateAgentConfirmDraftInput(data: unknown): AgentConfirmDraftInput {
    if (!data || typeof data !== 'object') {
        throw new https.HttpsError('invalid-argument', 'Invalid input data');
    }

    const { draftId } = data as any;

    if (!draftId || typeof draftId !== 'string') {
        throw new https.HttpsError('invalid-argument', 'DraftId is required and must be a string');
    }

    if (draftId.trim().length === 0) {
        throw new https.HttpsError('invalid-argument', 'DraftId cannot be empty');
    }

    return { draftId: draftId.trim() };
}

/**
 * Validate agentCancelConversation input
 */
export interface AgentCancelConversationInput {
    conversationId: string;
}

export function validateAgentCancelConversationInput(
    data: unknown
): AgentCancelConversationInput {
    if (!data || typeof data !== 'object') {
        throw new https.HttpsError('invalid-argument', 'Invalid input data');
    }

    const { conversationId } = data as any;

    if (!conversationId || typeof conversationId !== 'string') {
        throw new https.HttpsError(
            'invalid-argument',
            'ConversationId is required and must be a string'
        );
    }

    if (conversationId.trim().length === 0) {
        throw new https.HttpsError('invalid-argument', 'ConversationId cannot be empty');
    }

    return { conversationId: conversationId.trim() };
}
