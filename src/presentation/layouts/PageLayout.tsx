import React from 'react';
import { Sidebar } from '../components/Sidebar';

interface PageLayoutProps {
    children: React.ReactNode;
}

/**
 * Page Layout
 * Main layout wrapper with sidebar and mobile-responsive spacing
 */
export function PageLayout({ children }: PageLayoutProps) {
    return (
        <div
            className="min-h-screen transition-colors duration-200"
            style={{
                backgroundColor: 'var(--color-background)',
            }}
        >
            <Sidebar />
            <main
                className="transition-all duration-300 ease-in-out md:ml-[280px] p-4 md:p-8 pt-20 md:pt-8"
            >
                {children}
            </main>
        </div>
    );
}
