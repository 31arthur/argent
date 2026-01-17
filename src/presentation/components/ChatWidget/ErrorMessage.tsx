import { useTranslation } from 'react-i18next';
import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
    error: string;
    onRetry?: () => void;
    onDismiss: () => void;
}

/**
 * Error message component with retry and dismiss actions
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onRetry, onDismiss }) => {
    const { t } = useTranslation();

    return (
        <div className="error-message">
            <div className="error-message-content">
                <AlertCircle size={16} className="error-message-icon" />
                <p className="error-message-text">{t(error)}</p>
                <button
                    onClick={onDismiss}
                    className="error-message-dismiss"
                    aria-label="Dismiss error"
                    type="button"
                >
                    <X size={16} />
                </button>
            </div>
            {onRetry && (
                <button onClick={onRetry} className="error-message-retry" type="button">
                    {t('agent.actions.retry')}
                </button>
            )}
        </div>
    );
};
