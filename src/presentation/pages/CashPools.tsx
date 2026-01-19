import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCashPools } from '../hooks/useCashPools';
import { CashPoolCard } from '../components/CashPoolCard';
import { CreatePoolModal } from '../components/CreatePoolModal';
import { ArgentLoader } from '../components/ArgentLoader';

/**
 * Cash Pools Page
 * Manage all cash pools
 */
export default function CashPools() {
    const { t } = useTranslation(['pools', 'common']);
    const { user } = useAuth();
    const navigate = useNavigate();
    const { pools, isLoading, createPool, deletePool } = useCashPools();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const handleCreatePool = async (data: any) => {
        try {
            if (!user) {
                console.error('User not authenticated');
                return;
            }

            // Determine default icon and color based on pool type
            const getDefaultIcon = (type: string) => {
                switch (type) {
                    case 'bank':
                        return '🏦';
                    case 'cash':
                        return '💵';
                    case 'digital':
                        return '💳';
                    default:
                        return '💰';
                }
            };

            const getDefaultColor = (type: string) => {
                switch (type) {
                    case 'bank':
                        return '#1C4B9B';
                    case 'cash':
                        return '#4CAF50';
                    case 'digital':
                        return '#2196F3';
                    default:
                        return '#666666';
                }
            };

            await createPool.mutateAsync({
                ...data,
                userId: user.id,
                icon: data.icon || getDefaultIcon(data.type),
                color: data.color || getDefaultColor(data.type),
            });
            setIsCreateModalOpen(false);
        } catch (error) {
            console.error('Failed to create pool:', error);
        }
    };

    const handleDeletePool = async (id: string, name: string) => {
        if (window.confirm(t('pools:deleteConfirm.message', { name }))) {
            try {
                await deletePool.mutateAsync(id);
            } catch (error) {
                console.error('Failed to delete pool:', error);
            }
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <ArgentLoader size={120} />
            </div>
        );
    }

    return (
        <div className="pt-16 md:pt-0" style={{ padding: 'var(--spacing-xl)' }}>
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
                            fontWeight: 600,
                            marginBottom: 'var(--spacing-xs)',
                            color: 'var(--color-text-primary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}
                    >
                        {t('pools:title')}
                    </h1>
                    <p
                        style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-secondary)',
                        }}
                    >
                        {t('pools:subtitle')}
                    </p>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    disabled={!user}
                    className="w-full sm:w-auto"
                    style={{
                        padding: 'var(--spacing-sm) var(--spacing-lg)',
                        fontSize: 'var(--font-size-base)',
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 500,
                        backgroundColor: 'var(--color-text-primary)',
                        border: 'none',
                        borderRadius: 'var(--radius)',
                        color: 'var(--color-text-inverse)',
                        cursor: user ? 'pointer' : 'not-allowed',
                        opacity: user ? 1 : 0.5,
                        minHeight: '44px',
                    }}
                >
                    + {t('pools:actions.create')}
                </button>
            </div>

            {pools.length === 0 ? (
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
                        {t('pools:empty.title')}
                    </h3>
                    <p
                        style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-secondary)',
                            marginBottom: 'var(--spacing-lg)',
                        }}
                    >
                        {t('pools:empty.description')}
                    </p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        disabled={!user}
                        style={{
                            padding: 'var(--spacing-sm) var(--spacing-lg)',
                            fontSize: 'var(--font-size-base)',
                            fontFamily: 'var(--font-sans)',
                            fontWeight: 500,
                            backgroundColor: 'var(--color-text-primary)',
                            border: 'none',
                            borderRadius: 'var(--radius)',
                            color: 'var(--color-text-inverse)',
                            cursor: user ? 'pointer' : 'not-allowed',
                            opacity: user ? 1 : 0.5,
                        }}
                    >
                        {t('pools:actions.create')}
                    </button>
                </div>
            ) : (
                <div
                    className="grid-responsive-1 grid-responsive-2 grid-responsive-3"
                    style={{
                        gap: 'var(--spacing-lg)',
                    }}
                >
                    {pools.map((pool) => (
                        <CashPoolCard
                            key={pool.id}
                            pool={pool}
                            onClick={() => navigate(`/pools/${pool.id}`)}
                            onDelete={() => handleDeletePool(pool.id, pool.name)}
                        />
                    ))}
                </div>
            )}

            <CreatePoolModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreatePool}
                isLoading={createPool.isPending}
            />
        </div>
    );
}
