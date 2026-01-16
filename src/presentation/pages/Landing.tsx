import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { ArgentLogo } from '../components/ArgentLogo';

/**
 * Landing Page
 * Minimal, privacy-first introduction to Argent with Google Sign-In
 */
export default function Landing() {
    const { t } = useTranslation(['landing', 'common']);
    const { user, signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Redirect if already authenticated
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        try {
            await signInWithGoogle();
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Sign in failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: 'var(--color-background)',
                fontFamily: 'var(--font-sans)',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Hero Section */}
            <section
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--spacing-2xl)',
                    textAlign: 'center',
                    maxWidth: '800px',
                    margin: '0 auto',
                }}
            >
                {/* Logo */}
                <ArgentLogo size={64} />

                {/* Title */}
                <h1
                    style={{
                        fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                        fontWeight: 600,
                        lineHeight: 1.2,
                        marginBottom: 'var(--spacing-md)',
                        color: 'var(--color-text-primary)',
                        letterSpacing: '-0.02em',
                    }}
                >
                    {t('landing:hero.title')}
                </h1>

                {/* Subtitle */}
                <p
                    style={{
                        fontSize: 'var(--font-size-lg)',
                        lineHeight: 1.6,
                        marginBottom: 'var(--spacing-xl)',
                        color: 'var(--color-text-secondary)',
                        maxWidth: '600px',
                    }}
                >
                    {t('landing:hero.subtitle')}
                </p>

                {/* Primary CTA */}
                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    style={{
                        padding: 'var(--spacing-md) var(--spacing-2xl)',
                        fontSize: 'var(--font-size-base)',
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 500,
                        backgroundColor: 'var(--color-text-primary)',
                        color: 'var(--color-text-inverse)',
                        border: 'none',
                        borderRadius: 'var(--radius)',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                        transition: 'all 0.2s',
                    }}
                >
                    {loading ? t('common:states.loading') : t('landing:hero.cta')}
                </button>

                {/* Supporting Text */}
                <p
                    style={{
                        marginTop: 'var(--spacing-md)',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-muted)',
                    }}
                >
                    {t('landing:hero.supporting')}
                </p>

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
            </section>

            {/* Benefits Section */}
            <section
                style={{
                    padding: 'var(--spacing-2xl)',
                    backgroundColor: 'var(--color-background-secondary)',
                    borderTop: '1px solid var(--color-border)',
                }}
            >
                <div
                    style={{
                        maxWidth: '1000px',
                        margin: '0 auto',
                    }}
                >
                    <h2
                        style={{
                            fontSize: 'var(--font-size-lg)',
                            fontWeight: 600,
                            marginBottom: 'var(--spacing-xl)',
                            color: 'var(--color-text-primary)',
                            textAlign: 'center',
                        }}
                    >
                        {t('landing:benefits.title')}
                    </h2>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                            gap: 'var(--spacing-lg)',
                        }}
                    >
                        {[
                            'trackBySource',
                            'separateExpenses',
                            'monthlyClarity',
                            'effortlessTracking',
                        ].map((key) => (
                            <div
                                key={key}
                                style={{
                                    padding: 'var(--spacing-lg)',
                                    backgroundColor: 'var(--color-background)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius)',
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: 'var(--font-size-base)',
                                        lineHeight: 1.6,
                                        color: 'var(--color-text-secondary)',
                                    }}
                                >
                                    {t(`landing:benefits.${key}`)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Privacy Section */}
            <section
                style={{
                    padding: 'var(--spacing-2xl)',
                    borderTop: '1px solid var(--color-border)',
                }}
            >
                <div
                    style={{
                        maxWidth: '700px',
                        margin: '0 auto',
                        textAlign: 'center',
                    }}
                >
                    <h2
                        style={{
                            fontSize: 'var(--font-size-lg)',
                            fontWeight: 600,
                            marginBottom: 'var(--spacing-lg)',
                            color: 'var(--color-text-primary)',
                        }}
                    >
                        {t('landing:privacy.title')}
                    </h2>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--spacing-md)',
                        }}
                    >
                        {['noAds', 'userControl', 'googleAuth'].map((key) => (
                            <p
                                key={key}
                                style={{
                                    fontSize: 'var(--font-size-base)',
                                    lineHeight: 1.6,
                                    color: 'var(--color-text-secondary)',
                                }}
                            >
                                {t(`landing:privacy.${key}`)}
                            </p>
                        ))}
                    </div>
                </div>
            </section>

            {/* Closing CTA */}
            <section
                style={{
                    padding: 'var(--spacing-2xl)',
                    backgroundColor: 'var(--color-background-secondary)',
                    borderTop: '1px solid var(--color-border)',
                }}
            >
                <div
                    style={{
                        maxWidth: '600px',
                        margin: '0 auto',
                        textAlign: 'center',
                    }}
                >
                    <h2
                        style={{
                            fontSize: 'var(--font-size-xl)',
                            fontWeight: 600,
                            marginBottom: 'var(--spacing-lg)',
                            color: 'var(--color-text-primary)',
                        }}
                    >
                        {t('landing:closing.message')}
                    </h2>

                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        style={{
                            padding: 'var(--spacing-md) var(--spacing-2xl)',
                            fontSize: 'var(--font-size-base)',
                            fontFamily: 'var(--font-sans)',
                            fontWeight: 500,
                            backgroundColor: 'var(--color-text-primary)',
                            color: 'var(--color-text-inverse)',
                            border: 'none',
                            borderRadius: 'var(--radius)',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1,
                            transition: 'all 0.2s',
                        }}
                    >
                        {loading ? t('common:states.loading') : t('landing:closing.cta')}
                    </button>

                    <p
                        style={{
                            marginTop: 'var(--spacing-md)',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-muted)',
                        }}
                    >
                        {t('landing:closing.footnote')}
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer
                style={{
                    padding: 'var(--spacing-lg)',
                    textAlign: 'center',
                    borderTop: '1px solid var(--color-border)',
                }}
            >
                <p
                    style={{
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-text-muted)',
                    }}
                >
                    {t('common:app.name')} • {t('common:app.tagline')}
                </p>
            </footer>
        </div>
    );
}
