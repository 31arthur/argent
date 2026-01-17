import { useTranslation } from 'react-i18next';
import type { ConfirmationPayload } from '@/data/api/AgentApiClient';

interface ConfirmationCardProps {
    payload: ConfirmationPayload;
    onConfirm: () => void;
    onEdit: () => void;
    onCancel: () => void;
    isLoading: boolean;
}

/**
 * Confirmation card for transaction review
 */
export const ConfirmationCard: React.FC<ConfirmationCardProps> = ({
    payload,
    onConfirm,
    onEdit,
    onCancel,
    isLoading,
}) => {
    const { t } = useTranslation();
    const { summary } = payload;

    // Format date
    const formattedDate = new Date(summary.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <div className="confirmation-card">
            <h4 className="confirmation-card-title">{t('agent.chat.confirmation_title')}</h4>

            <div className="confirmation-card-summary">
                <div className="confirmation-card-row">
                    <span className="confirmation-card-label">Pool:</span>
                    <span className="confirmation-card-value">{summary.poolName}</span>
                </div>

                <div className="confirmation-card-row">
                    <span className="confirmation-card-label">Amount:</span>
                    <span className="confirmation-card-value confirmation-card-amount">
                        ₹{summary.amount.toLocaleString()}
                    </span>
                </div>

                <div className="confirmation-card-row">
                    <span className="confirmation-card-label">Type:</span>
                    <span className="confirmation-card-value">{summary.type}</span>
                </div>

                <div className="confirmation-card-row">
                    <span className="confirmation-card-label">Category:</span>
                    <span className="confirmation-card-value">{summary.categoryName}</span>
                </div>

                <div className="confirmation-card-row">
                    <span className="confirmation-card-label">Purpose:</span>
                    <span className="confirmation-card-value">{summary.purpose}</span>
                </div>

                <div className="confirmation-card-row">
                    <span className="confirmation-card-label">Date:</span>
                    <span className="confirmation-card-value">{formattedDate}</span>
                </div>

                {summary.notes && (
                    <div className="confirmation-card-row">
                        <span className="confirmation-card-label">Notes:</span>
                        <span className="confirmation-card-value">{summary.notes}</span>
                    </div>
                )}

                {summary.tags && summary.tags.length > 0 && (
                    <div className="confirmation-card-row">
                        <span className="confirmation-card-label">Tags:</span>
                        <span className="confirmation-card-value">
                            {summary.tags.join(', ')}
                        </span>
                    </div>
                )}
            </div>

            <div className="confirmation-card-actions">
                <button
                    onClick={onConfirm}
                    className="confirmation-card-button confirmation-card-button-confirm"
                    disabled={isLoading}
                    type="button"
                >
                    {isLoading ? 'Confirming...' : t('agent.actions.confirm')}
                </button>
                <button
                    onClick={onEdit}
                    className="confirmation-card-button confirmation-card-button-edit"
                    disabled={isLoading}
                    type="button"
                >
                    {t('agent.actions.edit')}
                </button>
                <button
                    onClick={onCancel}
                    className="confirmation-card-button confirmation-card-button-cancel"
                    disabled={isLoading}
                    type="button"
                >
                    {t('agent.actions.cancel')}
                </button>
            </div>
        </div>
    );
};
