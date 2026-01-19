import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        title: string;
        expectedAmount: number;
        probability: number;
        source?: string;
        expectedCloseDate?: Date;
        notes?: string;
    }) => void;
    isLoading?: boolean;
}

/**
 * Lead Modal
 * Form for creating/editing leads
 */
export function LeadModal({ isOpen, onClose, onSubmit, isLoading }: LeadModalProps) {
    const { t } = useTranslation(['leads', 'common']);

    const [title, setTitle] = useState('');
    const [expectedAmount, setExpectedAmount] = useState('');
    const [probability, setProbability] = useState('50');
    const [source, setSource] = useState('');
    const [expectedCloseDate, setExpectedCloseDate] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!title || title.trim().length === 0) {
            setError('Title is required');
            return;
        }

        const amount = parseFloat(expectedAmount);
        if (isNaN(amount) || amount <= 0) {
            setError('Expected amount must be greater than 0');
            return;
        }

        const prob = parseInt(probability);
        if (isNaN(prob) || prob < 0 || prob > 100) {
            setError('Probability must be between 0 and 100');
            return;
        }

        onSubmit({
            title: title.trim(),
            expectedAmount: amount,
            probability: prob,
            source: source.trim() || undefined,
            expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : undefined,
            notes: notes.trim() || undefined,
        });

        // Reset form
        setTitle('');
        setExpectedAmount('');
        setProbability('50');
        setSource('');
        setExpectedCloseDate('');
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
                    {t('leads:addLead')}
                </h2>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{ padding: 'var(--spacing-sm)', backgroundColor: 'var(--color-status-expense)', color: 'white', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 600 }}>
                            {t('leads:form.title')} *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('leads:form.titlePlaceholder')}
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 600 }}>
                                {t('leads:form.expectedAmount')} *
                            </label>
                            <input
                                type="number"
                                value={expectedAmount}
                                onChange={(e) => setExpectedAmount(e.target.value)}
                                placeholder="0"
                                min="0"
                                step="0.01"
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

                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 600 }}>
                                {t('leads:form.probability')} *
                            </label>
                            <input
                                type="number"
                                value={probability}
                                onChange={(e) => setProbability(e.target.value)}
                                min="0"
                                max="100"
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
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 600 }}>
                            {t('leads:form.source')}
                        </label>
                        <input
                            type="text"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            placeholder={t('leads:form.sourcePlaceholder')}
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
                            {t('leads:form.expectedCloseDate')}
                        </label>
                        <input
                            type="date"
                            value={expectedCloseDate}
                            onChange={(e) => setExpectedCloseDate(e.target.value)}
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
                            {t('leads:form.notes')}
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
                            {isLoading ? 'Creating...' : t('leads:actions.create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
