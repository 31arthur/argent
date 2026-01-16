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
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useUIStore } from '../state/uiStore';
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
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const navItems = [
        { icon: LayoutGrid, label: t('common:app.name'), href: '/dashboard', title: 'Dashboard' },
        { icon: Wallet, label: 'Cash Pools', href: '/pools', title: 'Cash Pools' },
        { icon: Receipt, label: 'Transactions', href: '/transactions', title: 'Transactions' },
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
                        ACRU
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
            </aside>
        </>
    );
}
