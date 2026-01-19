import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoans } from '../hooks/useLoans';
import { usePersons } from '../hooks/usePersons';
import { LoanModal } from '../components/LoanModal';
import { ArgentLoader } from '../components/ArgentLoader';

/**
 * Loans Page
 * Track borrowed and lent money
 */
export default function Loans() {
    const { t } = useTranslation('loans');
    const { loans, isLoading, createLoan, deleteLoan } = useLoans();
    const { persons } = usePersons();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreate = async (data: any) => {
        await createLoan.mutateAsync(data);
        setIsModalOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this loan?')) {
            await deleteLoan.mutateAsync(id);
        }
    };

    // Calculate totals
    const totalTaken = loans.filter(l => l.direction === 'TAKEN' && l.status === 'ACTIVE').reduce((sum, l) => sum + l.principalAmount, 0);
    const totalGiven = loans.filter(l => l.direction === 'GIVEN' && l.status === 'ACTIVE').reduce((sum, l) => sum + l.principalAmount, 0);

    return (
        <div className="pt-16 md:pt-0" style={{ padding: 'var(--spacing-xl)' }}>
            {/* Header */}
            <div
                className="stack-mobile"
                style={{
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 'var(--spacing-xl)',
                }}
            >
                <div>
                    <h1
                        style={{
                            fontSize: 'var(--font-size-xl)',
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
                    className="w-full sm:w-auto"
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        padding: 'var(--spacing-sm) var(--spacing-lg)',
                        fontSize: 'var(--font-size-base)',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-full)',
                        border: 'none',
                        backgroundColor: 'var(--color-text-primary)',
                        color: 'var(--color-text-inverse)',
                        cursor: 'pointer',
                        minHeight: '44px',
                    }}
                >
                    + {t('addLoan')}
                </button>
            </div>

            {/* Summary Cards */}
            <div
                className="grid-responsive-1 grid-responsive-2 grid-responsive-3"
                style={{
                    marginBottom: 'var(--spacing-xl)',
                }}
            >
                {/* Total Borrowed */}
                <div className="widget-card">
                    <div className="widget-header">
                        <p style={{
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 600,
                            color: 'var(--color-text-secondary)',
                        }}>
                            {t('summary.totalTaken')}
                        </p>
                    </div>
                    <p style={{
                        fontSize: 'var(--font-size-2xl)',
                        fontWeight: 700,
                        color: 'var(--color-status-expense)',
                    }}>
                        ₹{totalTaken.toLocaleString()}
                    </p>
                </div>

                {/* Total Lent */}
                <div className="widget-card">
                    <div className="widget-header">
                        <p style={{
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 600,
                            color: 'var(--color-text-secondary)',
                        }}>
                            {t('summary.totalGiven')}
                        </p>
                    </div>
                    <p style={{
                        fontSize: 'var(--font-size-2xl)',
                        fontWeight: 700,
                        color: 'var(--color-status-income)',
                    }}>
                        ₹{totalGiven.toLocaleString()}
                    </p>
                </div>

                {/* Net Position */}
                <div className="widget-card">
                    <div className="widget-header">
                        <p style={{
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 600,
                            color: 'var(--color-text-secondary)',
                        }}>
                            {t('summary.netPosition')}
                        </p>
                    </div>
                    <p style={{
                        fontSize: 'var(--font-size-2xl)',
                        fontWeight: 700,
                        color: 'var(--color-text-primary)',
                    }}>
                        ₹{(totalGiven - totalTaken).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <ArgentLoader />
            ) : loans.length === 0 ? (
                <div
                    style={{
                        padding: 'var(--spacing-xl)',
                        backgroundColor: 'var(--color-background-secondary)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-border)',
                    }}
                >
                    <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                        {t('noLoans')}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    {loans.map((loan) => {
                        const person = persons.find(p => p.id === loan.personId);
                        return (
                            <div key={loan.id} className="widget-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div>
                                        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>
                                            {person?.name || 'Unknown'}
                                        </h3>
                                        <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: loan.direction === 'GIVEN' ? 'var(--color-status-income)' : 'var(--color-status-expense)' }}>
                                            ₹{loan.principalAmount.toLocaleString()}
                                        </p>
                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                            {t(`direction.${loan.direction.toLowerCase()}`)} • {new Date(loan.borrowedDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)', alignItems: 'center' }}>
                                        <span
                                            style={{
                                                padding: 'var(--spacing-xs) var(--spacing-sm)',
                                                borderRadius: 'var(--radius-md)',
                                                fontSize: 'var(--font-size-xs)',
                                                fontWeight: 600,
                                                backgroundColor: loan.status === 'ACTIVE' ? 'var(--color-primary-500)20' : 'var(--color-text-secondary)20',
                                                color: loan.status === 'ACTIVE' ? 'var(--color-primary-500)' : 'var(--color-text-secondary)',
                                            }}
                                        >
                                            {t(`status.${loan.status.toLowerCase()}`)}
                                        </span>
                                        <button
                                            onClick={() => handleDelete(loan.id)}
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
                            </div>
                        );
                    })}
                </div>
            )}

            <LoanModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreate}
                persons={persons}
                isLoading={createLoan.isPending}
            />
        </div>
    );
}
