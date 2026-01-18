import { useTranslation } from 'react-i18next';
import type { ChatMessage } from '@/presentation/hooks/useChatWidget';

interface AgentMessageProps {
    message: ChatMessage;
}

/**
 * Agent message bubble (aligned left)
 */
export const AgentMessage: React.FC<AgentMessageProps> = ({ message }) => {
    const { t } = useTranslation('agent');

    return (
        <div className="message-wrapper message-wrapper-agent">
            <div className="message-bubble message-bubble-agent">
                {t(message.content)}
            </div>
        </div>
    );
};
