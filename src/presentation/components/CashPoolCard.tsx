import { useTranslation } from 'react-i18next';
import type { CashPool } from '@/domain/entities/CashPool';
import { Money } from '@/domain/value-objects/Money';

interface CashPoolCardProps {
    pool: CashPool;
    onEdit?: () => void;
    onDelete?: () => void;
    onClick?: () => void;
}

/**
 * Cash Pool Card Component
 * Displays a cash pool with balance and actions
 */
export function CashPoolCard({ pool, onEdit, onDelete, onClick }: CashPoolCardProps) {
    const { t } = useTranslation(['pools', 'common']);

    const balance = new Money(pool.balance, pool.currency);
    const typeLabel = t(`pools:types.${pool.type}`);

    return (
        <div
            className="widget-card"
            style={{
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.2s',
            }}
            onClick={onClick}
        >
            <div className="widget-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    {pool.icon && <span style={{ fontSize: 'var(--font-size-lg)' }}>{pool.icon}</span>}
                    <div>
                        <h3
                            style={{
                                fontSize: 'var(--font-size-base)',
                                fontWeight: 600,
                                color: 'var(--color-text-primary)',
                                marginBottom: '2px',
                            }}
                        >
                            {pool.name}
                        </h3>
                        <p
                            style={{
                                fontSize: 'var(--font-size-xs)',
                                color: 'var(--color-text-muted)',
                                textTransform: 'uppercase',
                            }}
                        >
                            {typeLabel}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                    {onEdit && (
                        <button
                            className="btn-icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                            aria-label={t('pools:actions.edit')}
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            ✎
                        </button>
                    )}
                    {onDelete && (
                        <button
                            className="btn-icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            aria-label={t('pools:actions.delete')}
                            style={{ color: 'var(--color-status-latest)' }}
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            <div style={{ marginTop: 'var(--spacing-md)' }}>
                <p
                    style={{
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-text-secondary)',
                        marginBottom: '4px',
                    }}
                >
                    {t('pools:card.balance')}
                </p>
                <p
                    style={{
                        fontSize: 'var(--font-size-xl)',
                        fontWeight: 600,
                        color: pool.color || 'var(--color-text-primary)',
                    }}
                >
                    {balance.format()}
                </p>
            </div>

            {pool.lastTransactionAt && (
                <p
                    style={{
                        marginTop: 'var(--spacing-sm)',
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-text-muted)',
                    }}
                >
                    {t('pools:card.lastTransaction')}: {pool.lastTransactionAt.toLocaleDateString()}
                </p>
            )}
        </div>
    );
}
