import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import { useCashPools } from '../hooks/useCashPools';
import { useCategories } from '../hooks/useCategories';
import { TransactionItem } from '../components/TransactionItem';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { ArgentLoader } from '../components/ArgentLoader';
import { useTransactions } from '../hooks/useTransactions';
import { Money } from '@/domain/value-objects/Money';

/**
 * Dashboard Page
 * Main dashboard with spending analytics
 */
export default function Dashboard() {
    const { t } = useTranslation(['dashboard', 'common', 'categories']);
    const { user } = useAuth();
    const navigate = useNavigate();
    const { monthlySpending, dailySpending, recentTransactions, categoryBreakdown, isLoading } =
        useDashboard();
    const { pools } = useCashPools();
    const { categories } = useCategories();
    const { addTransaction } = useTransactions();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Calculate total pool balance
    const totalBalance = pools.reduce((sum, pool) => sum + pool.balance, 0);

    const handleAddTransaction = async (data: any) => {
        try {
            await addTransaction.mutateAsync({
                ...data,
                userId: user!.id,
            });
            setIsAddModalOpen(false);
        } catch (error: any) {
            console.error('Failed to add transaction:', error);
            alert(error.message || 'Failed to add transaction');
        }
    };

    // Get pool and category for transactions
    const getPool = (poolId: string) => pools.find((p) => p.id === poolId);
    const getCategory = (categoryId: string) => categories.find((c) => c.id === categoryId);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <ArgentLoader size={120} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
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
                        {t('dashboard:title')}
                    </h1>
                    <p
                        style={{
                            fontSize: 'var(--font-size-base)',
                            color: 'var(--color-text-secondary)',
                        }}
                    >
                        Welcome back, {user?.displayName || user?.email?.split('@')[0]}
                    </p>
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn-primary"
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
                        gap: 'var(--spacing-sm)',
                        boxShadow: 'var(--shadow-md)',
                        transition: 'transform 0.2s',
                    }}
                >
                    + {t('dashboard:quickActions.addTransaction')}
                </button>
            </div>

            {/* Summary Cards */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 'var(--spacing-lg)',
                    marginBottom: 'var(--spacing-xl)',
                }}
            >
                {/* Total Balance */}
                <div className="widget-card">
                    <div className="widget-header">
                        <p style={{
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 600,
                            color: 'var(--color-text-secondary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Total Balance
                        </p>
                        <span style={{
                            padding: 'var(--spacing-xs) var(--spacing-md)',
                            backgroundColor: 'var(--color-primary-50)',
                            color: 'var(--color-primary-600)',
                            borderRadius: 'var(--radius-full)',
                            fontSize: 'var(--font-size-badge)',
                            fontWeight: 600
                        }}>
                            +2.4%
                        </span>
                    </div>
                    <p
                        style={{
                            fontSize: 'var(--font-size-display)',
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                            letterSpacing: '-0.03em',
                            lineHeight: 1,
                            marginBottom: 'var(--spacing-md)'
                        }}
                    >
                        {new Money(totalBalance).format()}
                    </p>
                    <button
                        onClick={() => navigate('/pools')}
                        style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-secondary)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            textDecoration: 'underline'
                        }}
                    >
                        View {pools.length} active pools
                    </button>
                </div>

                {/* Monthly Spending */}
                <div className="widget-card">
                    <div className="widget-header">
                        <p style={{
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 600,
                            color: 'var(--color-text-secondary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Monthly Spending
                        </p>
                    </div>
                    <p
                        style={{
                            fontSize: 'var(--font-size-display)',
                            fontWeight: 700,
                            color: 'var(--color-primary-500)',
                            letterSpacing: '-0.03em',
                            lineHeight: 1,
                        }}
                    >
                        {new Money(monthlySpending).format()}
                    </p>
                    <div style={{ marginTop: 'var(--spacing-md)', height: '6px', width: '100%', background: 'var(--color-background-secondary)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: '65%', height: '100%', background: 'var(--color-primary-500)' }} />
                    </div>
                </div>

                {/* Daily Spending */}
                <div className="widget-card">
                    <div className="widget-header">
                        <p style={{
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 600,
                            color: 'var(--color-text-secondary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Today's Spending
                        </p>
                    </div>
                    <p
                        style={{
                            fontSize: 'var(--font-size-display)',
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                            letterSpacing: '-0.03em',
                            lineHeight: 1,
                        }}
                    >
                        {new Money(dailySpending).format()}
                    </p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div
                className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
            >
                {/* Recent Transactions */}
                <div className="widget-card lg:col-span-2" style={{ minHeight: '500px' }}>
                    <div className="widget-header">
                        <h2 className="widget-title">Transaction History</h2>
                        <button
                            onClick={() => navigate('/transactions')}
                            style={{
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--color-text-accent)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            See All
                        </button>
                    </div>
                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                        {recentTransactions.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                                No transactions yet.
                            </div>
                        ) : (
                            recentTransactions.map((transaction) => (
                                <TransactionItem
                                    key={transaction.id}
                                    transaction={transaction}
                                    pool={getPool(transaction.poolId)}
                                    category={getCategory(transaction.categoryId)}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="widget-card">
                    <h2 className="widget-title" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        Where your money goes
                    </h2>
                    <div>
                        {categoryBreakdown.length === 0 ? (
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                                No data available.
                            </p>
                        ) : (
                            categoryBreakdown.slice(0, 5).map((item, index) => (
                                <div
                                    key={item.categoryId}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: 'var(--spacing-md) 0',
                                        borderBottom: index !== categoryBreakdown.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: 'var(--radius)',
                                            background: `var(--color-primary-${(index + 1) * 100})`,
                                            color: 'var(--color-primary-600)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 'var(--font-size-icon)'
                                        }}>
                                            {item.icon}
                                        </div>
                                        <div>
                                            <p
                                                style={{
                                                    fontSize: 'var(--font-size-base)',
                                                    fontWeight: 600,
                                                    color: 'var(--color-text-primary)',
                                                }}
                                            >
                                                {t(item.categoryName)}
                                            </p>
                                            <p
                                                style={{
                                                    fontSize: 'var(--font-size-sm)',
                                                    color: 'var(--color-text-muted)',
                                                }}
                                            >
                                                {item.percentage.toFixed(1)}% of total
                                            </p>
                                        </div>
                                    </div>
                                    <p
                                        style={{
                                            fontSize: 'var(--font-size-base)',
                                            fontWeight: 600,
                                            color: 'var(--color-text-primary)',
                                        }}
                                    >
                                        {new Money(item.amount).format()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <AddTransactionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddTransaction}
                pools={pools}
                categories={categories}
                isLoading={addTransaction.isPending}
            />
        </div>
    );
}
