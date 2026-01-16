import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PoolType } from '@/domain/entities/CashPool';
import { INDIAN_BANKS } from '../constants/banks';

interface CreatePoolModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        type: PoolType;
        initialBalance: number;
        icon?: string;
        color?: string;
        bankId?: string;
        accountIdentifier?: string;
    }) => void;
    isLoading?: boolean;
}

/**
 * Create Cash Pool Modal
 * Form for creating a new cash pool with conditional bank-specific fields
 * Mobile-responsive with full-screen adaptation on small screens
 */
export function CreatePoolModal({ isOpen, onClose, onSubmit, isLoading }: CreatePoolModalProps) {
    const { t } = useTranslation(['pools', 'common', 'validation', 'banks']);
    const [name, setName] = useState('');
    const [type, setType] = useState<PoolType>('bank');
    const [initialBalance, setInitialBalance] = useState('0');
    const [bankId, setBankId] = useState('');
    const [accountIdentifier, setAccountIdentifier] = useState('');
    const [error, setError] = useState('');

    const isBankAccount = type === 'bank';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (name.trim().length < 2) {
            setError(t('validation:poolNameTooShort'));
            return;
        }

        const balance = parseFloat(initialBalance);
        if (isNaN(balance) || balance < 0) {
            setError(t('validation:invalidAmount'));
            return;
        }

        // Bank-specific validation
        if (isBankAccount) {
            if (!bankId) {
                setError(t('banks:bankSelector.label') + ' is required');
                return;
            }

            if (!accountIdentifier) {
                setError(t('banks:accountIdentifier.validation.required'));
                return;
            }

            if (accountIdentifier.length !== 4) {
                setError(t('banks:accountIdentifier.validation.exactLength'));
                return;
            }

            if (!/^\d{4}$/.test(accountIdentifier)) {
                setError(t('banks:accountIdentifier.validation.numericOnly'));
                return;
            }
        }

        onSubmit({
            name: name.trim(),
            type,
            initialBalance: balance,
            ...(isBankAccount && {
                bankId,
                accountIdentifier,
            }),
        });
    };

    const handleReset = () => {
        setName('');
        setType('bank');
        setInitialBalance('0');
        setBankId('');
        setAccountIdentifier('');
        setError('');
    };

    const handleClose = () => {
        handleReset();
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
                    {t('pools:actions.create')}
                </h2>

                <form onSubmit={handleSubmit}>
                    {/* Pool Name */}
                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--color-text-secondary)',
                                marginBottom: 'var(--spacing-xs)',
                            }}
                        >
                            {t('pools:form.name.label')}
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('pools:form.name.placeholder')}
                            className="w-full"
                            style={{
                                padding: 'var(--spacing-sm)',
                                fontSize: 'var(--font-size-base)',
                                fontFamily: 'var(--font-mono)',
                                backgroundColor: 'var(--color-background)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius)',
                                color: 'var(--color-text-primary)',
                                minHeight: '44px', // Touch-friendly
                            }}
                        />
                    </div>

                    {/* Pool Type */}
                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--color-text-secondary)',
                                marginBottom: 'var(--spacing-xs)',
                            }}
                        >
                            {t('pools:form.type.label')}
                        </label>
                        <select
                            value={type}
                            onChange={(e) => {
                                setType(e.target.value as PoolType);
                                // Reset bank-specific fields when type changes
                                setBankId('');
                                setAccountIdentifier('');
                            }}
                            className="w-full"
                            style={{
                                padding: 'var(--spacing-sm)',
                                fontSize: 'var(--font-size-base)',
                                fontFamily: 'var(--font-mono)',
                                backgroundColor: 'var(--color-background)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius)',
                                color: 'var(--color-text-primary)',
                                minHeight: '44px', // Touch-friendly
                            }}
                        >
                            <option value="bank">{t('pools:types.bank')}</option>
                            <option value="cash">{t('pools:types.cash')}</option>
                            <option value="digital">{t('pools:types.digital')}</option>
                        </select>
                    </div>

                    {/* Conditional Bank-Specific Fields */}
                    {isBankAccount && (
                        <>
                            {/* Bank Selector */}
                            <div
                                style={{
                                    marginBottom: 'var(--spacing-md)',
                                    animation: 'fadeIn 0.2s ease-in',
                                }}
                            >
                                <label
                                    style={{
                                        display: 'block',
                                        fontSize: 'var(--font-size-sm)',
                                        color: 'var(--color-text-secondary)',
                                        marginBottom: 'var(--spacing-xs)',
                                    }}
                                >
                                    {t('banks:bankSelector.label')}
                                </label>
                                <select
                                    value={bankId}
                                    onChange={(e) => setBankId(e.target.value)}
                                    className="w-full"
                                    style={{
                                        padding: 'var(--spacing-sm)',
                                        fontSize: 'var(--font-size-base)',
                                        fontFamily: 'var(--font-mono)',
                                        backgroundColor: 'var(--color-background)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius)',
                                        color: 'var(--color-text-primary)',
                                        minHeight: '44px', // Touch-friendly
                                    }}
                                >
                                    <option value="">{t('banks:bankSelector.placeholder')}</option>
                                    {INDIAN_BANKS.map((bank) => (
                                        <option key={bank.id} value={bank.id}>
                                            {bank.logo} {t(bank.name)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Account Identifier */}
                            <div
                                style={{
                                    marginBottom: 'var(--spacing-md)',
                                    animation: 'fadeIn 0.2s ease-in',
                                }}
                            >
                                <label
                                    style={{
                                        display: 'block',
                                        fontSize: 'var(--font-size-sm)',
                                        color: 'var(--color-text-secondary)',
                                        marginBottom: 'var(--spacing-xs)',
                                    }}
                                >
                                    {t('banks:accountIdentifier.label')}
                                </label>
                                <input
                                    type="text"
                                    value={accountIdentifier}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                        setAccountIdentifier(value);
                                    }}
                                    placeholder={t('banks:accountIdentifier.placeholder')}
                                    maxLength={4}
                                    pattern="\d{4}"
                                    className="w-full"
                                    style={{
                                        padding: 'var(--spacing-sm)',
                                        fontSize: 'var(--font-size-base)',
                                        fontFamily: 'var(--font-mono)',
                                        backgroundColor: 'var(--color-background)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius)',
                                        color: 'var(--color-text-primary)',
                                        minHeight: '44px', // Touch-friendly
                                    }}
                                />
                                <p
                                    style={{
                                        marginTop: 'var(--spacing-xs)',
                                        fontSize: 'var(--font-size-xs)',
                                        color: 'var(--color-text-muted)',
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {t('banks:accountIdentifier.helper')}
                                </p>
                            </div>
                        </>
                    )}

                    {/* Initial Balance */}
                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--color-text-secondary)',
                                marginBottom: 'var(--spacing-xs)',
                            }}
                        >
                            {t('pools:form.initialBalance.label')}
                        </label>
                        <input
                            type="number"
                            value={initialBalance}
                            onChange={(e) => setInitialBalance(e.target.value)}
                            placeholder={t('pools:form.initialBalance.placeholder')}
                            step="0.01"
                            min="0"
                            className="w-full"
                            style={{
                                padding: 'var(--spacing-sm)',
                                fontSize: 'var(--font-size-base)',
                                fontFamily: 'var(--font-mono)',
                                backgroundColor: 'var(--color-background)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius)',
                                color: 'var(--color-text-primary)',
                                minHeight: '44px', // Touch-friendly
                            }}
                        />
                    </div>

                    {/* Error Message */}
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

                    {/* Action Buttons */}
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
                                fontFamily: 'var(--font-mono)',
                                backgroundColor: 'transparent',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius)',
                                color: 'var(--color-text-primary)',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                minHeight: '44px', // Touch-friendly
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
                                fontFamily: 'var(--font-mono)',
                                backgroundColor: 'var(--color-text-primary)',
                                border: 'none',
                                borderRadius: 'var(--radius)',
                                color: 'var(--color-text-inverse)',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.6 : 1,
                                minHeight: '44px', // Touch-friendly
                            }}
                        >
                            {isLoading ? t('common:states.loading') : t('common:actions.save')}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
}
