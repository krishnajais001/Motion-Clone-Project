import { create } from 'zustand';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
    if (typeof window === 'undefined') return 'light';
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
    /** Mobile viewport detection */
    isMobile: boolean;

    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    openSearch: () => void;
    closeSearch: () => void;
    toggleTheme: () => void;
    toggleChat: () => void;
    setIsMobile: (isMobile: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
    sidebarOpen: typeof window !== 'undefined' ? window.innerWidth > 768 : true,
    searchOpen: false,
    theme: getInitialTheme(),
    chatOpen: false,
    isMobile: typeof window !== 'undefined' ? window.innerWidth <= 768 : false,

    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    openSearch: () => set({ searchOpen: true }),
    closeSearch: () => set({ searchOpen: false }),
    toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),
    setIsMobile: (isMobile) => set((state) => ({ 
        isMobile,
        // Auto-close sidebar when switching to mobile if it was open
        sidebarOpen: isMobile ? false : state.sidebarOpen 
    })),
    toggleTheme: () =>
        set((state) => {
            const next: Theme = state.theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('motion-theme', next);
            return { theme: next };
        }),
}));
