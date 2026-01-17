import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { ChatWidget } from '../components/ChatWidget';

/**
 * App Layout Component
 * Main layout wrapper for authenticated routes
 * Uses React Router's Outlet to render child routes
 */
export function AppLayout() {
    return (
        <div
            className="min-h-screen transition-colors duration-200"
            style={{
                backgroundColor: 'var(--color-background)',
            }}
        >
            <Sidebar />
            <main
                style={{
                    marginLeft: 'var(--width-sidebar)',
                    padding: 'var(--spacing-lg)',
                    minHeight: '100vh',
                    width: 'calc(100% - var(--width-sidebar))',
                }}
            >
                <Outlet />
            </main>
            <ChatWidget />
        </div>
    );
}
