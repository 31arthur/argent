import { onCall } from 'firebase-functions/v2/https';
import { agentOrchestrator, conversationRepository } from '../bootstrap/container';
import { requireAuth } from '../middleware/auth';
import { validateAgentMessageInput } from '../middleware/validation';
import { handleError } from '../utils/errors';
import { logger } from '../utils/logger';

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
            conversationId,
            messageLength: message.length,
        });

        // 3. Get or create conversation
        let activeConversationId = conversationId;

        if (!activeConversationId) {
            // Create new conversation
            const conversation = await conversationRepository.create({
                userId,
                agentState: 'IDLE',
                isDeleted: false,
            });

            activeConversationId = conversation.id;

            logger.info(`${functionName} created new conversation`, {
                function: functionName,
                userId,
                conversationId: activeConversationId,
            });
        } else {
            // Verify conversation ownership
            const conversation = await conversationRepository.getById(activeConversationId);

            if (!conversation) {
                throw new Error('Conversation not found');
            }

            if (conversation.userId !== userId) {
                throw new Error('Unauthorized access to conversation');
            }
        }

        // 4. Call AgentOrchestrator
        const response = await agentOrchestrator.handleAgentMessage(
            userId,
            activeConversationId,
            message
        );

        logger.info(`${functionName} completed`, {
            function: functionName,
            userId,
            conversationId: activeConversationId,
            agentState: response.agentState,
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
        handleError(error, functionName);
    }
});
