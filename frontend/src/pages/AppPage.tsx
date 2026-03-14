import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { SearchModal } from '@/components/search/SearchModal';
import { useUIStore } from '@/stores/useUIStore';
import { usePages } from '@/hooks/usePages';

export default function AppPage() {
    const { openSearch } = useUIStore();

    // Load all user pages on mount
    usePages();

    // Global Ctrl+K shortcut for search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                openSearch();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [openSearch]);

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-background">
            <Sidebar />

            {/* Main content area */}
            <main className="relative flex flex-1 flex-col overflow-hidden">
                <Outlet />
            </main>

            {/* Search modal (global) */}
            <SearchModal />
        </div>
    );
}
