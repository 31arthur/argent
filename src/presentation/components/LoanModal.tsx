import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Person } from '@/domain/entities/Person';

interface LoanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        personId: string;
        direction: 'TAKEN' | 'GIVEN';
        principalAmount: number;
        borrowedDate: Date;
        interestRate?: number;
        expectedRepaymentDate?: Date;
        notes?: string;
    }) => void;
    persons: Person[];
    isLoading?: boolean;
}

/**
 * Loan Modal
 * Form for creating/editing loans
 */
export function LoanModal({ isOpen, onClose, onSubmit, persons, isLoading }: LoanModalProps) {
    const { t } = useTranslation(['loans', 'common']);

    const [personId, setPersonId] = useState('');
    const [direction, setDirection] = useState<'TAKEN' | 'GIVEN'>('GIVEN');
    const [principalAmount, setPrincipalAmount] = useState('');
    const [borrowedDate, setBorrowedDate] = useState(new Date().toISOString().split('T')[0]);
    const [interestRate, setInterestRate] = useState('');
    const [expectedRepaymentDate, setExpectedRepaymentDate] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!personId) {
            setError('Please select a person');
            return;
        }

        const amount = parseFloat(principalAmount);
        if (isNaN(amount) || amount <= 0) {
            setError('Principal amount must be greater than 0');
            return;
        }

        const rate = interestRate ? parseFloat(interestRate) : undefined;
        if (rate !== undefined && (rate < 0 || rate > 100)) {
            setError('Interest rate must be between 0 and 100');
            return;
        }

        onSubmit({
            personId,
            direction,
            principalAmount: amount,
            borrowedDate: new Date(borrowedDate),
            interestRate: rate,
            expectedRepaymentDate: expectedRepaymentDate ? new Date(expectedRepaymentDate) : undefined,
            notes: notes.trim() || undefined,
        });

        // Reset form
        setPersonId('');
        setDirection('GIVEN');
        setPrincipalAmount('');
        setBorrowedDate(new Date().toISOString().split('T')[0]);
        setInterestRate('');
        setExpectedRepaymentDate('');
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
                    {t('loans:addLoan')}
                </h2>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{ padding: 'var(--spacing-sm)', backgroundColor: 'var(--color-status-expense)', color: 'white', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 600 }}>
                            {t('loans:form.person')} *
                        </label>
                        <select
                            value={personId}
                            onChange={(e) => setPersonId(e.target.value)}
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
                            <option value="">{t('loans:form.selectPerson')}</option>
                            {persons.map((person) => (
                                <option key={person.id} value={person.id}>
                                    {person.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 600 }}>
                            {t('loans:form.direction')} *
                        </label>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                            <button
                                type="button"
                                onClick={() => setDirection('GIVEN')}
                                style={{
                                    flex: 1,
                                    padding: 'var(--spacing-sm)',
                                    borderRadius: 'var(--radius-md)',
                                    border: `2px solid ${direction === 'GIVEN' ? 'var(--color-status-income)' : 'var(--color-border)'}`,
                                    backgroundColor: direction === 'GIVEN' ? 'var(--color-status-income)20' : 'transparent',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                }}
                            >
                                {t('loans:direction.given')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setDirection('TAKEN')}
                                style={{
                                    flex: 1,
                                    padding: 'var(--spacing-sm)',
                                    borderRadius: 'var(--radius-md)',
                                    border: `2px solid ${direction === 'TAKEN' ? 'var(--color-status-expense)' : 'var(--color-border)'}`,
                                    backgroundColor: direction === 'TAKEN' ? 'var(--color-status-expense)20' : 'transparent',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                }}
                            >
                                {t('loans:direction.taken')}
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 600 }}>
                            {t('loans:form.principalAmount')} *
                        </label>
                        <input
                            type="number"
                            value={principalAmount}
                            onChange={(e) => setPrincipalAmount(e.target.value)}
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 600 }}>
                                {t('loans:form.borrowedDate')} *
                            </label>
                            <input
                                type="date"
                                value={borrowedDate}
                                onChange={(e) => setBorrowedDate(e.target.value)}
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
                                {t('loans:form.interestRate')}
                            </label>
                            <input
                                type="number"
                                value={interestRate}
                                onChange={(e) => setInterestRate(e.target.value)}
                                placeholder="0"
                                min="0"
                                max="100"
                                step="0.1"
                                style={{
                                    width: '100%',
                                    padding: 'var(--spacing-sm)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border)',
                                    fontSize: 'var(--font-size-base)',
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 600 }}>
                            {t('loans:form.expectedRepaymentDate')}
                        </label>
                        <input
                            type="date"
                            value={expectedRepaymentDate}
                            onChange={(e) => setExpectedRepaymentDate(e.target.value)}
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
                            {t('loans:form.notes')}
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
                            {isLoading ? 'Creating...' : t('loans:actions.create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
