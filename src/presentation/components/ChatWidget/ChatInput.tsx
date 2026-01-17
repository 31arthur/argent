import { useState, KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: (message: string) => void;
    disabled?: boolean;
}

/**
 * Chat input field with send button
 */
export const ChatInput: React.FC<ChatInputProps> = ({
    value,
    onChange,
    onSend,
    disabled = false,
}) => {
    const { t } = useTranslation();

    const handleSend = () => {
        if (value.trim() && !disabled) {
            onSend(value);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-input-container">
            <input
                type="text"
                className="chat-input"
                placeholder={t('agent.chat.input_placeholder')}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                aria-label={t('agent.chat.input_placeholder')}
            />
            <button
                onClick={handleSend}
                className="chat-send-button"
                disabled={!value.trim() || disabled}
                aria-label={t('agent.chat.send_button')}
                type="button"
            >
                <Send size={20} />
            </button>
        </div>
    );
};
