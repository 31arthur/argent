import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLeads } from '../hooks/useLeads';
import { LeadModal } from '../components/LeadModal';
import { ArgentLoader } from '../components/ArgentLoader';

/**
 * Leads Page
 * Manage potential income opportunities
 */
export default function Leads() {
    const { t } = useTranslation('leads');
    const { leads, isLoading, createLead } = useLeads();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreate = async (data: any) => {
        await createLead.mutateAsync(data);
        setIsModalOpen(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'var(--color-primary-500)';
            case 'WON': return 'var(--color-status-income)';
            case 'LOST': return 'var(--color-status-expense)';
            default: return 'var(--color-text-secondary)';
        }
    };

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
                    + {t('addLead')}
                </button>
            </div>

            {/* Content */}
            {isLoading ? (
                <ArgentLoader />
            ) : leads.length === 0 ? (
                <div
                    style={{
                        padding: 'var(--spacing-xl)',
                        backgroundColor: 'var(--color-background-secondary)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-border)',
                    }}
                >
                    <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                        {t('noLeads')}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    {leads.map((lead) => (
                        <div key={lead.id} className="widget-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>
                                        {lead.title}
                                    </h3>
                                    <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-status-income)' }}>
                                        ₹{lead.expectedAmount.toLocaleString()}
                                    </p>
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                        {lead.probability}% probability
                                    </p>
                                </div>
                                <span
                                    style={{
                                        padding: 'var(--spacing-xs) var(--spacing-sm)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: 'var(--font-size-xs)',
                                        fontWeight: 600,
                                        backgroundColor: getStatusColor(lead.status) + '20',
                                        color: getStatusColor(lead.status),
                                    }}
                                >
                                    {t(`status.${lead.status.toLowerCase()}`)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <LeadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreate}
                isLoading={createLead.isPending}
            />
        </div>
    );
}
