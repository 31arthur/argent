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
 * Modern, responsive form for creating Income or Expense transactions
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

    // Form state
    const [type, setType] = useState<TransactionType>('EXPENSE');
    const [amount, setAmount] = useState('');
    const [poolId, setPoolId] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [purpose, setPurpose] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    // Adaptive pool label based on transaction type
    const poolLabel = type === 'EXPENSE'
        ? t('transactions:form.pool.labelExpense')
        : t('transactions:form.pool.labelIncome');

    // Filter categories by type
    const filteredCategories = categories.filter((c) => c.type === type);

    const handleTypeChange = (newType: TransactionType) => {
        setType(newType);
        setCategoryId(''); // Reset category when type changes
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!poolId) {
            setError(t('validation:required'));
            return;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            setError(t('validation:amountPositive'));
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
        setType('EXPENSE');
        setAmount('');
        setPoolId('');
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
            className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center p-4"
            onClick={handleClose}
        >
            <div
                className="bg-[var(--color-background-secondary)] border border-[var(--color-border)] rounded-[var(--radius)] w-full max-w-[500px] max-h-[90vh] overflow-y-auto"
                style={{
                    padding: 'var(--spacing-xl)',
                    fontFamily: 'var(--font-sans)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2
                    style={{
                        fontSize: 'var(--font-size-xl)',
                        fontWeight: 600,
                        marginBottom: 'var(--spacing-lg)',
                        color: 'var(--color-text-primary)',
                    }}
                >
                    {t('transactions:actions.add')}
                </h2>

                <form onSubmit={handleSubmit}>
                    {/* 1. Transaction Type */}
                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 500,
                                color: 'var(--color-text-secondary)',
                                marginBottom: 'var(--spacing-xs)',
                            }}
                        >
                            {t('transactions:form.type.label')}
                        </label>

                        <div
                            style={{
                                display: 'flex',
                                gap: 'var(--spacing-xs)',
                                padding: '4px',
                                backgroundColor: 'var(--color-background)',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--color-border)',
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => handleTypeChange('EXPENSE')}
                                style={{
                                    flex: 1,
                                    padding: 'var(--spacing-sm) var(--spacing-md)',
                                    fontSize: 'var(--font-size-base)',
                                    fontWeight: 500,
                                    fontFamily: 'var(--font-sans)',
                                    backgroundColor: type === 'EXPENSE'
                                        ? 'var(--color-text-primary)'
                                        : 'transparent',
                                    color: type === 'EXPENSE'
                                        ? 'var(--color-text-inverse)'
                                        : 'var(--color-text-primary)',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    minHeight: '40px',
                                }}
                            >
                                {t('transactions:types.expense')}
                            </button>

                            <button
                                type="button"
                                onClick={() => handleTypeChange('INCOME')}
                                style={{
                                    flex: 1,
                                    padding: 'var(--spacing-sm) var(--spacing-md)',
                                    fontSize: 'var(--font-size-base)',
                                    fontWeight: 500,
                                    fontFamily: 'var(--font-sans)',
                                    backgroundColor: type === 'INCOME'
                                        ? 'var(--color-text-primary)'
                                        : 'transparent',
                                    color: type === 'INCOME'
                                        ? 'var(--color-text-inverse)'
                                        : 'var(--color-text-primary)',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    minHeight: '40px',
                                }}
                            >
                                {t('transactions:types.income')}
                            </button>
                        </div>

                        <p
                            style={{
                                fontSize: 'var(--font-size-xs)',
                                color: 'var(--color-text-muted)',
                                marginTop: 'var(--spacing-xs)',
                            }}
                        >
                            {t('transactions:form.type.helper')}
                        </p>
                    </div>

                    {/* 2. Amount */}
                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 500,
                                color: 'var(--color-text-secondary)',
                                marginBottom: 'var(--spacing-xs)',
                            }}
                        >
                            {t('transactions:form.amount.label')}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <span
                                style={{
                                    position: 'absolute',
                                    left: 'var(--spacing-sm)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    fontSize: 'var(--font-size-base)',
                                    color: 'var(--color-text-muted)',
                                }}
                            >
                                ₹
                            </span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder={t('transactions:form.amount.placeholder')}
                                step="0.01"
                                min="0"
                                className="w-full"
                                style={{
                                    padding: 'var(--spacing-sm)',
                                    paddingLeft: 'calc(var(--spacing-sm) + 20px)',
                                    fontSize: 'var(--font-size-base)',
                                    fontFamily: 'var(--font-sans)',
                                    backgroundColor: 'var(--color-background)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius)',
                                    color: 'var(--color-text-primary)',
                                    minHeight: '44px',
                                }}
                            />
                        </div>
                        <p
                            style={{
                                fontSize: 'var(--font-size-xs)',
                                color: 'var(--color-text-muted)',
                                marginTop: 'var(--spacing-xs)',
                            }}
                        >
                            {t('transactions:form.amount.helper')}
                        </p>
                    </div>

                    {/* 3. Cash Pool */}
                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 500,
                                color: 'var(--color-text-secondary)',
                                marginBottom: 'var(--spacing-xs)',
                            }}
                        >
                            {poolLabel}
                        </label>
                        <select
                            value={poolId}
                            onChange={(e) => setPoolId(e.target.value)}
                            className="w-full"
                            style={{
                                padding: 'var(--spacing-sm)',
                                fontSize: 'var(--font-size-base)',
                                fontFamily: 'var(--font-sans)',
                                backgroundColor: 'var(--color-background)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius)',
                                color: 'var(--color-text-primary)',
                                minHeight: '44px',
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

                    {/* 4. Category */}
                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 500,
                                color: 'var(--color-text-secondary)',
                                marginBottom: 'var(--spacing-xs)',
                            }}
                        >
                            {t('transactions:form.category.label')}
                        </label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full"
                            style={{
                                padding: 'var(--spacing-sm)',
                                fontSize: 'var(--font-size-base)',
                                fontFamily: 'var(--font-sans)',
                                backgroundColor: 'var(--color-background)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius)',
                                color: 'var(--color-text-primary)',
                                minHeight: '44px',
                            }}
                        >
                            <option value="">{t('transactions:form.category.placeholder')}</option>
                            {filteredCategories.map((cat) => {
                                const translationKey = cat.name.replace('categories.', '');
                                return (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.icon} {t(translationKey, { ns: 'categories' })}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {/* 5. Purpose */}
                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 500,
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
                            className="w-full"
                            style={{
                                padding: 'var(--spacing-sm)',
                                fontSize: 'var(--font-size-base)',
                                fontFamily: 'var(--font-sans)',
                                backgroundColor: 'var(--color-background)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius)',
                                color: 'var(--color-text-primary)',
                                minHeight: '44px',
                            }}
                        />
                    </div>

                    {/* 6. Notes */}
                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 500,
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
                            className="w-full"
                            style={{
                                padding: 'var(--spacing-sm)',
                                fontSize: 'var(--font-size-base)',
                                fontFamily: 'var(--font-sans)',
                                backgroundColor: 'var(--color-background)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius)',
                                color: 'var(--color-text-primary)',
                                resize: 'vertical',
                                minHeight: '80px',
                            }}
                        />
                    </div>

                    {error && (
                        <p
                            style={{
                                marginBottom: 'var(--spacing-md)',
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--color-status-expense)',
                            }}
                        >
                            {error}
                        </p>
                    )}

                    <div
                        className="flex gap-[var(--spacing-sm)] justify-end flex-col sm:flex-row"
                        style={{ gap: 'var(--spacing-sm)' }}
                    >
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="w-full sm:w-auto"
                            style={{
                                padding: 'var(--spacing-sm) var(--spacing-lg)',
                                fontSize: 'var(--font-size-base)',
                                fontWeight: 500,
                                fontFamily: 'var(--font-sans)',
                                backgroundColor: 'transparent',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius)',
                                color: 'var(--color-text-primary)',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                minHeight: '44px',
                            }}
                        >
                            {t('common:actions.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full sm:w-auto"
                            style={{
                                padding: 'var(--spacing-sm) var(--spacing-lg)',
                                fontSize: 'var(--font-size-base)',
                                fontWeight: 500,
                                fontFamily: 'var(--font-sans)',
                                backgroundColor: 'var(--color-text-primary)',
                                border: 'none',
                                borderRadius: 'var(--radius)',
                                color: 'var(--color-text-inverse)',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.6 : 1,
                                minHeight: '44px',
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
