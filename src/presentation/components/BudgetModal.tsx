import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        month: number;
        year: number;
        name?: string;
        notes?: string;
    }) => void;
    isLoading?: boolean;
}

/**
 * Budget Modal
 * Form for creating monthly budgets
 */
export function BudgetModal({ isOpen, onClose, onSubmit, isLoading }: BudgetModalProps) {
    const { t } = useTranslation(['budgets', 'common']);

    const currentDate = new Date();
    const [month, setMonth] = useState(currentDate.getMonth() + 1);
    const [year, setYear] = useState(currentDate.getFullYear());
    const [name, setName] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (month < 1 || month > 12) {
            setError('Month must be between 1 and 12');
            return;
        }

        if (year < 2000) {
            setError('Year must be 2000 or later');
            return;
        }

        onSubmit({
            month,
            year,
            name: name.trim() || undefined,
            notes: notes.trim() || undefined,
        });

        // Reset form
        setMonth(currentDate.getMonth() + 1);
        setYear(currentDate.getFullYear());
        setName('');
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
                    {t('budgets:createBudget')}
                </h2>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{ padding: 'var(--spacing-sm)', backgroundColor: 'var(--color-status-expense)', color: 'white', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 600 }}>
                                {t('budgets:form.month')} *
                            </label>
                            <select
                                value={month}
                                onChange={(e) => setMonth(parseInt(e.target.value))}
                                style={{
                                    width: '100%',
                                    padding: 'var(--spacing-sm)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border)',
                                    fontSize: 'var(--font-size-base)',
                                    backgroundColor: 'var(--color-surface)',
                                }}
                                required
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                    <option key={m} value={m}>
                                        {t(`budgets:months.${m}`)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 600 }}>
                                {t('budgets:form.year')} *
                            </label>
                            <input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(parseInt(e.target.value))}
                                min="2000"
                                max="2100"
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
                            {t('budgets:form.name')}
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Monthly Budget"
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
                            {t('budgets:form.notes')}
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
                            {isLoading ? 'Creating...' : t('budgets:actions.create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
