import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBudgets } from '../hooks/useBudgets';
import { BudgetModal } from '../components/BudgetModal';
import { ArgentLoader } from '../components/ArgentLoader';

/**
 * Budgets Page
 * Overview of all budgets with year/month selector
 */
export default function Budgets() {
    const { t } = useTranslation('budgets');
    const { budgets, isLoading, createBudget, deleteBudget } = useBudgets();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreate = async (data: any) => {
        await createBudget.mutateAsync(data);
        setIsModalOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this budget?')) {
            await deleteBudget.mutateAsync(id);
        }
    };

    return (
        <div className="max-w-7xl mx-auto pt-16 md:pt-0">
            {/* Header */}
            <div
                className="stack-mobile"
                style={{
                    marginBottom: 'var(--spacing-xl)',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                }}
            >
                <div>
                    <h1
                        style={{
                            fontSize: 'var(--font-size-2xl)',
                            fontWeight: 700,
                            marginBottom: 'var(--spacing-xs)',
                            color: 'var(--color-text-primary)',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        {t('title')}
                    </h1>
                    <p
                        style={{
                            fontSize: 'var(--font-size-base)',
                            color: 'var(--color-text-secondary)',
                        }}
                    >
                        {t('subtitle')}
                    </p>
                </div>

                <button
                    className="btn-primary w-full sm:w-auto"
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        padding: 'var(--spacing-sm) var(--spacing-lg)',
                        backgroundColor: 'var(--color-text-primary)',
                        color: 'var(--color-text-inverse)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-size-base)',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--spacing-sm)',
                        boxShadow: 'var(--shadow-md)',
                        transition: 'transform 0.2s',
                        minHeight: '44px',
                    }}
                >
                    + {t('createBudget')}
                </button>
            </div>

            {/* Content */}
            {isLoading ? (
                <ArgentLoader />
            ) : budgets.length === 0 ? (
                <div
                    style={{
                        padding: 'var(--spacing-xl)',
                        backgroundColor: 'var(--color-background-secondary)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-border)',
                    }}
                >
                    <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                        {t('noBudgets')}
                    </p>
                </div>
            ) : (
                <div className="grid-responsive-1 grid-responsive-2 grid-responsive-3">
                    {budgets.map((budget) => (
                        <div key={budget.id} className="widget-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>
                                        {t(`months.${budget.month}`)} {budget.year}
                                    </h3>
                                    {budget.name && (
                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                            {budget.name}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDelete(budget.id)}
                                    style={{
                                        padding: 'var(--spacing-xs) var(--spacing-sm)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-status-expense)',
                                        backgroundColor: 'transparent',
                                        color: 'var(--color-status-expense)',
                                        cursor: 'pointer',
                                        fontSize: 'var(--font-size-sm)',
                                        fontWeight: 600,
                                        minWidth: '44px',
                                        minHeight: '44px',
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <BudgetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreate}
                isLoading={createBudget.isPending}
            />
        </div>
    );
}
