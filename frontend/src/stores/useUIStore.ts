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
    /** Whether the AI assistant sidebar is open */
    chatOpen: boolean;

    toggleSidebar: () => void;
    openSearch: () => void;
    closeSearch: () => void;
    toggleTheme: () => void;
    toggleChat: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
    sidebarOpen: true,
    searchOpen: false,
    theme: getInitialTheme(),
    chatOpen: false,

    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    openSearch: () => set({ searchOpen: true }),
    closeSearch: () => set({ searchOpen: false }),
    toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),
    toggleTheme: () =>
        set((state) => {
            const next: Theme = state.theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('motion-theme', next);
            return { theme: next };
        }),
}));
