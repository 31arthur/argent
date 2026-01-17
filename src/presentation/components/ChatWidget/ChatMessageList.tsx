import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/presentation/hooks/useChatWidget';
import type { ConfirmationPayload, SelectableOption } from '@/data/api/AgentApiClient';
import { UserMessage } from './UserMessage';
import { AgentMessage } from './AgentMessage';
import { TypingIndicator } from './TypingIndicator';
import { ConfirmationCard } from './ConfirmationCard';
import { SelectableOptions } from './SelectableOptions';
import { ErrorMessage } from './ErrorMessage';

interface ChatMessageListProps {
    messages: ChatMessage[];
    isTyping: boolean;
    confirmationPayload: ConfirmationPayload | null;
    selectableOptions: SelectableOption[] | null;
    error: string | null;
    isLoading: boolean;
    onConfirm: () => void;
    onEdit: () => void;
    onCancel: () => void;
    onOptionSelect: (value: string) => void;
    onErrorDismiss: () => void;
    onErrorRetry?: () => void;
}

/**
 * Scrollable message list with auto-scroll to bottom
 * Renders messages, confirmation card, selectable options, and errors
 */
export const ChatMessageList: React.FC<ChatMessageListProps> = ({
    messages,
    isTyping,
    confirmationPayload,
    selectableOptions,
    error,
    isLoading,
    onConfirm,
    onEdit,
    onCancel,
    onOptionSelect,
    onErrorDismiss,
    onErrorRetry,
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping, confirmationPayload, selectableOptions, error]);

    return (
        <div className="chat-message-list">
            {messages.map((message) => {
                if (message.role === 'user') {
                    return <UserMessage key={message.id} message={message} />;
                } else if (message.role === 'system') {
                    return (
                        <div key={message.id} className="system-message">
                            {message.content}
                        </div>
                    );
                } else {
                    return <AgentMessage key={message.id} message={message} />;
                }
            })}

            {selectableOptions && selectableOptions.length > 0 && (
                <SelectableOptions options={selectableOptions} onSelect={onOptionSelect} />
            )}

            {confirmationPayload && (
                <ConfirmationCard
                    payload={confirmationPayload}
                    onConfirm={onConfirm}
                    onEdit={onEdit}
                    onCancel={onCancel}
                    isLoading={isLoading}
                />
            )}

            {error && (
                <ErrorMessage
                    error={error}
                    onDismiss={onErrorDismiss}
                    onRetry={onErrorRetry}
                />
            )}

            {isTyping && <TypingIndicator />}

            <div ref={messagesEndRef} />
        </div>
    );
};
