import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Login Page
 * Google Sign-In only
 */
export default function Login() {
    const { t } = useTranslation(['auth', 'common']);
    const { signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        try {
            await signInWithGoogle();
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || t('auth:errors.failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: 'var(--color-background)',
                fontFamily: 'var(--font-sans)',
            }}
        >
            <div
                style={{
                    backgroundColor: 'var(--color-background-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius)',
                    padding: 'var(--spacing-2xl)',
                    width: '100%',
                    maxWidth: '400px',
                }}
            >
                <h1
                    style={{
                        fontSize: 'var(--font-size-xl)',
                        fontWeight: 600,
                        marginBottom: 'var(--spacing-sm)',
                        color: 'var(--color-text-primary)',
                    }}
                >
                    {t('auth:title')}
                </h1>
                <p
                    style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-secondary)',
                        marginBottom: 'var(--spacing-xl)',
                    }}
                >
                    {t('auth:subtitle')}
                </p>

                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: 'var(--spacing-md)',
                        backgroundColor: 'var(--color-text-primary)',
                        color: 'var(--color-text-inverse)',
                        border: 'none',
                        borderRadius: 'var(--radius)',
                        fontSize: 'var(--font-size-base)',
                        fontFamily: 'var(--font-sans)',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                    }}
                >
                    {loading ? t('auth:google.loading') : t('auth:google.button')}
                </button>

                {error && (
                    <p
                        style={{
                            marginTop: 'var(--spacing-md)',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-status-expense)',
                        }}
                    >
                        {error}
                    </p>
                )}
            </div>

            <p
                style={{
                    marginTop: 'var(--spacing-xl)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-muted)',
                }}
            >
                {t('common:app.tagline')}
            </p>
        </div>
    );
}
