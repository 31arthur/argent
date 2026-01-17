import { useTranslation } from 'react-i18next';
import type { ChatMessage } from '@/presentation/hooks/useChatWidget';

interface UserMessageProps {
    message: ChatMessage;
}

/**
 * User message bubble (aligned right)
 */
export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
    const { t } = useTranslation();

    return (
        <div className="message-wrapper message-wrapper-user">
            <div className="message-bubble message-bubble-user">
                {t(message.content)}
            </div>
        </div>
    );
};
