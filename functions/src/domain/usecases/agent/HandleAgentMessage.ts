import type { AgentResponse } from '../../entities/AgentResponse';
import type { IChatMessageRepository } from '../../repositories/IChatMessageRepository';
import { AgentOrchestrator } from '../../services/AgentOrchestrator';

/**
 * Use Case: Handle Agent Message
 * Entry point for processing user messages in agent conversations
 * 
 * RESPONSIBILITIES:
 * - Save user message to chat history
 * - Process message through orchestrator
 * - Save agent response to chat history
 * - Return structured response
 * 
 * WORKFLOW:
 * 1. Save user message
 * 2. Process via AgentOrchestrator
 * 3. Save agent response
 * 4. Return AgentResponse
 * 
 * CRITICAL RULE:
 * - Chat history is for UI display only
 * - Agent logic never reads chat history
 */
export class HandleAgentMessage {
    constructor(
        private orchestrator: AgentOrchestrator,
        private chatMessageRepository: IChatMessageRepository
    ) { }

    /**
     * Execute message handling
     * 
     * @param userId - User ID
     * @param conversationId - Conversation ID
     * @param message - User message
     * @returns Structured agent response
     */
    async execute(
        userId: string,
        conversationId: string,
        message: string
    ): Promise<AgentResponse> {
        // Save user message to chat history
        await this.chatMessageRepository.create({
            conversationId,
            sender: 'user',
            content: message,
        });

        // Process message through orchestrator
        const response = await this.orchestrator.handleAgentMessage(
            userId,
            conversationId,
            message
        );

        // Save agent response to chat history
        await this.chatMessageRepository.create({
            conversationId,
            sender: 'agent',
            content: response.message,
            metadata: {
                agentStateAtTime: response.agentState,
            },
        });

        return response;
    }
}

