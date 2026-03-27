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
    Timer,
    PenTool
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/useUIStore';
import { usePages } from '@/hooks/usePages';
import { signOut } from '@/lib/auth';
import { buildPageTree } from '@/lib/treeUtils';
import { PageTreeItem } from './PageTreeItem';
import { ProjectFolders } from './ProjectFolders';

export function Sidebar() {
    const navigate = useNavigate();
    const { pages, addPage, removePage, updatePage } = usePages();
    const { sidebarOpen, toggleSidebar, openSearch, theme, toggleTheme, toggleChat, isMobile } = useUIStore();
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // Build one global tree for all pages to ensure parent-child relationships are preserved
    const globalTree = useMemo(() => buildPageTree(pages), [pages]);

    // Independent pages are root-level pages with no project
    const independentTree = useMemo(
        () => globalTree.filter(node => !node.project_id),
        [globalTree]
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
            const newPage = await addPage({ 
                title: 'Untitled', 
                parent_id: parentId, 
                project_id: null 
            });
            if (newPage) {
                if (parentId) {
                    setExpandedIds((prev) => new Set(prev).add(parentId));
                }
                navigate(`/app/page/${newPage.id}`);
                if (isMobile) toggleSidebar(); 
            }
        },
        [addPage, navigate, isMobile, toggleSidebar]
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
                updatePage({ id, patch: { title: newTitle.trim() } });
            }
        },
        [updatePage]
    );

    const handleNewPage = useCallback(async () => {
        await createPage(null);
    }, [createPage]);

    const handleLogout = useCallback(async () => {
        await signOut();
        navigate('/login');
    }, [navigate]);

    const handleNavigation = useCallback(
        (path: string) => {
            navigate(path);
            if (isMobile) toggleSidebar();
        },
        [navigate, isMobile, toggleSidebar]
    );

    return (
        <>
            {/* Sidebar */}
            <aside
                className={cn(
                    'flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-250 ease-in-out overflow-hidden',
                    sidebarOpen ? 'w-64' : 'w-0 border-r-0'
                )}
            >
                <div className="flex min-w-[256px] flex-1 flex-col min-h-0 overflow-x-hidden">
                    {/* Workspace Header */}
                    <div className="flex h-12 items-center justify-between px-3">
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-black text-xs font-semibold text-white dark:bg-white dark:text-black">
                                M
                            </div>
                            <span className="text-sm font-semibold text-sidebar-foreground">
                                Motion
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                className="flex h-7 w-7 items-center justify-center rounded-sm text-sidebar-foreground transition-all hover:bg-black/5 dark:hover:bg-white/10"
                                onClick={toggleTheme}
                                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </button>
                            <button
                                className="flex h-7 w-7 items-center justify-center rounded-sm text-sidebar-foreground transition-all hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black z-50 sm:z-auto"
                                onClick={toggleSidebar}
                            >
                                <PanelLeft className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-1.5 px-2">
                        <button
                            className="flex h-9 w-full items-center gap-3 rounded-md px-2 text-[13px] font-bold text-sidebar-foreground transition-all hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black group active:scale-95"
                            onClick={openSearch}
                        >
                            <Search className="h-4 w-4 shrink-0" />
                            <span className="flex-1 text-left truncate uppercase tracking-tight">Search</span>
                            <kbd className="hidden rounded border border-sidebar-border px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground sm:inline-block group-hover:bg-white/10 group-hover:text-white dark:group-hover:bg-black/20 dark:group-hover:text-black transition-colors">
                                CTRL K
                            </kbd>
                        </button>
                        <button
                            className="flex h-9 w-full items-center gap-3 rounded-md px-2 text-[13px] font-bold text-sidebar-foreground transition-all hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black active:scale-95 group"
                            onClick={() => handleNavigation('/app')}
                        >
                            <Home className="h-4 w-4 shrink-0 transition-colors" />
                            <span className="flex-1 text-left truncate uppercase tracking-tight transition-colors">Home</span>
                        </button>
                        <button
                            className="flex h-9 w-full items-center gap-3 rounded-md px-2 text-[13px] font-bold text-sidebar-foreground transition-all hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black active:scale-95 group"
                            onClick={() => handleNavigation('/app/calendar')}
                        >
                            <Calendar className="h-4 w-4 shrink-0 transition-colors" />
                            <span className="flex-1 text-left truncate uppercase tracking-tight transition-colors">My Planner</span>
                        </button>
                        <button
                            className="flex h-9 w-full items-center gap-3 rounded-md px-2 text-[13px] font-bold text-sidebar-foreground transition-all hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black active:scale-95 group"
                            onClick={() => handleNavigation('/app/study')}
                        >
                            <Timer className="h-4 w-4 shrink-0 transition-colors" />
                            <span className="flex-1 text-left truncate uppercase tracking-tight transition-colors">Study Mode</span>
                        </button>
                        <button
                            className="flex h-9 w-full items-center gap-3 rounded-md px-2 text-[13px] font-bold text-sidebar-foreground transition-all hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black active:scale-95 group"
                            onClick={() => handleNavigation('/app/whiteboard')}
                        >
                            <PenTool className="h-4 w-4 shrink-0 transition-colors" />
                            <span className="flex-1 text-left truncate uppercase tracking-tight transition-colors">Whiteboard</span>
                        </button>
                    </div>

                    <div className="mx-3 my-2 border-t border-sidebar-border" />

                    {/* Hierarchical Content Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-6">
                        {/* Projects Section (Folders with nested pages) */}
                        <ProjectFolders globalTree={globalTree} />

                        {/* Independent Section (Flat pages) */}
                        <div className="flex flex-col gap-1">
                            <div className="mb-1 flex items-center justify-between px-2">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Personal Pages
                                </span>
                                <button
                                    onClick={handleNewPage}
                                    className="flex h-5 w-5 items-center justify-center rounded-sm text-sidebar-foreground transition-all hover:bg-black/5 dark:hover:bg-white/10"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            {independentTree.length === 0 ? (
                                <div className="px-2 py-4 text-center">
                                    <p className="text-[11px] text-muted-foreground/30 italic">No personal pages</p>
                                </div>
                            ) : (
                                independentTree.map((node) => (
                                    <PageTreeItem
                                        key={node.id}
                                        node={node}
                                        level={0}
                                        expandedIds={expandedIds}
                                        onToggleExpand={handleToggleExpand}
                                        onCreateChild={handleCreateChild}
                                        onDelete={handleDelete}
                                        onRename={handleRename}
                                        onClick={() => isMobile && toggleSidebar()} 
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="space-y-0.5 border-t border-sidebar-border px-2 py-2">
                        <button
                            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm font-medium text-sidebar-foreground transition-all hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                            onClick={() => handleNavigation('/app/settings')}
                        >
                            <Settings className="h-4 w-4" />
                            <span>Settings</span>
                        </button>
                        <button
                            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm font-medium text-sidebar-foreground transition-all hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                            onClick={toggleChat}
                        >
                            <Bot className="h-4 w-4" />
                            <span>Motion AI</span>
                        </button>
                        <button
                            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm font-medium text-sidebar-foreground transition-all hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Log out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Expander Toggle for Desktop only */}
            {!sidebarOpen && !isMobile && (
                <button
                    className="fixed left-2 top-3 z-50 flex h-7 w-7 items-center justify-center rounded-sm bg-black dark:bg-white text-white dark:text-black transition-all hover:scale-110 active:scale-95 shadow-lg"
                    onClick={toggleSidebar}
                >
                    <PanelLeft className="h-4 w-4" />
                </button>
            )}
        </>
    );
}
