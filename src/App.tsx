import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './presentation/contexts/AuthContext';
import './presentation/i18n'; // Initialize i18n
import './index.css';
import { ArgentLoader } from './presentation/components/ArgentLoader';
import { AppLayout } from './presentation/layouts/AppLayout';

// Lazy load pages
const Landing = React.lazy(() => import('./presentation/pages/Landing'));
const Dashboard = React.lazy(() => import('./presentation/pages/Dashboard'));
const CashPools = React.lazy(() => import('./presentation/pages/CashPools'));
const Transactions = React.lazy(() => import('./presentation/pages/Transactions'));

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

/**
 * Loading Fallback Component
 * Displays Argent loader animation while lazy-loaded components are loading
 */
function LoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
      }}
    >
      <ArgentLoader size={120} />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/pools" element={<CashPools />} />
                <Route path="/transactions" element={<Transactions />} />
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
