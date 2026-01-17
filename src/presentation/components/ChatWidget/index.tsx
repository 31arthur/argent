import { useChatWidget } from '@/presentation/hooks/useChatWidget';
import { ChatLauncher } from './ChatLauncher';
import { ChatWindow } from './ChatWindow';
import './ChatWidget.css';

/**
 * Main ChatWidget component
 * Combines launcher and chat window with full backend integration
 */
export const ChatWidget: React.FC = () => {
    const {
        isOpen,
        messages,
        inputText,
        isTyping,
        isLoading,
        error,
        confirmationPayload,
        selectableOptions,
        toggleChat,
        closeChat,
        sendMessage,
        handleInputChange,
        confirmDraft,
        cancelConversation,
        handleOptionSelect,
        clearError,
        retryLastMessage,
    } = useChatWidget();

    const handleEdit = () => {
        // Focus input to allow user to send edit message
        const input = document.querySelector('.chat-input') as HTMLInputElement;
        input?.focus();
    };

    return (
        <>
            <ChatLauncher isOpen={isOpen} onClick={toggleChat} />
            <ChatWindow
                isOpen={isOpen}
                messages={messages}
                inputText={inputText}
                isTyping={isTyping}
                isLoading={isLoading}
                error={error}
                confirmationPayload={confirmationPayload}
                selectableOptions={selectableOptions}
                onClose={closeChat}
                onSendMessage={sendMessage}
                onInputChange={handleInputChange}
                onConfirm={confirmDraft}
                onEdit={handleEdit}
                onCancel={cancelConversation}
                onOptionSelect={handleOptionSelect}
                onErrorDismiss={clearError}
                onErrorRetry={retryLastMessage}
            />
        </>
    );
};
