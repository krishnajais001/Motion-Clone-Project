import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { SearchModal } from '@/components/search/SearchModal';
import { useUIStore } from '@/stores/useUIStore';
import { usePages } from '@/hooks/usePages';
import { ChatSidebar } from '@/features/chat/ChatSidebar';
import { cn } from '@/lib/utils';
import { PanelLeft } from 'lucide-react';

export default function AppPage() {
    const { 
        openSearch, 
        chatOpen, 
        toggleChat, 
        isMobile, 
        setIsMobile, 
        sidebarOpen, 
        toggleSidebar,
        setSidebarOpen
    } = useUIStore();

    // Load all user pages on mount
    usePages();

    // Handle viewport resizing for mobile state
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 768;
            if (mobile !== isMobile) {
                setIsMobile(mobile);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [isMobile, setIsMobile]);

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
            {/* Sidebar + Overlay for Mobile */}
            {isMobile && sidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            
            <div className={cn(
                "flex h-full",
                isMobile ? "fixed inset-y-0 left-0 z-50 transition-transform duration-300" : "relative",
                isMobile && !sidebarOpen && "-translate-x-full",
                isMobile && sidebarOpen && "translate-x-0"
            )}>
                <Sidebar />
            </div>

            {/* Main content area */}
            <main className={cn(
                "relative flex flex-1 flex-col overflow-hidden transition-all duration-300",
                !isMobile && !sidebarOpen && "pl-0"
            )}>
                {/* Mobile top bar toggle (when sidebar is closed) */}
                {isMobile && !sidebarOpen && (
                    <div className="flex items-center h-12 px-4 border-b border-border bg-background z-30">
                        <button 
                            onClick={toggleSidebar}
                            className="p-1 hover:bg-accent rounded-sm"
                        >
                            <PanelLeft className="h-5 w-5" />
                        </button>
                    </div>
                )}
                
                <Outlet />
            </main>

            {/* AI Assistant Sidebar (Overlay) */}
            {chatOpen && <ChatSidebar onClose={toggleChat} />}

            {/* Search modal (global) */}
            <SearchModal />
        </div>
    );
}
