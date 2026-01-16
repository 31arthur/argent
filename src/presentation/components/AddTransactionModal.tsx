import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TransactionType } from '@/domain/entities/Transaction';
import type { Category } from '@/domain/entities/Category';
import type { CashPool } from '@/domain/entities/CashPool';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        poolId: string;
        amount: number;
        type: TransactionType;
        categoryId: string;
        purpose: string;
        notes?: string;
        tags?: string[];
        date?: Date;
    }) => void;
    pools: CashPool[];
    categories: Category[];
    isLoading?: boolean;
}

/**
 * Add Transaction Modal
 * Form for creating a new transaction
 */
export function AddTransactionModal({
    isOpen,
    onClose,
    onSubmit,
    pools,
    categories,
    isLoading,
}: AddTransactionModalProps) {
    const { t } = useTranslation(['transactions', 'common', 'validation', 'categories']);
    const [poolId, setPoolId] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<TransactionType>('personal');
    const [categoryId, setCategoryId] = useState('');
    const [purpose, setPurpose] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    // Filter categories by type
    const filteredCategories = categories.filter((c) => c.type === type);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!poolId) {
            setError(t('validation:required'));
            return;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            setError(t('validation:amountTooLow'));
            return;
        }

        if (!categoryId) {
            setError(t('validation:required'));
            return;
        }

        if (purpose.trim().length < 3) {
            setError(t('validation:purposeTooShort'));
            return;
        }

        onSubmit({
            poolId,
            amount: amountNum,
            type,
            categoryId,
            purpose: purpose.trim(),
            notes: notes.trim() || undefined,
            date: new Date(),
        });
    };

    const resetForm = () => {
        setPoolId('');
        setAmount('');
        setType('personal');
        setCategoryId('');
        setPurpose('');
        setNotes('');
        setError('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
            }}
            onClick={handleClose}
        >
            <div
                style={{
                    backgroundColor: 'var(--color-background-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius)',
                    padding: 'var(--spacing-xl)',
                    width: '100%',
                    maxWidth: '600px',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    fontFamily: 'var(--font-mono)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2
                    style={{
                        fontSize: 'var(--font-size-lg)',
                        fontWeight: 600,
                        marginBottom: 'var(--spacing-lg)',
                        color: 'var(--color-text-primary)',
                    }}
                >
                    {t('transactions:actions.add')}
                </h2>

                <form onSubmit={handleSubmit}>
                    {/* Cash Pool */}
                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--color-text-secondary)',
                                marginBottom: 'var(--spacing-xs)',
                            }}
                        >
                            {t('transactions:form.pool.label')}
                        </label>
                        <select
                            value={poolId}
                            onChange={(e) => setPoolId(e.target.value)}
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-sm)',
                                fontSize: 'var(--font-size-base)',
                                fontFamily: 'var(--font-mono)',
                                backgroundColor: 'var(--color-background)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius)',
                                color: 'var(--color-text-primary)',
                            }}
                        >
                            <option value="">{t('transactions:form.pool.placeholder')}</option>
                            {pools.map((pool) => (
                                <option key={pool.id} value={pool.id}>
                                    {pool.name} (₹{pool.balance.toFixed(2)})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Amount */}
                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--color-text-secondary)',
                                marginBottom: 'var(--spacing-xs)',
                            }}
                        >
                            {t('transactions:form.amount.label')}
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder={t('transactions:form.amount.placeholder')}
                            step="0.01"
                            min="0"
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-sm)',
                                fontSize: 'var(--font-size-base)',
                                fontFamily: 'var(--font-mono)',
                                backgroundColor: 'var(--color-background)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius)',
                                color: 'var(--color-text-primary)',
                            }}
                        />
                    </div>

                    {/* Type */}
                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--color-text-secondary)',
                                marginBottom: 'var(--spacing-xs)',
                            }}
                        >
                            {t('transactions:form.type.label')}
                        </label>
                        <select
                            value={type}
                            onChange={(e) => {
                                setType(e.target.value as TransactionType);
                                setCategoryId(''); // Reset category when type changes
                            }}
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-sm)',
                                fontSize: 'var(--font-size-base)',
                                fontFamily: 'var(--font-mono)',
                                backgroundColor: 'var(--color-background)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius)',
                                color: 'var(--color-text-primary)',
                            }}
                        >
                            <option value="personal">{t('transactions:types.personal')}</option>
                            <option value="office">{t('transactions:types.office')}</option>
                        </select>
                    </div>

                    {/* Category */}
                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--color-text-secondary)',
                                marginBottom: 'var(--spacing-xs)',
                            }}
                        >
                            {t('transactions:form.category.label')}
                        </label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-sm)',
                                fontSize: 'var(--font-size-base)',
                                fontFamily: 'var(--font-mono)',
                                backgroundColor: 'var(--color-background)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius)',
                                color: 'var(--color-text-primary)',
                            }}
                        >
                            <option value="">{t('transactions:form.category.placeholder')}</option>
                            {filteredCategories.map((cat) => {
                                // Extract key without 'categories.' prefix
                                const translationKey = cat.name.replace('categories.', '');
                                return (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.icon} {t(translationKey, { ns: 'categories' })}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {/* Purpose */}
                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--color-text-secondary)',
                                marginBottom: 'var(--spacing-xs)',
                            }}
                        >
                            {t('transactions:form.purpose.label')}
                        </label>
                        <input
                            type="text"
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            placeholder={t('transactions:form.purpose.placeholder')}
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-sm)',
                                fontSize: 'var(--font-size-base)',
                                fontFamily: 'var(--font-mono)',
                                backgroundColor: 'var(--color-background)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius)',
                                color: 'var(--color-text-primary)',
                            }}
                        />
                    </div>

                    {/* Notes */}
                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--color-text-secondary)',
                                marginBottom: 'var(--spacing-xs)',
                            }}
                        >
                            {t('transactions:form.notes.label')}
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={t('transactions:form.notes.placeholder')}
                            rows={3}
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-sm)',
                                fontSize: 'var(--font-size-base)',
                                fontFamily: 'var(--font-mono)',
                                backgroundColor: 'var(--color-background)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius)',
                                color: 'var(--color-text-primary)',
                                resize: 'vertical',
                            }}
                        />
                    </div>

                    {error && (
                        <p
                            style={{
                                marginBottom: 'var(--spacing-md)',
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--color-status-latest)',
                            }}
                        >
                            {error}
                        </p>
                    )}

                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isLoading}
                            style={{
                                padding: 'var(--spacing-sm) var(--spacing-lg)',
                                fontSize: 'var(--font-size-base)',
                                fontFamily: 'var(--font-mono)',
                                backgroundColor: 'transparent',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius)',
                                color: 'var(--color-text-primary)',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {t('common:actions.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                padding: 'var(--spacing-sm) var(--spacing-lg)',
                                fontSize: 'var(--font-size-base)',
                                fontFamily: 'var(--font-mono)',
                                backgroundColor: 'var(--color-text-primary)',
                                border: 'none',
                                borderRadius: 'var(--radius)',
                                color: 'var(--color-text-inverse)',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.6 : 1,
                            }}
                        >
                            {isLoading ? t('common:states.loading') : t('common:actions.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
