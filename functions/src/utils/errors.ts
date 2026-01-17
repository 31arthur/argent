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
    // Log full error server-side
    logger.error(`[${context}] Error occurred`, { error });

    // If already an HttpsError, rethrow it
    if (error instanceof https.HttpsError) {
        throw error;
    }

    // Convert known error types
    if (error instanceof Error) {
        // Don't leak internal error messages to client
        logger.error(`[${context}] Internal error:`, {
            message: error.message,
            stack: error.stack,
        });

        throw new https.HttpsError('internal', 'An internal error occurred');
    }

    // Unknown error type
    logger.error(`[${context}] Unknown error type:`, { error });
    throw new https.HttpsError('unknown', 'An unknown error occurred');
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
