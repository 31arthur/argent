import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArgentLoader } from './ArgentLoader';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * Protected Route Component
 * Redirects to landing page if user is not authenticated
 * Shows loader while checking authentication state
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, loading } = useAuth();

    // Show loader while checking auth state
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh'
            }}>
                <ArgentLoader size={120} />
            </div>
        );
    }

    // Redirect to landing if not authenticated
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // Render protected content
    return <>{children}</>;
}
