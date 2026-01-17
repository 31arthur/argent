import { onCall } from 'firebase-functions/v2/https';
import { finalizeTransactionDraft } from '../bootstrap/container';
import { requireAuth } from '../middleware/auth';
import { validateAgentConfirmDraftInput } from '../middleware/validation';
import { handleError, mapFinalizationError } from '../utils/errors';
import { logger } from '../utils/logger';
import { https } from 'firebase-functions/v2';

/**
 * Cloud Function: agentConfirmDraft
 * 
 * PURPOSE:
 * Finalize a CONFIRMED TransactionDraft (create real transaction)
 * 
 * INPUT:
 * - draftId (required): Draft to finalize
 * 
 * OUTPUT:
 * - status: 'SUCCESS' | 'ALREADY_FINALIZED' | 'ERROR'
 * - transactionId: Created transaction ID (if successful)
 * - errorCode: Error code (if failed)
 * - errorMessage: Error message (if failed)
 * 
 * SECURITY:
 * - Requires Firebase Authentication
 * - Ownership verified in use case
 * - Idempotent (safe to retry)
 */
export const agentConfirmDraft = onCall(async (request): Promise<any> => {
    const functionName = 'agentConfirmDraft';

    try {
        // 1. Verify authentication
        const userId = requireAuth(request);

        logger.info(`${functionName} called`, {
            function: functionName,
            userId,
        });

        // 2. Validate input
        const { draftId } = validateAgentConfirmDraftInput(request.data);

        logger.info(`${functionName} finalizing draft`, {
            function: functionName,
            userId,
            draftId,
        });

        // 3. Call FinalizeTransactionDraft use case
        const result = await finalizeTransactionDraft.execute(draftId, userId);

        // 4. Log result
        if (result.status === 'SUCCESS') {
            logger.info(`${functionName} success`, {
                function: functionName,
                userId,
                draftId,
                transactionId: result.transactionId,
            });
        } else if (result.status === 'ALREADY_FINALIZED') {
            logger.info(`${functionName} already finalized`, {
                function: functionName,
                userId,
                draftId,
                transactionId: result.transactionId,
            });
        } else {
            logger.warn(`${functionName} failed`, {
                function: functionName,
                userId,
                draftId,
                errorCode: result.errorCode,
            });
        }

        // 5. Handle errors
        if (result.status === 'ERROR' && result.errorCode) {
            const errorCode = mapFinalizationError(result.errorCode);
            throw new https.HttpsError(errorCode, result.errorMessage || 'Finalization failed');
        }

        // 6. Return result
        return {
            status: result.status,
            transactionId: result.transactionId,
            errorCode: result.errorCode,
            errorMessage: result.errorMessage,
        };
    } catch (error) {
        handleError(error, functionName);
    }
});
