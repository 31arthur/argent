import * as functions from 'firebase-functions/v2';

/**
 * Structured Logger
 * Provides consistent, traceable logging across Cloud Functions
 * 
 * PRIVACY RULES:
 * - Log IDs (userId, conversationId, draftId)
 * - Log state transitions
 * - Log error codes
 * - NEVER log raw user messages
 * - NEVER log extracted amounts/descriptions
 */

interface LogMetadata {
    function?: string;
    userId?: string;
    conversationId?: string;
    draftId?: string;
    agentState?: string;
    [key: string]: unknown;
}

class Logger {
    /**
     * Log info message
     */
    info(message: string, metadata?: LogMetadata): void {
        functions.logger.info(message, metadata);
    }

    /**
     * Log warning message
     */
    warn(message: string, metadata?: LogMetadata): void {
        functions.logger.warn(message, metadata);
    }

    /**
     * Log error message
     */
    error(message: string, metadata?: LogMetadata): void {
        functions.logger.error(message, metadata);
    }

    /**
     * Log debug message
     */
    debug(message: string, metadata?: LogMetadata): void {
        functions.logger.debug(message, metadata);
    }
}

export const logger = new Logger();
