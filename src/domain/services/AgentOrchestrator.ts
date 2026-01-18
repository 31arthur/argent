import type { AgentResponse } from '@/domain/entities/AgentResponse';
import type { TransactionDraft } from '@/domain/entities/TransactionDraft';
import type { AgentConversation } from '@/domain/entities/AgentConversation';
import type { ConfirmationPayload } from '@/domain/entities/ConfirmationPayload';
import type { IAgentConversationRepository } from '@/domain/repositories/IAgentConversationRepository';
import type { ITransactionDraftRepository } from '@/domain/repositories/ITransactionDraftRepository';
import type { ICashPoolRepository } from '@/domain/repositories/ICashPoolRepository';
import type { ICategoryRepository } from '@/domain/repositories/ICategoryRepository';
import type { TransactionData } from '@/domain/value-objects/TransactionData';
import { AgentState } from '@/domain/entities/AgentState';
import { CreateTransactionDraft } from '@/domain/usecases/agent/CreateTransactionDraft';
import { TransitionAgentState } from '@/domain/usecases/agent/TransitionAgentState';
import { DraftMutationService } from './DraftMutationService';
import { ClarificationStrategy } from './ClarificationStrategy';
import { GeminiExtractionService } from './GeminiExtractionService';
import { HintResolutionService } from './HintResolutionService';
import { ClarificationParser } from './ClarificationParser';
import { EditIntentDetector } from './EditIntentDetector';
import { TargetedFieldExtractor } from './TargetedFieldExtractor';
import { GeminiValidationError } from '@/domain/entities/GeminiValidationError';
import type { ExtractionResult } from './StubExtractionService';

/**
 * Agent Orchestrator
 * Central orchestrator for agent message handling
 * 
 * RESPONSIBILITIES:
 * - Accept user messages
 * - Load conversation + draft state
 * - Route to state-specific handler
 * - Update draft and agent state
 * - Produce structured response
 * 
 * ENTRY POINT:
 * - handleAgentMessage(userId, conversationId, message)
 * 
 * STATE ROUTING:
 * - IDLE → handleIdleState
 * - EXTRACTING → handleExtractingState
 * - ASKING_CLARIFICATION → handleAskingClarificationState
 * - WAITING_CONFIRMATION → handleWaitingConfirmationState
 * - COMPLETED / CANCELLED → Terminal states
 * 
 * CRITICAL RULES:
 * - All state transitions are explicit
 * - All decisions based on structured state (never chat history)
 * - All draft mutations go through DraftMutationService
 */
export class AgentOrchestrator {
    private readonly draftMutationService: DraftMutationService;
    private readonly clarificationStrategy: ClarificationStrategy;
    private readonly geminiExtractionService: GeminiExtractionService;
    private readonly hintResolutionService: HintResolutionService;
    private readonly editIntentDetector: EditIntentDetector;
    private readonly targetedFieldExtractor: TargetedFieldExtractor;
    private readonly createDraftUseCase: CreateTransactionDraft;
    private readonly transitionStateUseCase: TransitionAgentState;

    constructor(
        private conversationRepository: IAgentConversationRepository,
        private draftRepository: ITransactionDraftRepository,
        private poolRepository: ICashPoolRepository,
        private categoryRepository: ICategoryRepository
    ) {
        this.draftMutationService = new DraftMutationService(draftRepository);
        this.clarificationStrategy = new ClarificationStrategy(poolRepository, categoryRepository);
        this.geminiExtractionService = new GeminiExtractionService();
        this.hintResolutionService = new HintResolutionService(poolRepository, categoryRepository);
        this.editIntentDetector = new EditIntentDetector();
        this.targetedFieldExtractor = new TargetedFieldExtractor(poolRepository, categoryRepository);
        this.createDraftUseCase = new CreateTransactionDraft(draftRepository);
        this.transitionStateUseCase = new TransitionAgentState(conversationRepository);
    }

    /**
     * Handle agent message (ENTRY POINT)
     * 
     * @param userId - User ID
     * @param conversationId - Conversation ID
     * @param message - User message
     * @returns Structured agent response
     */
    async handleAgentMessage(
        userId: string,
        conversationId: string,
        message: string
    ): Promise<AgentResponse> {
        // Load conversation
        const conversation = await this.conversationRepository.getById(conversationId);
        if (!conversation) {
            throw new Error('Conversation not found');
        }

        // Verify conversation belongs to user
        if (conversation.userId !== userId) {
            throw new Error('Unauthorized: Conversation does not belong to user');
        }

        // Route to state-specific handler
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

    /**
     * Handle IDLE state
     * First message in conversation
     * 
     * ACTIONS:
     * 1. Create new TransactionDraft
     * 2. Link draft to conversation
     * 3. Transition to EXTRACTING
     * 4. Return acknowledgment
     */
    private async handleIdleState(
        conversation: AgentConversation,
        message: string
    ): Promise<AgentResponse> {
        // Create new draft
        await this.createDraftUseCase.execute(conversation.id, conversation.userId);

        // Link draft to conversation
        await this.conversationRepository.updateState(conversation.id, AgentState.EXTRACTING);
        // Note: In real implementation, we'd also update activeDraftId

        // Transition to EXTRACTING
        await this.transitionStateUseCase.execute(conversation.id, AgentState.EXTRACTING);

        // Process the message immediately in EXTRACTING state
        const updatedConversation = await this.conversationRepository.getById(conversation.id);
        if (!updatedConversation) {
            throw new Error('Conversation not found after state transition');
        }

        return this.handleExtractingState(updatedConversation, message);
    }

    /**
     * Handle EXTRACTING state
     * User provides transaction description
     * 
     * ACTIONS:
     * 1. Extract fields using Gemini
     * 2. Resolve hints to entity IDs
     * 3. Update draft with resolved fields
     * 4. Validate draft completeness
     * 5. Transition based on completeness:
     *    - Missing fields → ASKING_CLARIFICATION
     *    - Complete → WAITING_CONFIRMATION
     */
    private async handleExtractingState(
        conversation: AgentConversation,
        message: string
    ): Promise<AgentResponse> {
        // Get active draft
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
            const resolvedFields = await this.resolveHints(extraction, conversation.userId);

            // Update draft with resolved fields
            const updatedDraft = await this.draftMutationService.updateMultipleFields(
                draft.id,
                resolvedFields.fields,
                resolvedFields.confidence
            );

            // Check if draft is complete
            if (updatedDraft.missingFields.length === 0) {
                // Draft is complete → transition to WAITING_CONFIRMATION
                await this.transitionStateUseCase.execute(
                    conversation.id,
                    AgentState.WAITING_CONFIRMATION
                );

                return this.generateConfirmationResponse(updatedDraft);
            } else {
                // Draft has missing fields → transition to ASKING_CLARIFICATION
                await this.transitionStateUseCase.execute(
                    conversation.id,
                    AgentState.ASKING_CLARIFICATION
                );

                // Get next clarification question
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
            // Handle Gemini validation errors
            if (error instanceof GeminiValidationError) {
                console.error('[AgentOrchestrator] Gemini validation error:', error);

                // Ask user to rephrase
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

    /**
     * Handle ASKING_CLARIFICATION state
     * User provides clarification for missing field
     * 
     * ACTIONS:
     * 1. Parse user response
     * 2. Update draft with clarified field
     * 3. Recalculate missing fields
     * 4. Determine next action:
     *    - Still missing → Ask next question
     *    - Complete → Transition to WAITING_CONFIRMATION
     */
    private async handleAskingClarificationState(
        conversation: AgentConversation,
        message: string
    ): Promise<AgentResponse> {
        // Get active draft
        const draft = await this.draftRepository.getByConversation(conversation.id);
        if (!draft) {
            throw new Error('No active draft found for conversation');
        }

        // Determine which field we're clarifying (highest priority missing field)
        const fieldToClarify = draft.missingFields[0];
        if (!fieldToClarify) {
            throw new Error('No missing fields to clarify');
        }

        // Parse user response
        const value = ClarificationParser.parse(message, fieldToClarify);

        if (value === null) {
            // Could not parse response - ask again
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

        // Update draft with clarified field
        const updatedDraft = await this.draftMutationService.updateField(
            draft.id,
            fieldToClarify as keyof import('@/domain/value-objects/TransactionData').TransactionData,
            value,
            1.0 // High confidence for user-provided data
        );

        // Check if draft is now complete
        if (updatedDraft.missingFields.length === 0) {
            // Draft is complete → transition to WAITING_CONFIRMATION
            await this.transitionStateUseCase.execute(
                conversation.id,
                AgentState.WAITING_CONFIRMATION
            );

            return this.generateConfirmationResponse(updatedDraft);
        } else {
            // Still missing fields → ask next question
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

    /**
     * Handle WAITING_CONFIRMATION state
     * User confirms, edits, or cancels
     * 
     * ACTIONS:
     * - "confirm" → Mark draft as CONFIRMED, transition to COMPLETED
     * - Edit request → Detect field, update, re-enter confirmation
     * - "cancel" → Mark draft as CANCELLED, transition to CANCELLED
     */
    private async handleWaitingConfirmationState(
        conversation: AgentConversation,
        message: string
    ): Promise<AgentResponse> {
        const lowerMessage = message.toLowerCase().trim();

        // Get active draft
        const draft = await this.draftRepository.getByConversation(conversation.id);
        if (!draft) {
            throw new Error('No active draft found for conversation');
        }

        // Handle confirmation
        if (lowerMessage === 'confirm' || lowerMessage === 'yes' || lowerMessage === 'approve') {
            // Mark draft as confirmed
            await this.draftRepository.markAsConfirmed(draft.id);

            // Transition to COMPLETED
            await this.transitionStateUseCase.execute(conversation.id, AgentState.COMPLETED);

            return {
                message: 'confirmation.draft_confirmed', // i18n key
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
            // Mark draft as cancelled
            await this.draftRepository.markAsCancelled(draft.id);

            // Transition to CANCELLED
            await this.transitionStateUseCase.execute(conversation.id, AgentState.CANCELLED);

            return {
                message: 'confirmation.draft_cancelled', // i18n key
                agentState: AgentState.CANCELLED,
                requiresUserInput: false,
            };
        }

        // Handle edit request (field-level edit)
        return this.handleEditRequest(conversation, draft, message);
    }

    /**
     * Handle edit request
     * Detect which field user wants to edit and update it
     * 
     * @param conversation - Agent conversation
     * @param draft - Transaction draft
     * @param message - User message
     * @returns Agent response
     */
    private async handleEditRequest(
        conversation: AgentConversation,
        draft: TransactionDraft,
        message: string
    ): Promise<AgentResponse> {
        // Detect edit intent
        const editIntent = this.editIntentDetector.detect(message);

        if (!editIntent) {
            // Could not detect intent - ask for clarification
            return {
                message: 'confirmation.edit_unclear', // i18n key
                agentState: AgentState.WAITING_CONFIRMATION,
                requiresUserInput: true,
                confirmationPayload: await this.buildConfirmationPayload(draft),
            };
        }

        try {
            // Extract new value for specific field
            const extraction = await this.targetedFieldExtractor.extractField(
                editIntent.field,
                message,
                conversation.userId
            );

            // Update ONLY the specified field
            const updatedDraft = await this.draftMutationService.updateField(
                draft.id,
                editIntent.field,
                extraction.value,
                extraction.confidence
            );

            // Check if draft is still complete
            if (updatedDraft.missingFields.length === 0) {
                // Still complete - re-enter confirmation
                return this.generateConfirmationResponse(updatedDraft);
            } else {
                // Now missing fields - transition to clarification
                await this.transitionStateUseCase.execute(
                    conversation.id,
                    AgentState.ASKING_CLARIFICATION
                );

                const clarification = await this.clarificationStrategy.getNextClarification(
                    updatedDraft,
                    conversation.userId
                );

                return {
                    message: clarification?.question || 'Please provide the missing information.',
                    agentState: AgentState.ASKING_CLARIFICATION,
                    requiresUserInput: true,
                    selectableOptions: clarification?.options,
                    updatedDraft,
                };
            }
        } catch (error) {
            // Handle extraction errors
            console.error('[AgentOrchestrator] Edit extraction error:', error);

            return {
                message: 'confirmation.edit_failed', // i18n key
                agentState: AgentState.WAITING_CONFIRMATION,
                requiresUserInput: true,
                confirmationPayload: await this.buildConfirmationPayload(draft),
            };
        }
    }

    /**
     * Generate confirmation response
     * 
     * @param draft - Transaction draft
     * @param userId - User ID
     * @returns Agent response with confirmation payload
     */
    private async generateConfirmationResponse(
        draft: TransactionDraft,
    ): Promise<AgentResponse> {
        const confirmationPayload = await this.buildConfirmationPayload(draft);

        return {
            message: 'confirmation.review_transaction', // i18n key
            agentState: AgentState.WAITING_CONFIRMATION,
            requiresUserInput: true,
            confirmationPayload,
            updatedDraft: draft,
        };
    }

    /**
     * Build confirmation payload
     * 
     * @param draft - Transaction draft
     * @param userId - User ID
     * @returns Confirmation payload
     */
    private async buildConfirmationPayload(
        draft: TransactionDraft,
    ): Promise<ConfirmationPayload> {
        // Get pool name
        const pool = await this.poolRepository.getById(draft.extractedFields.poolId!);
        const poolName = pool?.name || 'Unknown Pool';

        // Get category name
        const category = await this.categoryRepository.getById(draft.extractedFields.categoryId!);
        const categoryName = category?.key || 'Unknown Category';

        // Build confirmation payload
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

    /**
     * Resolve hints from extraction to entity IDs
     * 
     * @param extraction - Extraction result from Gemini
     * @param userId - User ID
     * @returns Resolved fields and confidence
     */
    private async resolveHints(
        extraction: ExtractionResult,
        userId: string
    ): Promise<{ fields: Partial<TransactionData>; confidence: Record<string, number> }> {
        return this.hintResolutionService.resolveHints(extraction, userId);
    }
}
