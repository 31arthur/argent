import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { ArgentLogo } from '../components/ArgentLogo';
import { LogOut, ChevronDown } from 'lucide-react';

/**
 * Landing Page
 * Full-screen sections with modern scroll behavior
 * Shows user avatar when logged in
 */
export default function Landing() {
    const { t } = useTranslation(['landing', 'common']);
    const { user, signInWithGoogle, signOut } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);

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

    const handleGoToDashboard = () => {
        navigate('/dashboard');
    };

    const handleLogout = async () => {
        try {
            await signOut();
            setShowUserMenu(false);
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    return (
        <div
            style={{
                scrollSnapType: 'y mandatory',
                overflowY: 'scroll',
                height: '100vh',
                backgroundColor: 'var(--color-background)',
                fontFamily: 'var(--font-sans)',
            }}
        >
            {/* User Avatar (Top Right) - Only when logged in */}
            {user && (
                <div
                    style={{
                        position: 'fixed',
                        top: 'var(--spacing-lg)',
                        right: 'var(--spacing-lg)',
                        zIndex: 1000,
                    }}
                >
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            border: '2px solid var(--color-border)',
                            backgroundColor: 'var(--color-surface)',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            padding: 0,
                            boxShadow: 'var(--shadow-md)',
                        }}
                    >
                        {user.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt={user.displayName || 'User'}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'var(--color-primary-500)',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: 'var(--font-size-lg)',
                                }}
                            >
                                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                            </div>
                        )}
                    </button>

                    {/* User Dropdown Menu */}
                    {showUserMenu && (
                        <>
                            <div
                                style={{
                                    position: 'fixed',
                                    inset: 0,
                                    zIndex: 999,
                                }}
                                onClick={() => setShowUserMenu(false)}
                            />
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '56px',
                                    right: 0,
                                    width: '240px',
                                    backgroundColor: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius)',
                                    boxShadow: 'var(--shadow-lg)',
                                    padding: 'var(--spacing-sm)',
                                    zIndex: 1000,
                                }}
                            >
                                <div style={{ padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--color-border)' }}>
                                    <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                                        {user.displayName || 'User'}
                                    </p>
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                                        {user.email}
                                    </p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        width: '100%',
                                        padding: 'var(--spacing-sm)',
                                        marginTop: 'var(--spacing-xs)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--spacing-sm)',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--color-status-expense)',
                                        fontSize: 'var(--font-size-base)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-background-accent)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <LogOut size={16} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Hero Section - Full Screen */}
            <section
                style={{
                    minHeight: '100vh',
                    scrollSnapAlign: 'start',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--spacing-2xl)',
                    textAlign: 'center',
                    position: 'relative',
                    background: 'linear-gradient(135deg, var(--color-background) 0%, var(--color-background-secondary) 100%)',
                }}
            >
                {/* Logo */}
                <ArgentLogo size={80} />

                {/* Title */}
                <h1
                    style={{
                        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                        fontWeight: 700,
                        lineHeight: 1.1,
                        marginTop: 'var(--spacing-xl)',
                        marginBottom: 'var(--spacing-lg)',
                        color: 'var(--color-text-primary)',
                        letterSpacing: '-0.03em',
                        maxWidth: '900px',
                    }}
                >
                    {t('landing:hero.title')}
                </h1>

                {/* Subtitle */}
                <p
                    style={{
                        fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                        lineHeight: 1.6,
                        marginBottom: 'var(--spacing-2xl)',
                        color: 'var(--color-text-secondary)',
                        maxWidth: '700px',
                    }}
                >
                    {t('landing:hero.subtitle')}
                </p>

                {/* CTA Button - Conditional */}
                {user ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                            Welcome back, <strong>{user.displayName || user.email?.split('@')[0]}</strong>!
                        </p>
                        <button
                            onClick={handleGoToDashboard}
                            style={{
                                padding: 'var(--spacing-md) var(--spacing-3xl)',
                                fontSize: 'var(--font-size-lg)',
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 600,
                                backgroundColor: 'var(--color-text-primary)',
                                color: 'var(--color-text-inverse)',
                                border: 'none',
                                borderRadius: 'var(--radius-lg)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: 'var(--shadow-lg)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                            }}
                        >
                            Go to Dashboard →
                        </button>
                    </div>
                ) : (
                    <>
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            style={{
                                padding: 'var(--spacing-md) var(--spacing-3xl)',
                                fontSize: 'var(--font-size-lg)',
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 600,
                                backgroundColor: 'var(--color-text-primary)',
                                color: 'var(--color-text-inverse)',
                                border: 'none',
                                borderRadius: 'var(--radius-lg)',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.6 : 1,
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: 'var(--shadow-lg)',
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                            }}
                        >
                            {loading ? t('common:states.loading') : t('landing:hero.cta')}
                        </button>

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
                    </>
                )}

                {/* Scroll Indicator */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 'var(--spacing-2xl)',
                        animation: 'bounce 2s infinite',
                    }}
                >
                    <ChevronDown size={32} color="var(--color-text-muted)" />
                </div>
            </section>

            {/* Benefits Section - Full Screen */}
            <section
                style={{
                    minHeight: '100vh',
                    scrollSnapAlign: 'start',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--spacing-3xl) var(--spacing-2xl)',
                    backgroundColor: 'var(--color-background)',
                }}
            >
                <div style={{ maxWidth: '1200px', width: '100%' }}>
                    <h2
                        style={{
                            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                            fontWeight: 700,
                            marginBottom: 'var(--spacing-3xl)',
                            color: 'var(--color-text-primary)',
                            textAlign: 'center',
                        }}
                    >
                        {t('landing:benefits.title')}
                    </h2>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: 'var(--spacing-xl)',
                        }}
                    >
                        {['trackBySource', 'separateExpenses', 'monthlyClarity', 'effortlessTracking'].map((key) => (
                            <div
                                key={key}
                                style={{
                                    padding: 'var(--spacing-xl)',
                                    backgroundColor: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-lg)',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    boxShadow: 'var(--shadow)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow)';
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: 'var(--font-size-lg)',
                                        lineHeight: 1.7,
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

            {/* Privacy Section - Full Screen */}
            <section
                style={{
                    minHeight: '100vh',
                    scrollSnapAlign: 'start',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--spacing-3xl) var(--spacing-2xl)',
                    backgroundColor: 'var(--color-background-secondary)',
                }}
            >
                <div style={{ maxWidth: '800px', textAlign: 'center' }}>
                    <h2
                        style={{
                            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                            fontWeight: 700,
                            marginBottom: 'var(--spacing-2xl)',
                            color: 'var(--color-text-primary)',
                        }}
                    >
                        {t('landing:privacy.title')}
                    </h2>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--spacing-lg)',
                        }}
                    >
                        {['noAds', 'userControl', 'googleAuth'].map((key) => (
                            <p
                                key={key}
                                style={{
                                    fontSize: 'var(--font-size-lg)',
                                    lineHeight: 1.7,
                                    color: 'var(--color-text-secondary)',
                                }}
                            >
                                {t(`landing:privacy.${key}`)}
                            </p>
                        ))}
                    </div>
                </div>
            </section>

            {/* Closing CTA - Full Screen */}
            <section
                style={{
                    minHeight: '100vh',
                    scrollSnapAlign: 'start',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--spacing-3xl) var(--spacing-2xl)',
                    backgroundColor: 'var(--color-background)',
                    textAlign: 'center',
                }}
            >
                <h2
                    style={{
                        fontSize: 'clamp(2rem, 5vw, 3rem)',
                        fontWeight: 700,
                        marginBottom: 'var(--spacing-2xl)',
                        color: 'var(--color-text-primary)',
                        maxWidth: '800px',
                    }}
                >
                    {t('landing:closing.message')}
                </h2>

                {user ? (
                    <button
                        onClick={handleGoToDashboard}
                        style={{
                            padding: 'var(--spacing-md) var(--spacing-3xl)',
                            fontSize: 'var(--font-size-lg)',
                            fontFamily: 'var(--font-sans)',
                            fontWeight: 600,
                            backgroundColor: 'var(--color-text-primary)',
                            color: 'var(--color-text-inverse)',
                            border: 'none',
                            borderRadius: 'var(--radius-lg)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            boxShadow: 'var(--shadow-lg)',
                        }}
                    >
                        Go to Dashboard →
                    </button>
                ) : (
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        style={{
                            padding: 'var(--spacing-md) var(--spacing-3xl)',
                            fontSize: 'var(--font-size-lg)',
                            fontFamily: 'var(--font-sans)',
                            fontWeight: 600,
                            backgroundColor: 'var(--color-text-primary)',
                            color: 'var(--color-text-inverse)',
                            border: 'none',
                            borderRadius: 'var(--radius-lg)',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1,
                            transition: 'transform 0.2s',
                            boxShadow: 'var(--shadow-lg)',
                        }}
                    >
                        {loading ? t('common:states.loading') : t('landing:closing.cta')}
                    </button>
                )}

                <p
                    style={{
                        marginTop: 'var(--spacing-lg)',
                        fontSize: 'var(--font-size-base)',
                        color: 'var(--color-text-muted)',
                        maxWidth: '600px',
                    }}
                >
                    {t('landing:closing.footnote')}
                </p>

                {/* Footer */}
                <footer
                    style={{
                        marginTop: 'var(--spacing-3xl)',
                        paddingTop: 'var(--spacing-xl)',
                        borderTop: '1px solid var(--color-border)',
                    }}
                >
                    <p
                        style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-muted)',
                        }}
                    >
                        A₹GENT • {t('common:app.tagline')}
                    </p>
                </footer>
            </section>

            {/* Bounce Animation */}
            <style>{`
                @keyframes bounce {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
            `}</style>
        </div>
    );
}
