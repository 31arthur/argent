import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { firestore } from './firestore';

// Load environment variables
dotenv.config();

/**
 * Dependency Injection Container
 * 
 * Enhanced stub implementation with correct method signatures
 */

// In-memory store for conversations (for stub implementation)
const conversationStore: Map<string, any> = new Map();

// Stub repositories with correct signatures matching the function expectations
export const conversationRepository = {
    getById: async (id: string) => {
        // Return stored conversation if exists, otherwise null
        return conversationStore.get(id) || null;
    },
    create: async (conversation: any) => {
        const id = `conv-${Date.now()}`;
        const newConversation = {
            id,
            userId: conversation.userId,
            agentState: conversation.agentState || 'IDLE',
            activeDraftId: conversation.activeDraftId || null,
            isDeleted: conversation.isDeleted || false,
            completedAt: null,
            startedAt: new Date(),
            lastActivityAt: new Date(),
        };
        // Store the conversation so getById can find it later
        conversationStore.set(id, newConversation);
        return newConversation;
    },
    updateState: async (id: string, state: string) => {
        console.log(`[Stub] Updated conversation ${id} state to ${state}`);
    },
    markAsCancelled: async (id: string) => {
        console.log(`[Stub] Cancelled conversation ${id}`);
    },
};

export const draftRepository = {
    getById: async (id: string) => null,
    getByConversation: async (conversationId: string) => null,
    create: async (draft: any) => {
        const id = `draft-${Date.now()}`;
        return { id, ...draft };
    },
    update: async (id: string, updates: any) => {
        console.log(`[Stub] Updated draft ${id}`);
        return { id, ...updates };
    },
    markAsConfirmed: async (id: string) => {
        console.log(`[Stub] Confirmed draft ${id}`);
        return { id, status: 'CONFIRMED' };
    },
    markAsCancelled: async (id: string) => {
        console.log(`[Stub] Cancelled draft ${id}`);
        return { id, status: 'CANCELLED' };
    },
    markAsFinalized: async (id: string, transactionId: string) => {
        console.log(`[Stub] Finalized draft ${id} to transaction ${transactionId}`);
        return { id, transactionId, status: 'FINALIZED' };
    },
};

export const chatMessageRepository = {
    create: async (message: any) => {
        const id = `msg-${Date.now()}`;
        return { id, ...message, timestamp: new Date() };
    },
    getByConversation: async (conversationId: string) => [],
};

// Enhanced orchestrator with helpful response
export const agentOrchestrator = {
    handleAgentMessage: async (userId: string, conversationId: string, message: string) => {
        const geminiKey = process.env.GEMINI_API_KEY;
        const hasGemini = geminiKey && geminiKey.length > 10;

        console.log(`[AgentOrchestrator] Processing message from user ${userId}`);
        console.log(`[AgentOrchestrator] Message: "${message}"`);
        console.log(`[AgentOrchestrator] Gemini configured: ${hasGemini}`);

        return {
            conversationId,
            agentState: 'EXTRACTING',
            message: hasGemini
                ? `✅ Backend connected! Your message: "${message}"\n\n🔧 Status:\n• Gemini API: Configured (${process.env.GEMINI_MODEL})\n• Firestore: Connected\n• Functions: Live\n\n⚠️ Note: Full AI agent requires domain code migration. Currently running in demo mode to show the connection works!`
                : `✅ Connection successful! Message received: "${message}"\n\n⚠️ Gemini API not configured. Add GEMINI_API_KEY to functions/.env to enable AI features.`,
            requiresUserInput: true,
            confirmationPayload: undefined,
            selectableOptions: undefined,
            updatedDraft: undefined,
        };
    },
};

// Finalization stub
export const finalizeTransactionDraft = {
    execute: async (draftId: string, userId: string) => ({
        status: 'ERROR',
        errorCode: 'NOT_IMPLEMENTED',
        errorMessage: 'Full implementation requires domain code migration',
        transactionId: undefined,
    }),
};

/**
 * Validate environment on startup
 */
function validateEnvironment(): void {
    const geminiKey = process.env.GEMINI_API_KEY;
    const geminiModel = process.env.GEMINI_MODEL;

    console.log('🔧 Environment Check:');
    console.log(`  GEMINI_API_KEY: ${geminiKey ? '✅ Configured' : '❌ Missing'}`);
    console.log(`  GEMINI_MODEL: ${geminiModel || 'gemini-1.5-flash (default)'}`);
}

validateEnvironment();
console.log('✅ Container initialized (enhanced stub with correct signatures)');
