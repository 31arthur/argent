import { https } from 'firebase-functions/v2';
import { logger } from './logger';

/**
 * Error Handling Utilities
 * Standardized error handling for Cloud Functions
 */

/**
 * Handle errors and convert to user-safe HttpsError
 * Logs full error details server-side
 * Returns generic error message to client
 */
export function handleError(error: unknown, context: string): never {
    // Log full error server-side with detailed context
    logger.error(`[${context}] Error occurred`, {
        error,
        errorType: error?.constructor?.name,
        errorMessage: error instanceof Error ? error.message : String(error)
    });

    // If already an HttpsError, rethrow it
    if (error instanceof https.HttpsError) {
        throw error;
    }

    // Convert known error types
    if (error instanceof Error) {
        // Log internal error details server-side
        logger.error(`[${context}] Internal error details:`, {
            message: error.message,
            stack: error.stack,
        });

        // Check for specific error patterns to provide better error codes
        const errorMessage = error.message.toLowerCase();

        if (errorMessage.includes('not found')) {
            throw new https.HttpsError('not-found', 'The requested resource was not found');
        }

        if (errorMessage.includes('unauthorized') || errorMessage.includes('permission')) {
            throw new https.HttpsError('permission-denied', 'You do not have permission to perform this action');
        }

        if (errorMessage.includes('gemini') || errorMessage.includes('api')) {
            throw new https.HttpsError('unavailable', 'AI service is temporarily unavailable. Please try again.');
        }

        // Generic internal error
        throw new https.HttpsError('internal', 'An internal error occurred. Please try again.');
    }

    // Unknown error type
    logger.error(`[${context}] Unknown error type:`, { error });
    throw new https.HttpsError('unknown', 'An unexpected error occurred. Please try again.');
}

/**
 * Map finalization error codes to HttpsError codes
 */
export function mapFinalizationError(errorCode: string): https.FunctionsErrorCode {
    switch (errorCode) {
        case 'DRAFT_NOT_FOUND':
            return 'not-found';
        case 'UNAUTHORIZED':
            return 'permission-denied';
        case 'DRAFT_NOT_CONFIRMED':
            return 'failed-precondition';
        case 'INCOMPLETE_DRAFT':
            return 'failed-precondition';
        case 'TRANSACTION_CREATION_FAILED':
            return 'internal';
        default:
            return 'internal';
    }
}
