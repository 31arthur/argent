import { useTranslation } from 'react-i18next';
import type { Transaction } from '@/domain/entities/Transaction';
import type { CashPool } from '@/domain/entities/CashPool';
import type { Category } from '@/domain/entities/Category';
import { Money } from '@/domain/value-objects/Money';
import { format } from 'date-fns';

interface TransactionItemProps {
    transaction: Transaction;
    pool?: CashPool;
    category?: Category;
    onDelete?: () => void;
}

/**
 * Transaction Item Component
 * Displays a single transaction in a list
 */
export function TransactionItem({ transaction, pool, category, onDelete }: TransactionItemProps) {
    const { t } = useTranslation(['transactions', 'common']);

    const amount = new Money(transaction.amount, pool?.currency || 'INR');
    const typeLabel = t(`transactions:types.${transaction.type}`);

    return (
        <div
            className="group"
            style={{
                padding: '16px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                borderBottom: '1px solid var(--color-border-subtle)',
                transition: 'background-color 0.2s',
            }}
        >
            {/* Category Icon */}
            {category ? (
                <div
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '16px',
                        backgroundColor: category.color + '15', // very subtle opacity
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        color: category.color,
                        flexShrink: 0,
                    }}
                >
                    {category.icon}
                </div>
            ) : (
                <div
                    style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-background-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'var(--font-size-icon)',
                        flexShrink: 0,
                    }}
                ></div>
            )}

            {/* Transaction Details */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <p
                        style={{
                            fontSize: 'var(--font-size-base)',
                            fontWeight: 600,
                            color: 'var(--color-text-primary)',
                            marginBottom: 'var(--spacing-xs)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {transaction.purpose}
                    </p>
                    <p
                        style={{
                            fontSize: 'var(--font-size-base)',
                            fontWeight: 600,
                            color: transaction.type === 'expense' ? 'var(--color-status-expense)' : 'var(--color-status-income)',
                        }}
                    >
                        {transaction.type === 'expense' ? '-' : '+'}{amount.format()}
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p
                        style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-muted)',
                            marginBottom: 'var(--spacing-xs)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <span>{format(transaction.date, 'MMM dd')}</span>
                        <span>•</span>
                        <span>{pool?.name}</span>
                    </p>
                </div>

                {/* Tags (optional, small) */}
                {transaction.tags && transaction.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                        {transaction.tags.map(tag => (
                            <span key={tag} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', background: 'var(--color-background-accent)', padding: 'var(--spacing-xs) var(--spacing-sm)', borderRadius: 'var(--radius-sm)' }}>#{tag}</span>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Button (Hover only usually, but visible for now) */}
            {onDelete && (
                <button
                    onClick={onDelete}
                    aria-label={t('transactions:actions.delete')}
                    style={{
                        color: 'var(--color-text-muted)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '50%',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-status-expense)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                >
                    ×
                </button>
            )}
        </div>
    );
}
