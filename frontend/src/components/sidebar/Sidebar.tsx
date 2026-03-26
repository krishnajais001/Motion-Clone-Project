import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Home,
    Plus,
    Settings,
    PanelLeft,
    LogOut,
    Sun,
    Moon,
    Bot,
    Calendar,
    Timer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePageStore } from '@/stores/usePageStore';
import { useUIStore } from '@/stores/useUIStore';
import { signOut } from '@/lib/auth';
import { buildPageTree } from '@/lib/treeUtils';
import { PageTreeItem } from './PageTreeItem';

export function Sidebar() {
    const navigate = useNavigate();
    const { pages, addPage, removePage, updatePage } = usePageStore();
    const { sidebarOpen, toggleSidebar, openSearch, theme, toggleTheme, toggleChat } = useUIStore();
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // Build tree from flat page list
    const tree = useMemo(
        () =>
            buildPageTree(
                pages.map((p) => ({
                    id: p.id,
                    parent_id: p.parent_id,
                    title: p.title,
                    emoji_icon: p.emoji_icon,
                }))
            ),
        [pages]
    );

    const handleToggleExpand = useCallback((id: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const createPage = useCallback(
        async (parentId: string | null) => {
            const newPage = await addPage(parentId);
            if (newPage) {
                // If creating a child, expand the parent
                if (parentId) {
                    setExpandedIds((prev) => new Set(prev).add(parentId));
                }
                // Navigate to the new page
                navigate(`/app/page/${newPage.id}`);
            }
        },
        [addPage, navigate]
    );

    const handleCreateChild = useCallback(
        (parentId: string) => {
            createPage(parentId);
        },
        [createPage]
    );

    const handleDelete = useCallback(
        (id: string) => {
            if (window.confirm('Delete this page and all its children?')) {
                removePage(id);
                navigate('/app');
            }
        },
        [removePage, navigate]
    );

    const handleRename = useCallback(
        (id: string, newTitle: string) => {
            if (newTitle.trim()) {
                updatePage(id, { title: newTitle.trim() });
            }
        },
        [updatePage]
    );

    const handleNewPage = useCallback(() => {
        createPage(null);
    }, [createPage]);

    const handleLogout = useCallback(async () => {
        await signOut();
        navigate('/login');
    }, [navigate]);

    return (
        <>
            {/* Sidebar */}
            <aside
                className={cn(
                    'flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-250 ease-in-out',
                    sidebarOpen ? 'w-60' : 'w-0 overflow-hidden border-r-0'
                )}
            >
                <div className="flex min-w-[240px] flex-1 flex-col min-h-0">
                    {/* ─── Workspace Header ─── */}
                    <div className="flex h-12 items-center justify-between px-3">
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-black text-xs font-semibold text-white" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
                                M
                            </div>
                            <span className="text-sm font-semibold text-sidebar-foreground">
                                Motion
                            </span>
                        </div>
                        <button
                            className="flex h-6 w-6 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-black/5 hover:text-black dark:hover:bg-white/10 dark:hover:text-white"
                            onClick={toggleSidebar}
                            aria-label="Collapse sidebar"
                        >
                            <PanelLeft className="h-4 w-4" />
                        </button>
                    </div>

                    {/* ─── Quick Actions ─── */}
                    <div className="space-y-0.5 px-2">
                        <button
                            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm font-medium text-gray-500 transition-colors hover:bg-black/5 hover:text-black dark:hover:bg-white/10 dark:hover:text-white"
                            onClick={openSearch}
                        >
                            <Search className="h-4 w-4" />
                            <span className="flex-1 text-left">Search</span>
                            <kbd className="hidden rounded border border-sidebar-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
                                Ctrl K
                            </kbd>
                        </button>
                        <button
                            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm font-medium text-gray-500 transition-colors hover:bg-black/5 hover:text-black dark:hover:bg-white/10 dark:hover:text-white"
                            onClick={() => navigate('/app')}
                        >
                            <Home className="h-4 w-4" />
                            <span>Home</span>
                        </button>
                        <button
                            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm font-medium text-gray-500 transition-colors hover:bg-black/5 hover:text-black dark:hover:bg-white/10 dark:hover:text-white"
                            onClick={() => navigate('/app/calendar')}
                        >
                            <Calendar className="h-4 w-4" />
                            <span>My Planner</span>
                        </button>
                        <button
                            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm font-medium text-gray-500 transition-colors hover:bg-black/5 hover:text-black dark:hover:bg-white/10 dark:hover:text-white"
                            onClick={() => navigate('/app/study')}
                        >
                            <Timer className="h-4 w-4" />
                            <span>Study Mode</span>
                        </button>

                    </div>

                    {/* ─── Divider ─── */}
                    <div className="mx-3 my-2 border-t border-sidebar-border" />

                    {/* ─── Page Tree ─── */}
                    <div className="flex-1 overflow-y-auto px-2">
                        <div className="mb-1 flex items-center justify-between px-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Workspace
                            </span>
                            <button
                                onClick={handleNewPage}
                                className="flex h-5 w-5 items-center justify-center rounded-sm text-gray-500 transition-colors hover:bg-black/5 hover:text-black dark:hover:bg-white/10 dark:hover:text-white"
                                aria-label="New page"
                                title="New page"
                            >
                                <Plus className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        {tree.length === 0 ? (
                            <div className="px-2 py-6 text-center">
                                <p className="text-sm text-muted-foreground">No pages yet</p>
                                <button
                                    className="mt-2 text-sm font-medium text-foreground underline-offset-4 hover:underline"
                                    onClick={handleNewPage}
                                >
                                    Create your first page
                                </button>
                            </div>
                        ) : (
                            tree.map((node) => (
                                <PageTreeItem
                                    key={node.id}
                                    node={node}
                                    level={0}
                                    expandedIds={expandedIds}
                                    onToggleExpand={handleToggleExpand}
                                    onCreateChild={handleCreateChild}
                                    onDelete={handleDelete}
                                    onRename={handleRename}
                                />
                            ))
                        )}
                    </div>

                    {/* ─── Bottom Actions ─── */}
                    <div className="space-y-0.5 border-t border-sidebar-border px-2 py-2">
                        <button
                            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm font-medium text-gray-500 transition-colors hover:bg-black/5 hover:text-black dark:hover:bg-white/10 dark:hover:text-white"
                            onClick={() => navigate('/app/settings')}
                        >
                            <Settings className="h-4 w-4" />
                            <span>Settings</span>
                        </button>
                        <button
                            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm font-medium text-gray-500 transition-colors hover:bg-black/5 hover:text-black dark:hover:bg-white/10 dark:hover:text-white"
                            onClick={toggleChat}
                        >
                            <Bot className="h-4 w-4" />
                            <span>Notion AI</span>
                        </button>
                        <button
                            id="theme-toggle"
                            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm font-medium text-gray-500 transition-colors hover:bg-black/5 hover:text-black dark:hover:bg-white/10 dark:hover:text-white"
                            onClick={toggleTheme}
                            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {theme === 'dark' ? (
                                <Sun className="h-4 w-4" />
                            ) : (
                                <Moon className="h-4 w-4" />
                            )}
                            <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
                        </button>
                        <button
                            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm font-medium text-gray-500 transition-colors hover:bg-black/5 hover:text-black dark:hover:bg-white/10 dark:hover:text-white"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Log out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Collapsed sidebar toggle */}
            {!sidebarOpen && (
                <button
                    className="fixed left-2 top-3 z-50 flex h-7 w-7 items-center justify-center rounded-sm bg-white dark:bg-sidebar text-gray-500 border border-gray-200 dark:border-white/10 transition-colors hover:bg-black/5 hover:text-black dark:hover:bg-white/10 dark:hover:text-white"
                    onClick={toggleSidebar}
                    aria-label="Expand sidebar"
                >
                    <PanelLeft className="h-4 w-4" />
                </button>
            )}
        </>
    );
};
