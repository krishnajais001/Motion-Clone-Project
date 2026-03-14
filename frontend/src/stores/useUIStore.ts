import { create } from 'zustand';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
    const stored = localStorage.getItem('motion-theme') as Theme | null;
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

interface UIStore {
    /** Whether the sidebar is expanded */
    sidebarOpen: boolean;
    /** Whether the search/command palette modal is open */
    searchOpen: boolean;
    /** Current colour theme */
    theme: Theme;

    toggleSidebar: () => void;
    openSearch: () => void;
    closeSearch: () => void;
    toggleTheme: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
    sidebarOpen: true,
    searchOpen: false,
    theme: getInitialTheme(),

    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    openSearch: () => set({ searchOpen: true }),
    closeSearch: () => set({ searchOpen: false }),
    toggleTheme: () =>
        set((state) => {
            const next: Theme = state.theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('motion-theme', next);
            return { theme: next };
        }),
}));
