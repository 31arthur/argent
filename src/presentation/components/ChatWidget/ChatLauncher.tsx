import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react';

interface ChatLauncherProps {
    isOpen: boolean;
    onClick: () => void;
}

/**
 * Floating chat launcher button
 * Positioned at bottom-right corner
 */
export const ChatLauncher: React.FC<ChatLauncherProps> = ({ isOpen, onClick }) => {
    const { t } = useTranslation('agent');

    if (isOpen) return null;

    return (
        <button
            onClick={onClick}
            className="chat-launcher"
            aria-label={t('chat.open_button')}
            type="button"
        >
            <MessageCircle size={24} />
        </button>
    );
};
