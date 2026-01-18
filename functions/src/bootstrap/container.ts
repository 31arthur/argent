import * as dotenv from 'dotenv';
import { firestore } from './firestore';
import { logger } from '../utils/logger';

// Import repositories
import { AgentConversationRepository } from '../data/repositories/AgentConversationRepository';
import { TransactionDraftRepository } from '../data/repositories/TransactionDraftRepository';
import { CashPoolRepository } from '../data/repositories/CashPoolRepository';
import { CategoryRepository } from '../data/repositories/CategoryRepository';

// Import domain services
import { AgentOrchestrator } from '../domain/services/AgentOrchestrator';

// Load environment variables
dotenv.config();

/**
 * Dependency Injection Container
 *
 * Production implementation using real Firestore repositories
 */

// Initialize repositories with Firestore
export const conversationRepository = new AgentConversationRepository(firestore);
export const draftRepository = new TransactionDraftRepository(firestore);
export const poolRepository = new CashPoolRepository(firestore);
export const categoryRepository = new CategoryRepository(firestore);

// Initialize AgentOrchestrator with real dependencies
export const agentOrchestrator = new AgentOrchestrator(
    conversationRepository,
    draftRepository,
    poolRepository,
    categoryRepository
);

// Finalization use case (stub for now - requires transaction creation)
export const finalizeTransactionDraft = {
    execute: async (draftId: string, userId: string) => {
        // TODO: Implement full FinalizeTransactionDraft use case
        // This requires creating a real transaction from the draft
        const draft = await draftRepository.getById(draftId);

        if (!draft) {
            return {
                status: 'ERROR',
                errorCode: 'DRAFT_NOT_FOUND',
                errorMessage: 'Draft not found',
                transactionId: undefined,
            };
        }

        if (draft.userId !== userId) {
            return {
                status: 'ERROR',
                errorCode: 'UNAUTHORIZED',
                errorMessage: 'Unauthorized access to draft',
                transactionId: undefined,
            };
        }

        // For now, just mark as finalized without creating a real transaction
        await draftRepository.markAsFinalized(draftId, `txn-${Date.now()}`);

        return {
            status: 'SUCCESS',
            transactionId: `txn-${Date.now()}`,
            errorCode: undefined,
            errorMessage: undefined,
        };
    },
};

/**
 * Validate environment on startup
 */
function validateEnvironment(): void {
    const geminiKey = process.env.GEMINI_API_KEY;
    const geminiModel = process.env.GEMINI_MODEL;

    logger.info('Container: Environment validation', {
        hasGeminiKey: !!geminiKey,
        geminiModel: geminiModel || 'gemini-1.5-flash (default)',
    });

    if (!geminiKey) {
        const errorMessage = 'GEMINI_API_KEY environment variable is required but not set';
        logger.error('Container: Environment validation failed', {
            error: errorMessage,
        });
        throw new Error(errorMessage);
    }

    logger.info('Container: Environment validation passed');
}

validateEnvironment();
logger.info('Container: Initialized with real Firestore repositories');
