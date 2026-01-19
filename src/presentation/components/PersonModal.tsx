import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PersonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        email?: string;
        phone?: string;
        notes?: string;
    }) => void;
    isLoading?: boolean;
}

/**
 * Person Modal
 * Form for creating/editing persons
 */
export function PersonModal({ isOpen, onClose, onSubmit, isLoading }: PersonModalProps) {
    const { t } = useTranslation(['persons', 'common']);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name || name.trim().length < 2) {
            setError('Name must be at least 2 characters');
            return;
        }

        onSubmit({
            name: name.trim(),
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            notes: notes.trim() || undefined,
        });

        // Reset form
        setName('');
        setEmail('');
        setPhone('');
        setNotes('');
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: 'var(--spacing-md)',
            }}
            onClick={onClose}
        >
            <div
                className="modal-content"
                style={{
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-xl)',
                    maxWidth: '500px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--spacing-lg)' }}>
                    {t('persons:addPerson')}
                </h2>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{ padding: 'var(--spacing-sm)', backgroundColor: 'var(--color-status-expense)', color: 'white', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 600 }}>
                            {t('persons:form.name')} *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('persons:form.namePlaceholder')}
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-sm)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                fontSize: 'var(--font-size-base)',
                            }}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 600 }}>
                            {t('persons:form.email')}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t('persons:form.emailPlaceholder')}
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-sm)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                fontSize: 'var(--font-size-base)',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 600 }}>
                            {t('persons:form.phone')}
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder={t('persons:form.phonePlaceholder')}
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-sm)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                fontSize: 'var(--font-size-base)',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 600 }}>
                            {t('persons:form.notes')}
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-sm)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                fontSize: 'var(--font-size-base)',
                                resize: 'vertical',
                            }}
                        />
                    </div>

                    <div className="flex-col sm:flex-row" style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: 'var(--spacing-sm) var(--spacing-lg)',
                                borderRadius: 'var(--radius-full)',
                                border: '1px solid var(--color-border)',
                                backgroundColor: 'transparent',
                                cursor: 'pointer',
                                fontSize: 'var(--font-size-base)',
                                fontWeight: 600,
                            }}
                        >
                            {t('common:cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                flex: 1,
                                padding: 'var(--spacing-sm) var(--spacing-lg)',
                                borderRadius: 'var(--radius-full)',
                                border: 'none',
                                backgroundColor: 'var(--color-text-primary)',
                                color: 'var(--color-text-inverse)',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                fontSize: 'var(--font-size-base)',
                                fontWeight: 600,
                            }}
                        >
                            {isLoading ? 'Creating...' : t('persons:actions.create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
