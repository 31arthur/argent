/**
 * Agent Analytics Events
 * Events emitted during the AI agent lifecycle for observability
 * 
 * PRIVACY RULES:
 * - NEVER include raw user text
 * - NEVER include extracted amounts or descriptions
 * - ONLY include IDs, timestamps, and status codes
 */
export enum AgentAnalyticsEvent {
    /**
     * Conversation started (user initiated agent interaction)
     */
    CONVERSATION_STARTED = 'agent_conversation_started',

    /**
     * Extraction completed (draft transitioned to WAITING_FOR_CONFIRMATION)
     */
    EXTRACTION_COMPLETED = 'agent_extraction_completed',

    /**
     * Confirmation shown to user
     */
    CONFIRMATION_SHOWN = 'agent_confirmation_shown',

    /**
     * User confirmed draft (draft → CONFIRMED)
     */
    TRANSACTION_CONFIRMED = 'agent_transaction_confirmed',

    /**
     * User cancelled draft (draft → CANCELLED)
     */
    TRANSACTION_CANCELLED = 'agent_transaction_cancelled',

    /**
     * Draft finalized (transaction created, draft → FINALIZED)
     */
    TRANSACTION_FINALIZED = 'agent_transaction_finalized',

    /**
     * Finalization failed
     */
    FINALIZATION_FAILED = 'agent_finalization_failed',
}

/**
 * Agent Analytics Payload
 * Structure for analytics events
 */
export interface AgentAnalyticsPayload {
    /**
     * Event type
     */
    event: AgentAnalyticsEvent;

    /**
     * Conversation ID
     */
    conversationId: string;

    /**
     * Draft ID (if applicable)
     */
    draftId?: string;

    /**
     * User ID
     */
    userId: string;

    /**
     * Event timestamp
     */
    timestamp: Date;

    /**
     * Additional metadata (optional)
     */
    metadata?: {
        /**
         * Created transaction ID (for TRANSACTION_FINALIZED)
         */
        transactionId?: string;

        /**
         * Error code (for FINALIZATION_FAILED)
         */
        errorCode?: string;

        /**
         * Duration in milliseconds (for performance tracking)
         */
        duration?: number;

        /**
         * Agent state at time of event
         */
        agentState?: string;
    };
}

/**
 * Agent Analytics Service
 * Helper for emitting analytics events
 * 
 * NOTE: This is a simple implementation.
 * In production, integrate with your analytics provider (e.g., Mixpanel, Amplitude, Google Analytics)
 */
export class AgentAnalyticsService {
    /**
     * Emit an analytics event
     * 
     * @param payload - Event payload
     */
    static emit(payload: AgentAnalyticsPayload): void {
        // Log to console for development
        console.log('[AgentAnalytics]', payload.event, {
            conversationId: payload.conversationId,
            draftId: payload.draftId,
            userId: payload.userId,
            timestamp: payload.timestamp.toISOString(),
            metadata: payload.metadata,
        });

        // TODO: In production, send to analytics provider
        // Example:
        // analytics.track(payload.event, {
        //     conversationId: payload.conversationId,
        //     draftId: payload.draftId,
        //     userId: payload.userId,
        //     ...payload.metadata,
        // });
    }

    /**
     * Emit conversation started event
     */
    static conversationStarted(conversationId: string, userId: string): void {
        this.emit({
            event: AgentAnalyticsEvent.CONVERSATION_STARTED,
            conversationId,
            userId,
            timestamp: new Date(),
        });
    }

    /**
     * Emit extraction completed event
     */
    static extractionCompleted(
        conversationId: string,
        draftId: string,
        userId: string
    ): void {
        this.emit({
            event: AgentAnalyticsEvent.EXTRACTION_COMPLETED,
            conversationId,
            draftId,
            userId,
            timestamp: new Date(),
        });
    }

    /**
     * Emit confirmation shown event
     */
    static confirmationShown(conversationId: string, draftId: string, userId: string): void {
        this.emit({
            event: AgentAnalyticsEvent.CONFIRMATION_SHOWN,
            conversationId,
            draftId,
            userId,
            timestamp: new Date(),
        });
    }

    /**
     * Emit transaction confirmed event
     */
    static transactionConfirmed(conversationId: string, draftId: string, userId: string): void {
        this.emit({
            event: AgentAnalyticsEvent.TRANSACTION_CONFIRMED,
            conversationId,
            draftId,
            userId,
            timestamp: new Date(),
        });
    }

    /**
     * Emit transaction cancelled event
     */
    static transactionCancelled(conversationId: string, draftId: string, userId: string): void {
        this.emit({
            event: AgentAnalyticsEvent.TRANSACTION_CANCELLED,
            conversationId,
            draftId,
            userId,
            timestamp: new Date(),
        });
    }

    /**
     * Emit transaction finalized event
     */
    static transactionFinalized(
        conversationId: string,
        draftId: string,
        userId: string,
        transactionId: string,
        duration?: number
    ): void {
        this.emit({
            event: AgentAnalyticsEvent.TRANSACTION_FINALIZED,
            conversationId,
            draftId,
            userId,
            timestamp: new Date(),
            metadata: {
                transactionId,
                duration,
            },
        });
    }

    /**
     * Emit finalization failed event
     */
    static finalizationFailed(
        conversationId: string,
        draftId: string,
        userId: string,
        errorCode: string
    ): void {
        this.emit({
            event: AgentAnalyticsEvent.FINALIZATION_FAILED,
            conversationId,
            draftId,
            userId,
            timestamp: new Date(),
            metadata: {
                errorCode,
            },
        });
    }
}
