import { useEffect, useRef } from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import type { ChatMessage } from '@/presentation/hooks/useChatWidget';
import type { ConfirmationPayload, SelectableOption } from '@/data/api/AgentApiClient';

interface ChatWindowProps {
    isOpen: boolean;
    messages: ChatMessage[];
    inputText: string;
    isTyping: boolean;
    isLoading: boolean;
    error: string | null;
    confirmationPayload: ConfirmationPayload | null;
    selectableOptions: SelectableOption[] | null;
    onClose: () => void;
    onSendMessage: (message: string) => void;
    onInputChange: (text: string) => void;
    onConfirm: () => void;
    onEdit: () => void;
    onCancel: () => void;
    onOptionSelect: (value: string) => void;
    onErrorDismiss: () => void;
    onErrorRetry?: () => void;
}

/**
 * Main chat window container
 */
export const ChatWindow: React.FC<ChatWindowProps> = ({
    isOpen,
    messages,
    inputText,
    isTyping,
    isLoading,
    error,
    confirmationPayload,
    selectableOptions,
    onClose,
    onSendMessage,
    onInputChange,
    onConfirm,
    onEdit,
    onCancel,
    onOptionSelect,
    onErrorDismiss,
    onErrorRetry,
}) => {
    const inputRef = useRef<HTMLDivElement>(null);

    // Auto-focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            const input = inputRef.current?.querySelector('input');
            input?.focus();
        }
    }, [isOpen]);

    // Handle Escape key to close chat
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Handle mobile keyboard
    useEffect(() => {
        if (isOpen && window.innerWidth < 768) {
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        }

        return () => {
            document.body.style.position = '';
            document.body.style.width = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="chat-window">
            <ChatHeader onClose={onClose} />
            <ChatMessageList
                messages={messages}
                isTyping={isTyping}
                confirmationPayload={confirmationPayload}
                selectableOptions={selectableOptions}
                error={error}
                isLoading={isLoading}
                onConfirm={onConfirm}
                onEdit={onEdit}
                onCancel={onCancel}
                onOptionSelect={onOptionSelect}
                onErrorDismiss={onErrorDismiss}
                onErrorRetry={onErrorRetry}
            />
            <div ref={inputRef}>
                <ChatInput
                    value={inputText}
                    onChange={onInputChange}
                    onSend={onSendMessage}
                    disabled={isLoading}
                />
            </div>
        </div>
    );
};
