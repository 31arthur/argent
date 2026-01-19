import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePersons } from '../hooks/usePersons';
import { PersonModal } from '../components/PersonModal';
import { ArgentLoader } from '../components/ArgentLoader';

/**
 * Persons Page
 * Manage individuals for loans and settlements
 */
export default function Persons() {
    const { t } = useTranslation('persons');
    const { persons, isLoading, createPerson, deletePerson } = usePersons();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreate = async (data: any) => {
        await createPerson.mutateAsync(data);
        setIsModalOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm(t('persons:deleteWarning', { count: 0 }))) {
            await deletePerson.mutateAsync(id);
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
                    + {t('addPerson')}
                </button>
            </div>

            {/* Content */}
            {isLoading ? (
                <ArgentLoader />
            ) : persons.length === 0 ? (
                <div
                    style={{
                        padding: 'var(--spacing-xl)',
                        backgroundColor: 'var(--color-background-secondary)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-border)',
                    }}
                >
                    <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                        {t('noPersons')}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    {persons.map((person) => (
                        <div key={person.id} className="widget-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flex: 1 }}>
                                    {/* Avatar */}
                                    <img
                                        src={person.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(person.name)}`}
                                        alt={person.name}
                                        style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '50%',
                                            backgroundColor: 'var(--color-background-secondary)',
                                        }}
                                    />
                                    <div>
                                        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>
                                            {person.name}
                                        </h3>
                                        {person.email && (
                                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                {person.email}
                                            </p>
                                        )}
                                        {person.phone && (
                                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                {person.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(person.id)}
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
                                    {t('actions.delete')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <PersonModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreate}
                isLoading={createPerson.isPending}
            />
        </div>
    );
}
