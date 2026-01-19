import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
    LayoutGrid,
    Wallet,
    Receipt,
    Moon,
    Sun,
    Menu,
    X,
    LogOut,
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useUIStore } from '../state/uiStore';
import { useAuth } from '../contexts/AuthContext';
import { ArgentLogo } from './ArgentLogo';

interface SidebarProps {
    className?: string;
}

/**
 * Sidebar Component
 * Left navigation with icon buttons, theme toggle, and mobile support
 * Enhanced with comfortable spacing and mobile responsiveness
 */
export function Sidebar({ className }: SidebarProps) {
    const { t } = useTranslation(['common']);
    const { theme, toggleTheme } = useUIStore();
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const navItems = [
        { icon: LayoutGrid, label: t('common:app.name'), href: '/dashboard', title: 'Dashboard' },
        { icon: Wallet, label: 'Cash Pools', href: '/pools', title: 'Cash Pools' },
        { icon: Receipt, label: 'Transactions', href: '/transactions', title: 'Transactions' },
        { icon: Receipt, label: 'Budgets', href: '/budgets', title: 'Budgets' },
        { icon: Receipt, label: 'Leads', href: '/leads', title: 'Leads' },
        { icon: Receipt, label: 'Loans', href: '/loans', title: 'Loans' },
        { icon: Receipt, label: 'Persons', href: '/persons', title: 'Persons' },
    ];

    const isActive = (href: string) => location.pathname === href;

    const handleNavigation = (href: string) => {
        navigate(href);
        setIsMobileOpen(false); // Close mobile menu after navigation
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="fixed top-4 left-4 z-50 md:hidden"
                style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    border: 'none',
                    boxShadow: 'var(--shadow-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                }}
                aria-label="Toggle menu"
            >
                {isMobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>

            {/* Overlay for mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 h-screen flex flex-col z-50 transition-all duration-300',
                    className,
                    // Mobile: slide in from left
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                )}
                style={{
                    width: 'var(--width-sidebar)',
                    backgroundColor: 'var(--color-background-sidebar)',
                    borderRight: 'none', /* Removed border for cleaner, modern look */
                    padding: 'var(--spacing-lg)',
                    boxShadow: theme === 'light' ? '1px 0 0 rgba(0,0,0,0.02)' : '1px 0 0 rgba(255,255,255,0.05)',
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        marginBottom: 'var(--spacing-2xl)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)',
                        paddingLeft: 'var(--spacing-sm)',
                    }}
                >
                    <ArgentLogo size={24} />
                    <span style={{
                        fontWeight: 700,
                        fontSize: 'var(--font-size-lg)',
                        letterSpacing: '-0.02em',
                        color: 'var(--color-text-primary)'
                    }}>
                        A₹GENT
                    </span>
                </div>

                {/* Navigation */}
                <nav
                    className="flex-1 flex flex-col"
                    style={{
                        gap: 'var(--spacing-sm)',
                        width: '100%',
                    }}
                >
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <button
                                key={item.href}
                                onClick={() => handleNavigation(item.href)}
                                aria-label={item.title}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-md)',
                                    padding: 'var(--spacing-sm) var(--spacing-md)',
                                    borderRadius: 'var(--radius)',
                                    backgroundColor: active ? 'var(--color-background-accent)' : 'transparent',
                                    color: active ? 'var(--color-text-accent)' : 'var(--color-text-secondary)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    textAlign: 'left',
                                    fontSize: 'var(--font-size-base)',
                                    fontWeight: active ? 600 : 500,
                                    width: '100%',
                                }}
                            >
                                <item.icon size={20} strokeWidth={active ? 2.5 : 2} style={{ opacity: active ? 1 : 0.8 }} />
                                <span>{item.title}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 px-6 py-4 rounded-2xl w-full mt-auto mb-2 opacity-70 hover:opacity-100 transition-opacity"
                    style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 500,
                    }}
                >
                    {theme === 'light' ? (
                        <>
                            <Moon size={16} />
                            <span>Dark Mode</span>
                        </>
                    ) : (
                        <>
                            <Sun size={16} />
                            <span>Light Mode</span>
                        </>
                    )}
                </button>

                {/* User Profile Section */}
                {user && (
                    <div style={{ position: 'relative', marginTop: 'var(--spacing-sm)' }}>
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)',
                                padding: 'var(--spacing-sm)',
                                borderRadius: 'var(--radius)',
                                backgroundColor: isUserMenuOpen ? 'var(--color-background-accent)' : 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                width: '100%',
                                transition: 'background-color 0.2s',
                            }}
                        >
                            {/* Avatar */}
                            <div
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    border: '2px solid var(--color-border)',
                                    flexShrink: 0,
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
                                            fontSize: 'var(--font-size-sm)',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                                    </div>
                                )}
                            </div>

                            {/* User Info */}
                            <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                                <p
                                    style={{
                                        fontSize: 'var(--font-size-sm)',
                                        fontWeight: 600,
                                        color: 'var(--color-text-primary)',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {user.displayName || user.email?.split('@')[0]}
                                </p>
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {isUserMenuOpen && (
                            <>
                                {/* Overlay */}
                                <div
                                    style={{
                                        position: 'fixed',
                                        inset: 0,
                                        zIndex: 40,
                                    }}
                                    onClick={() => setIsUserMenuOpen(false)}
                                />
                                {/* Menu */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: '100%',
                                        left: 0,
                                        right: 0,
                                        marginBottom: 'var(--spacing-xs)',
                                        backgroundColor: 'var(--color-surface)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius)',
                                        boxShadow: 'var(--shadow-lg)',
                                        padding: 'var(--spacing-xs)',
                                        zIndex: 50,
                                    }}
                                >
                                    {/* User Info Header */}
                                    <div
                                        style={{
                                            padding: 'var(--spacing-sm)',
                                            borderBottom: '1px solid var(--color-border)',
                                            marginBottom: 'var(--spacing-xs)',
                                        }}
                                    >
                                        <p
                                            style={{
                                                fontSize: 'var(--font-size-sm)',
                                                fontWeight: 600,
                                                color: 'var(--color-text-primary)',
                                                marginBottom: '2px',
                                            }}
                                        >
                                            {user.displayName || 'User'}
                                        </p>
                                        <p
                                            style={{
                                                fontSize: 'var(--font-size-xs)',
                                                color: 'var(--color-text-muted)',
                                            }}
                                        >
                                            {user.email}
                                        </p>
                                    </div>

                                    {/* Logout Button */}
                                    <button
                                        onClick={async () => {
                                            try {
                                                await signOut();
                                                setIsUserMenuOpen(false);
                                                navigate('/');
                                            } catch (err) {
                                                console.error('Logout failed:', err);
                                            }
                                        }}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--spacing-sm)',
                                            padding: 'var(--spacing-sm)',
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            borderRadius: 'var(--radius-sm)',
                                            color: 'var(--color-status-expense)',
                                            fontSize: 'var(--font-size-sm)',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'background-color 0.2s',
                                        }}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.backgroundColor = 'var(--color-background-accent)')
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.backgroundColor = 'transparent')
                                        }
                                    >
                                        <LogOut size={16} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </aside>
        </>
    );
}
