import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
    theme: 'light' | 'dark';
    sidebarCollapsed: boolean;
    catalogView: 'list' | 'raster';
    toggleTheme: () => void;
    toggleSidebar: () => void;
    setCatalogView: (view: 'list' | 'raster') => void;
}

/**
 * Zustand Store for UI State
 * Manages global UI state like theme, sidebar, and view modes
 * Persists theme preference to localStorage
 */
export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            theme: 'light', // Default to light theme
            sidebarCollapsed: false,
            catalogView: 'raster',
            toggleTheme: () =>
                set((state) => {
                    const newTheme = state.theme === 'light' ? 'dark' : 'light';
                    // Update document class for dark mode
                    if (typeof document !== 'undefined') {
                        if (newTheme === 'dark') {
                            document.documentElement.classList.add('dark');
                        } else {
                            document.documentElement.classList.remove('dark');
                        }
                    }
                    return { theme: newTheme };
                }),
            toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
            setCatalogView: (view) => set({ catalogView: view }),
        }),
        {
            name: 'artist-dashboard-ui', // localStorage key
            partialize: (state) => ({ theme: state.theme }), // Only persist theme
        }
    )
);

// Initialize theme on load
if (typeof document !== 'undefined') {
    const stored = localStorage.getItem('artist-dashboard-ui');
    if (stored) {
        try {
            const { state } = JSON.parse(stored);
            if (state.theme === 'dark') {
                document.documentElement.classList.add('dark');
            }
        } catch (e) {
            // Ignore parse errors
        }
    }
}
