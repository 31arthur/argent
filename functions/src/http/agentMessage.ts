import { onCall } from 'firebase-functions/v2/https';
import { agentOrchestrator, conversationRepository } from '../bootstrap/container';
import { requireAuth } from '../middleware/auth';
import { validateAgentMessageInput } from '../middleware/validation';
import { handleError } from '../utils/errors';
import { logger } from '../utils/logger';
import { AgentState } from '../domain/entities/AgentState';

/**
 * Cloud Function: agentMessage
 * Handle user chat messages sent to the AI agent
 */
export const agentMessage = onCall(async (request): Promise<any> => {
    const functionName = 'agentMessage';

    try {
        // 1. Verify authentication
        const userId = requireAuth(request);

        logger.info(`${functionName} called`, {
            function: functionName,
            userId,
        });

        // 2. Validate input
        const { conversationId, message } = validateAgentMessageInput(request.data);

        logger.info(`${functionName} processing message`, {
            function: functionName,
            userId,
            conversationId: conversationId || 'new',
            messageLength: message.length,
        });

        // 3. Get or create conversation
        let activeConversationId = conversationId;

        if (!activeConversationId) {
            // Create new conversation
            logger.info(`${functionName} creating new conversation`, {
                function: functionName,
                userId,
            });

            const conversation = await conversationRepository.create({
                userId,
                agentState: AgentState.IDLE,
                activeDraftId: null,
                isDeleted: false,
                completedAt: null,
            });

            activeConversationId = conversation.id;

            logger.info(`${functionName} created new conversation`, {
                function: functionName,
                userId,
                conversationId: activeConversationId,
            });
        } else {
            // Verify conversation exists and ownership
            const conversation = await conversationRepository.getById(activeConversationId);

            if (!conversation) {
                // Conversation doesn't exist - create a new one instead of erroring
                logger.warn(`${functionName} conversation not found, creating new one`, {
                    function: functionName,
                    userId,
                    staleConversationId: activeConversationId,
                });

                const newConversation = await conversationRepository.create({
                    userId,
                    agentState: AgentState.IDLE,
                    activeDraftId: null,
                    isDeleted: false,
                    completedAt: null,
                });

                activeConversationId = newConversation.id;

                logger.info(`${functionName} created new conversation after stale ID`, {
                    function: functionName,
                    userId,
                    conversationId: activeConversationId,
                });
            } else if (conversation.userId !== userId) {
                // Conversation exists but belongs to different user
                logger.warn(`${functionName} unauthorized access attempt`, {
                    function: functionName,
                    userId,
                    conversationId: activeConversationId,
                    conversationUserId: conversation.userId,
                });
                throw new Error('Unauthorized access to conversation');
            }
        }

        // 4. Call AgentOrchestrator
        logger.info(`${functionName} calling orchestrator`, {
            function: functionName,
            userId,
            conversationId: activeConversationId,
        });

        const response = await agentOrchestrator.handleAgentMessage(
            userId,
            activeConversationId,
            message
        );

        logger.info(`${functionName} completed successfully`, {
            function: functionName,
            userId,
            conversationId: activeConversationId,
            agentState: response.agentState,
            requiresUserInput: response.requiresUserInput,
        });

        // 5. Return structured response
        return {
            conversationId: activeConversationId,
            agentState: response.agentState,
            message: response.message,
            confirmationPayload: response.confirmationPayload,
            selectableOptions: response.selectableOptions,
            updatedDraft: response.updatedDraft,
            requiresUserInput: response.requiresUserInput,
        };
    } catch (error) {
        // handleError will throw an HttpsError, which Firebase will catch and return to client
        handleError(error, functionName);
    }
});
