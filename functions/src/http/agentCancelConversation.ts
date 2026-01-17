import { onCall } from 'firebase-functions/v2/https';
import { conversationRepository } from '../bootstrap/container';
import { requireAuth, verifyOwnership } from '../middleware/auth';
import { validateAgentCancelConversationInput } from '../middleware/validation';
import { handleError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Cloud Function: agentCancelConversation
 * 
 * PURPOSE:
 * Explicitly cancel an active agent conversation
 * 
 * INPUT:
 * - conversationId (required): Conversation to cancel
 * 
 * OUTPUT:
 * - success: boolean
 * - conversationId: Cancelled conversation ID
 * 
 * SECURITY:
 * - Requires Firebase Authentication
 * - Users can only cancel their own conversations
 */
export const agentCancelConversation = onCall(async (request): Promise<any> => {
    const functionName = 'agentCancelConversation';

    try {
        // 1. Verify authentication
        const userId = requireAuth(request);

        logger.info(`${functionName} called`, {
            function: functionName,
            userId,
        });

        // 2. Validate input
        const { conversationId } = validateAgentCancelConversationInput(request.data);

        logger.info(`${functionName} cancelling conversation`, {
            function: functionName,
            userId,
            conversationId,
        });

        // 3. Load conversation
        const conversation = await conversationRepository.getById(conversationId);

        if (!conversation) {
            throw new Error('Conversation not found');
        }

        // 4. Verify ownership
        verifyOwnership(conversation.userId, userId);

        // 5. Transition to CANCELLED state
        await conversationRepository.markAsCancelled(conversationId);

        logger.info(`${functionName} completed`, {
            function: functionName,
            userId,
            conversationId,
        });

        // 6. Return success
        return {
            success: true,
            conversationId,
        };
    } catch (error) {
        handleError(error, functionName);
    }
});
