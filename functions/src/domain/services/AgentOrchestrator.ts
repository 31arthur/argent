import { AgentResponse } from '../entities/AgentResponse';
import { TransactionDraft } from '../entities/TransactionDraft';
import { AgentConversation } from '../entities/AgentConversation';
import { ConfirmationPayload } from '../entities/ConfirmationPayload';
import { AgentState } from '../entities/AgentState';
import { TransactionData } from '../value-objects/TransactionData';
import { IAgentConversationRepository } from '../repositories/IAgentConversationRepository';
import { ITransactionDraftRepository } from '../repositories/ITransactionDraftRepository';
import { ICashPoolRepository } from '../repositories/ICashPoolRepository';
import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { IPersonRepository } from '../repositories/IPersonRepository';
import { ILoanRepository } from '../repositories/ILoanRepository';
import { CreateTransactionDraft } from '../usecases/agent/CreateTransactionDraft';
import { TransitionAgentState } from '../usecases/agent/TransitionAgentState';
import { DraftMutationService } from './DraftMutationService';
import { ClarificationStrategy } from './ClarificationStrategy';
import { GeminiExtractionService } from './GeminiExtractionService';
import { HintResolutionService } from './HintResolutionService';
import { ClarificationParser } from './ClarificationParser';
import { GeminiValidationError } from '../entities/GeminiValidationError';
import { ExtractionResult } from './ExtractionResult';
import { logger } from '../../utils/logger';

/**
 * Agent Orchestrator
 * Central orchestrator for agent message handling
 */
export class AgentOrchestrator {
    private readonly draftMutationService: DraftMutationService;
    private readonly clarificationStrategy: ClarificationStrategy;
    private readonly geminiExtractionService: GeminiExtractionService;
    private readonly hintResolutionService: HintResolutionService;
    private readonly createDraftUseCase: CreateTransactionDraft;
    private readonly transitionStateUseCase: TransitionAgentState;

    constructor(
        private conversationRepository: IAgentConversationRepository,
        private draftRepository: ITransactionDraftRepository,
        private poolRepository: ICashPoolRepository,
        private categoryRepository: ICategoryRepository,
        private personRepository: IPersonRepository,
        private loanRepository: ILoanRepository
    ) {
        this.draftMutationService = new DraftMutationService(draftRepository);
        this.clarificationStrategy = new ClarificationStrategy(poolRepository, categoryRepository);
        this.geminiExtractionService = new GeminiExtractionService();
        this.hintResolutionService = new HintResolutionService(poolRepository, categoryRepository);
        this.createDraftUseCase = new CreateTransactionDraft(draftRepository);
        this.transitionStateUseCase = new TransitionAgentState(conversationRepository);
    }

    async handleAgentMessage(
        userId: string,
        conversationId: string,
        message: string
    ): Promise<AgentResponse> {
        const conversation = await this.conversationRepository.getById(conversationId);
        if (!conversation) {
            throw new Error('Conversation not found');
        }

        if (conversation.userId !== userId) {
            throw new Error('Unauthorized: Conversation does not belong to user');
        }

        switch (conversation.agentState) {
            case AgentState.IDLE:
                return this.handleIdleState(conversation, message);

            case AgentState.EXTRACTING:
                return this.handleExtractingState(conversation, message);

            case AgentState.ASKING_CLARIFICATION:
                return this.handleAskingClarificationState(conversation, message);

            case AgentState.WAITING_CONFIRMATION:
                return this.handleWaitingConfirmationState(conversation, message);

            case AgentState.COMPLETED:
                return {
                    message: 'This conversation has been completed.',
                    agentState: AgentState.COMPLETED,
                    requiresUserInput: false,
                };

            case AgentState.CANCELLED:
                return {
                    message: 'This conversation has been cancelled.',
                    agentState: AgentState.CANCELLED,
                    requiresUserInput: false,
                };

            default:
                throw new Error(`Unknown agent state: ${conversation.agentState}`);
        }
    }

    private async handleIdleState(
        conversation: AgentConversation,
        message: string
    ): Promise<AgentResponse> {
        // Create new draft
        const draft = await this.createDraftUseCase.execute(conversation.id, conversation.userId);

        // Link draft to conversation
        await this.conversationRepository.updateActiveDraftId(conversation.id, draft.id);

        // Transition to EXTRACTING
        await this.transitionStateUseCase.execute(conversation.id, AgentState.EXTRACTING);

        // Process the message in EXTRACTING state
        const updatedConversation = await this.conversationRepository.getById(conversation.id);
        if (!updatedConversation) {
            throw new Error('Conversation not found after state transition');
        }

        return this.handleExtractingState(updatedConversation, message);
    }

    private async handleExtractingState(
        conversation: AgentConversation,
        message: string
    ): Promise<AgentResponse> {
        const draft = await this.draftRepository.getByConversation(conversation.id);
        if (!draft) {
            throw new Error('No active draft found for conversation');
        }

        try {
            // Extract fields using Gemini
            const extraction = await this.geminiExtractionService.extract(
                message,
                draft.extractedFields
            );

            // Resolve hints to entity IDs
            const resolvedFields = await this.hintResolutionService.resolveHints(
                extraction,
                conversation.userId
            );

            // Update draft with resolved fields
            const updatedDraft = await this.draftMutationService.updateMultipleFields(
                draft.id,
                resolvedFields.fields,
                resolvedFields.confidence
            );

            // Check if draft is complete
            if (updatedDraft.missingFields.length === 0) {
                await this.transitionStateUseCase.execute(
                    conversation.id,
                    AgentState.WAITING_CONFIRMATION
                );

                return this.generateConfirmationResponse(updatedDraft, conversation.userId);
            } else {
                await this.transitionStateUseCase.execute(
                    conversation.id,
                    AgentState.ASKING_CLARIFICATION
                );

                const clarification = await this.clarificationStrategy.getNextClarification(
                    updatedDraft,
                    conversation.userId
                );

                if (!clarification) {
                    throw new Error('No clarification question generated despite missing fields');
                }

                return {
                    message: clarification.question,
                    agentState: AgentState.ASKING_CLARIFICATION,
                    requiresUserInput: true,
                    selectableOptions: clarification.options,
                    updatedDraft,
                };
            }
        } catch (error) {
            if (error instanceof GeminiValidationError) {
                logger.error('AgentOrchestrator: Gemini validation error', {
                    error,
                    errorCode: error.code,
                    field: error.field
                });

                return {
                    message:
                        'I had trouble understanding that. Could you rephrase your transaction?',
                    agentState: AgentState.EXTRACTING,
                    requiresUserInput: true,
                    updatedDraft: draft,
                };
            }
            throw error;
        }
    }

    private async handleAskingClarificationState(
        conversation: AgentConversation,
        message: string
    ): Promise<AgentResponse> {
        const draft = await this.draftRepository.getByConversation(conversation.id);
        if (!draft) {
            throw new Error('No active draft found for conversation');
        }

        // If no missing fields, the draft is complete - transition to confirmation
        if (draft.missingFields.length === 0) {
            await this.transitionStateUseCase.execute(
                conversation.id,
                AgentState.WAITING_CONFIRMATION
            );

            return this.generateConfirmationResponse(draft, conversation.userId);
        }

        const fieldToClarify = draft.missingFields[0];

        const value = ClarificationParser.parse(message, fieldToClarify);

        if (value === null) {
            const clarification = await this.clarificationStrategy.getNextClarification(
                draft,
                conversation.userId
            );

            return {
                message: `I didn't understand that. ${clarification?.question || 'Please try again.'}`,
                agentState: AgentState.ASKING_CLARIFICATION,
                requiresUserInput: true,
                selectableOptions: clarification?.options,
                updatedDraft: draft,
            };
        }

        const updatedDraft = await this.draftMutationService.updateField(
            draft.id,
            fieldToClarify as keyof TransactionData,
            value,
            1.0
        );

        if (updatedDraft.missingFields.length === 0) {
            await this.transitionStateUseCase.execute(
                conversation.id,
                AgentState.WAITING_CONFIRMATION
            );

            return this.generateConfirmationResponse(updatedDraft, conversation.userId);
        } else {
            const clarification = await this.clarificationStrategy.getNextClarification(
                updatedDraft,
                conversation.userId
            );

            if (!clarification) {
                throw new Error('No clarification question generated despite missing fields');
            }

            return {
                message: clarification.question,
                agentState: AgentState.ASKING_CLARIFICATION,
                requiresUserInput: true,
                selectableOptions: clarification.options,
                updatedDraft,
            };
        }
    }

    private async handleWaitingConfirmationState(
        conversation: AgentConversation,
        message: string
    ): Promise<AgentResponse> {
        const lowerMessage = message.toLowerCase().trim();

        const draft = await this.draftRepository.getByConversation(conversation.id);
        if (!draft) {
            throw new Error('No active draft found for conversation');
        }

        // Handle confirmation
        if (lowerMessage === 'confirm' || lowerMessage === 'yes' || lowerMessage === 'approve') {
            await this.draftRepository.markAsConfirmed(draft.id);
            await this.transitionStateUseCase.execute(conversation.id, AgentState.COMPLETED);

            return {
                message: 'Your transaction has been confirmed and saved!',
                agentState: AgentState.COMPLETED,
                requiresUserInput: false,
            };
        }

        // Handle cancellation
        if (
            lowerMessage === 'cancel' ||
            lowerMessage === 'no' ||
            lowerMessage === 'never mind' ||
            lowerMessage === 'forget this' ||
            lowerMessage === 'abort' ||
            lowerMessage === 'stop'
        ) {
            await this.draftRepository.markAsCancelled(draft.id);
            await this.transitionStateUseCase.execute(conversation.id, AgentState.CANCELLED);

            return {
                message: 'The transaction has been cancelled.',
                agentState: AgentState.CANCELLED,
                requiresUserInput: false,
            };
        }

        // Unknown command - ask for clarification
        return {
            message: 'Please say "confirm" to save this transaction, or "cancel" to discard it.',
            agentState: AgentState.WAITING_CONFIRMATION,
            requiresUserInput: true,
            confirmationPayload: await this.buildConfirmationPayload(draft, conversation.userId),
        };
    }

    private async generateConfirmationResponse(
        draft: TransactionDraft,
        userId: string
    ): Promise<AgentResponse> {
        const confirmationPayload = await this.buildConfirmationPayload(draft, userId);

        return {
            message: 'Please review and confirm this transaction:',
            agentState: AgentState.WAITING_CONFIRMATION,
            requiresUserInput: true,
            confirmationPayload,
            updatedDraft: draft,
        };
    }

    private async buildConfirmationPayload(
        draft: TransactionDraft,
        userId: string
    ): Promise<ConfirmationPayload> {
        logger.info('AgentOrchestrator: Building confirmation payload', {
            draftId: draft.id,
            poolId: draft.extractedFields.poolId,
            categoryId: draft.extractedFields.categoryId,
            userId,
        });

        const pool = await this.poolRepository.getById(draft.extractedFields.poolId!);
        logger.info('AgentOrchestrator: Pool fetched', {
            poolId: draft.extractedFields.poolId,
            poolFound: !!pool,
            poolName: pool?.name,
        });
        const poolName = pool?.name || 'Unknown Pool';

        const category = await this.categoryRepository.getById(draft.extractedFields.categoryId!);
        logger.info('AgentOrchestrator: Category fetched', {
            categoryId: draft.extractedFields.categoryId,
            categoryFound: !!category,
            categoryKey: category?.key,
        });
        const categoryName = category?.key || 'Unknown Category';

        return {
            draftId: draft.id,
            summary: {
                poolName,
                amount: draft.extractedFields.amount!,
                type: draft.extractedFields.type!,
                categoryName,
                purpose: draft.extractedFields.purpose!,
                date: draft.extractedFields.date!,
                notes: draft.extractedFields.notes,
                tags: draft.extractedFields.tags,
            },
            actions: ['confirm', 'edit', 'cancel'],
        };
    }
}

