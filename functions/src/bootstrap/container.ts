import * as dotenv from 'dotenv';
import { firestore } from './firestore';
import { logger } from '../utils/logger';

// Import repositories
import { AgentConversationRepository } from '../data/repositories/AgentConversationRepository';
import { TransactionDraftRepository } from '../data/repositories/TransactionDraftRepository';
import { CashPoolRepository } from '../data/repositories/CashPoolRepository';
import { CategoryRepository } from '../data/repositories/CategoryRepository';
import { PersonRepository } from '../data/repositories/PersonRepository';
import { LoanRepository } from '../data/repositories/LoanRepository';

// Import domain services
import { AgentOrchestrator } from '../domain/services/AgentOrchestrator';
import { AddTransaction } from '../domain/usecases/transactions/AddTransaction';

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
export const personRepository = new PersonRepository(firestore);
export const loanRepository = new LoanRepository(firestore);

// Initialize AgentOrchestrator with real dependencies
export const agentOrchestrator = new AgentOrchestrator(
    conversationRepository,
    draftRepository,
    poolRepository,
    categoryRepository,
    personRepository,
    loanRepository
);

// Import transaction repository
import { TransactionRepository } from '../data/repositories/TransactionRepository';

// Initialize transaction repository
export const transactionRepository = new TransactionRepository(firestore);

// Finalization use case - creates actual transaction from draft
export const finalizeTransactionDraft = {
    execute: async (draftId: string, userId: string) => {
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

        // Check if already finalized
        if (draft.finalizedAt) {
            return {
                status: 'ALREADY_FINALIZED',
                transactionId: draft.transactionId,
                errorCode: undefined,
                errorMessage: undefined,
            };
        }

        try {
            // Create the actual transaction
            const addTransaction = new AddTransaction(
                transactionRepository,
                poolRepository
            );
            const transaction = await addTransaction.execute({
                userId: draft.userId,
                poolId: draft.extractedFields.poolId!,
                amount: draft.extractedFields.amount!,
                type: draft.extractedFields.type!,
                categoryId: draft.extractedFields.categoryId!,
                purpose: draft.extractedFields.purpose!,
                date: draft.extractedFields.date!,
                notes: draft.extractedFields.notes,
                tags: draft.extractedFields.tags,
            });

            // Mark draft as finalized
            await draftRepository.markAsFinalized(draftId, transaction.id);

            logger.info('Transaction created from draft', {
                draftId,
                transactionId: transaction.id,
                userId,
            });

            return {
                status: 'SUCCESS',
                transactionId: transaction.id,
                errorCode: undefined,
                errorMessage: undefined,
            };
        } catch (error: any) {
            logger.error('Failed to create transaction from draft', {
                draftId,
                userId,
                error: error.message,
            });

            return {
                status: 'ERROR',
                errorCode: 'TRANSACTION_CREATION_FAILED',
                errorMessage: 'Failed to create transaction',
                transactionId: undefined,
            };
        }
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
