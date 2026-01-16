import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '../hooks/useTransactions';
import { useCashPools } from '../hooks/useCashPools';
import { useCategories } from '../hooks/useCategories';
import { TransactionItem } from '../components/TransactionItem';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { ArgentLoader } from '../components/ArgentLoader';

/**
 * Transactions Page
 * View and manage all transactions
 */
export default function Transactions() {
    const { t } = useTranslation(['transactions', 'common']);
    const { user } = useAuth();
    const { transactions, isLoading, addTransaction, deleteTransaction } = useTransactions();
    const { pools } = useCashPools();
    const { categories } = useCategories();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

    const handleDeleteTransaction = async (id: string) => {
        if (window.confirm(t('transactions:deleteConfirm.message'))) {
            try {
                await deleteTransaction.mutateAsync(id);
            } catch (error) {
                console.error('Failed to delete transaction:', error);
            }
        }
    };

    // Get pool and category for each transaction
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
        <div style={{ padding: 'var(--spacing-xl)' }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--spacing-xl)',
                }}
            >
                <div>
                    <h1
                        style={{
                            fontSize: 'var(--font-size-xl)',
                            fontWeight: 600,
                            marginBottom: 'var(--spacing-xs)',
                            color: 'var(--color-text-primary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}
                    >
                        {t('transactions:title')}
                    </h1>
                    <p
                        style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-secondary)',
                        }}
                    >
                        {t('transactions:subtitle')}
                    </p>
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    disabled={pools.length === 0}
                    style={{
                        padding: 'var(--spacing-sm) var(--spacing-lg)',
                        fontSize: 'var(--font-size-base)',
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 500,
                        backgroundColor: pools.length === 0 ? 'var(--color-background-accent)' : 'var(--color-text-primary)',
                        border: 'none',
                        borderRadius: 'var(--radius)',
                        color: 'var(--color-text-inverse)',
                        cursor: pools.length === 0 ? 'not-allowed' : 'pointer',
                        opacity: pools.length === 0 ? 0.5 : 1,
                    }}
                >
                    + {t('transactions:actions.add')}
                </button>
            </div>

            {transactions.length === 0 ? (
                <div
                    style={{
                        textAlign: 'center',
                        padding: 'var(--spacing-2xl)',
                        backgroundColor: 'var(--color-background-secondary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius)',
                    }}
                >
                    <h3
                        style={{
                            fontSize: 'var(--font-size-lg)',
                            fontWeight: 600,
                            marginBottom: 'var(--spacing-sm)',
                            color: 'var(--color-text-primary)',
                        }}
                    >
                        {t('transactions:empty.title')}
                    </h3>
                    <p
                        style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-secondary)',
                            marginBottom: 'var(--spacing-lg)',
                        }}
                    >
                        {t('transactions:empty.description')}
                    </p>
                    {pools.length > 0 && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            style={{
                                padding: 'var(--spacing-sm) var(--spacing-lg)',
                                fontSize: 'var(--font-size-base)',
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 500,
                                backgroundColor: 'var(--color-text-primary)',
                                border: 'none',
                                borderRadius: 'var(--radius)',
                                color: 'var(--color-text-inverse)',
                                cursor: 'pointer',
                            }}
                        >
                            {t('transactions:actions.add')}
                        </button>
                    )}
                </div>
            ) : (
                <div>
                    {transactions.map((transaction) => (
                        <TransactionItem
                            key={transaction.id}
                            transaction={transaction}
                            pool={getPool(transaction.poolId)}
                            category={getCategory(transaction.categoryId)}
                            onDelete={() => handleDeleteTransaction(transaction.id)}
                        />
                    ))}
                </div>
            )}

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
