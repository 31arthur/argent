import { useState, useCallback, useEffect, useRef } from 'react';
import { agentApiClient, type ConfirmationPayload, type SelectableOption } from '@/data/api/AgentApiClient';

export interface ChatMessage {
    id: string;
    role: 'user' | 'agent' | 'system';
    content: string;
    timestamp: Date;
}

export interface ChatWidgetState {
    isOpen: boolean;
    messages: ChatMessage[];
    inputText: string;
    isTyping: boolean;
    isLoading: boolean;
    error: string | null;
    conversationId: string | null;
    confirmationPayload: ConfirmationPayload | null;
    selectableOptions: SelectableOption[] | null;
    agentState: string | null;
}

const STORAGE_KEY = 'argent_chat_conversation_id';

/**
 * Custom hook for managing chat widget UI state with backend integration
 */
export const useChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [confirmationPayload, setConfirmationPayload] = useState<ConfirmationPayload | null>(null);
    const [selectableOptions, setSelectableOptions] = useState<SelectableOption[] | null>(null);
    const [agentState, setAgentState] = useState<string | null>(null);
    const [hasShownGreeting, setHasShownGreeting] = useState(false);
    const messageIdCounter = useRef(0);

    // Load conversation ID from localStorage on mount
    useEffect(() => {
        const savedConversationId = localStorage.getItem(STORAGE_KEY);
        if (savedConversationId) {
            setConversationId(savedConversationId);
        }
    }, []);

    // Save conversation ID to localStorage
    useEffect(() => {
        if (conversationId) {
            localStorage.setItem(STORAGE_KEY, conversationId);
        }
    }, [conversationId]);

    // Show greeting message on first open
    useEffect(() => {
        if (isOpen && !hasShownGreeting && messages.length === 0) {
            const greetingMessage: ChatMessage = {
                id: `msg-${messageIdCounter.current++}`,
                role: 'agent',
                content: 'agent.chat.greeting',
                timestamp: new Date(),
            };
            setMessages([greetingMessage]);
            setHasShownGreeting(true);
        }
    }, [isOpen, hasShownGreeting, messages.length]);

    const toggleChat = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    const closeChat = useCallback(() => {
        setIsOpen(false);
    }, []);

    const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
        const newMessage: ChatMessage = {
            ...message,
            id: `msg-${messageIdCounter.current++}`,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, newMessage]);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || isLoading) return;

        // Clear previous states
        setError(null);
        setSelectableOptions(null);
        setConfirmationPayload(null);

        // Add user message
        addMessage({
            role: 'user',
            content: text,
        });

        // Clear input
        setInputText('');

        // Set loading state
        setIsLoading(true);
        setIsTyping(true);

        try {
            // Call backend
            const response = await agentApiClient.sendMessage(conversationId, text);

            // Update conversation ID
            setConversationId(response.conversationId);

            // Add agent message
            addMessage({
                role: 'agent',
                content: response.message,
            });

            // Update UI state based on response
            setAgentState(response.agentState);
            setConfirmationPayload(response.confirmationPayload || null);
            setSelectableOptions(response.selectableOptions || null);

        } catch (err: any) {
            console.error('[useChatWidget] Error sending message:', err);

            // Handle specific error codes
            if (err.code === 'unauthenticated') {
                setError('agent.errors.auth_expired');
            } else if (err.code === 'unavailable') {
                setError('agent.errors.network_error');
            } else {
                setError('agent.errors.send_failed');
            }
        } finally {
            setIsLoading(false);
            setIsTyping(false);
        }
    }, [conversationId, isLoading, addMessage]);

    const confirmDraft = useCallback(async () => {
        if (!confirmationPayload || isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await agentApiClient.confirmDraft(confirmationPayload.draftId);

            if (response.status === 'SUCCESS') {
                // Add success message
                addMessage({
                    role: 'system',
                    content: 'agent.chat.success_message',
                });

                // Clear confirmation payload
                setConfirmationPayload(null);

                // Clear conversation
                clearConversation();
            } else if (response.status === 'ERROR') {
                setError('agent.errors.confirm_failed');
            }
        } catch (err: any) {
            console.error('[useChatWidget] Error confirming draft:', err);
            setError('agent.errors.confirm_failed');
        } finally {
            setIsLoading(false);
        }
    }, [confirmationPayload, isLoading, addMessage]);

    const cancelConversation = useCallback(async () => {
        if (!conversationId || isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            await agentApiClient.cancelConversation(conversationId);

            // Add cancellation message
            addMessage({
                role: 'system',
                content: 'agent.chat.cancelled_message',
            });

            // Clear conversation
            clearConversation();
        } catch (err: any) {
            console.error('[useChatWidget] Error cancelling conversation:', err);
            setError('agent.errors.cancel_failed');
        } finally {
            setIsLoading(false);
        }
    }, [conversationId, isLoading, addMessage]);

    const clearConversation = useCallback(() => {
        setConversationId(null);
        setConfirmationPayload(null);
        setSelectableOptions(null);
        setAgentState(null);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const handleInputChange = useCallback((text: string) => {
        setInputText(text);
    }, []);

    const handleOptionSelect = useCallback((value: string) => {
        // Send selected option as message
        sendMessage(value);
    }, [sendMessage]);

    const retryLastMessage = useCallback(() => {
        // Get last user message
        const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
        if (lastUserMessage) {
            sendMessage(lastUserMessage.content);
        }
    }, [messages, sendMessage]);

    return {
        isOpen,
        messages,
        inputText,
        isTyping,
        isLoading,
        error,
        conversationId,
        confirmationPayload,
        selectableOptions,
        agentState,
        toggleChat,
        closeChat,
        sendMessage,
        handleInputChange,
        confirmDraft,
        cancelConversation,
        handleOptionSelect,
        clearError,
        retryLastMessage,
    };
};
