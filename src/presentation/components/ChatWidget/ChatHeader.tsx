import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

interface ChatHeaderProps {
    onClose: () => void;
}

/**
 * Chat window header with assistant name and close button
 */
export const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose }) => {
    const { t } = useTranslation();

    return (
        <div className="chat-header">
            <h3 className="chat-header-title">{t('agent.chat.assistant_name')}</h3>
            <button
                onClick={onClose}
                className="chat-header-close"
                aria-label={t('agent.chat.close_button')}
                type="button"
            >
                <X size={20} />
            </button>
        </div>
    );
};
