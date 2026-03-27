import { useState, useCallback } from 'react';
import { Plus, ChevronDown, Folder, FolderPlus, GraduationCap, Pencil, Trash2 } from 'lucide-react';
import { usePages } from '@/hooks/usePages';
import { useProjects } from '@/hooks/useProjects';
import { cn } from '@/lib/utils';
import { PageTreeItem } from './PageTreeItem';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores/useUIStore';
import type { PageTreeNode } from '@/types';

interface ProjectFoldersProps {
    globalTree: PageTreeNode[];
}

export function ProjectFolders({ globalTree }: ProjectFoldersProps) {
    const navigate = useNavigate();
    const { projects, addProject, updateProject, removeProject } = useProjects();
    const { addPage, removePage, updatePage } = usePages();
    const { toggleSidebar, isMobile } = useUIStore();
    const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(new Set());
    const [expandedPageIds, setExpandedPageIds] = useState<Set<string>>(new Set());
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');

    const toggleProject = (projectId: string) => {
        setExpandedProjectIds((prev) => {
            const next = new Set(prev);
            if (next.has(projectId)) next.delete(projectId);
            else next.add(projectId);
            return next;
        });
    };

    const handleToggleExpandPage = useCallback((id: string) => {
        setExpandedPageIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;
        const p = await addProject({ name: newProjectName.trim() });
        if (p) {
            setNewProjectName('');
            setIsCreatingProject(false);
            setExpandedProjectIds(prev => new Set(prev).add(p.id));
        }
    };

    const handleCreatePageInProject = async (projectId: string) => {
        const page = await addPage({ title: 'Untitled', project_id: projectId });
        if (page) {
            setExpandedProjectIds(prev => new Set(prev).add(projectId));
            navigate(`/app/page/${page.id}`);
            if (isMobile) toggleSidebar();
        }
    };

    const handleCreateChild = useCallback(async (parentId: string) => {
        const page = await addPage({ title: 'Untitled', parent_id: parentId });
        if (page) {
            setExpandedPageIds(prev => new Set(prev).add(parentId));
            navigate(`/app/page/${page.id}`);
            if (isMobile) toggleSidebar();
        }
    }, [addPage, navigate, isMobile, toggleSidebar]);

    const handleRenameProject = async (id: string) => {
        if (renameValue.trim()) {
            await updateProject({ id, patch: { name: renameValue.trim() } });
        }
        setRenamingProjectId(null);
    };

    const handleDeleteProject = async (id: string) => {
        if (window.confirm('Delete this folder? Pages inside will remain as Independent.')) {
            await removeProject(id);
        }
    };

    // Get specific icons for projects (matching user's screenshot TOC = Cap)
    const getProjectIcon = (name: string, emoji?: string | null) => {
        if (emoji && emoji !== '📁') return <span className="text-lg">{emoji}</span>;
        const lowerName = name.toLowerCase();
        if (lowerName === 'toc') return <GraduationCap className="h-4 w-4 text-blue-500" />;
        return <Folder className="h-4 w-4 text-muted-foreground/70" />;
    };

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between px-2 py-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Projects</span>
                <button 
                    onClick={() => setIsCreatingProject(!isCreatingProject)}
                    className="rounded p-0.5 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:text-sidebar-foreground"
                >
                    <FolderPlus className="h-3.5 w-3.5" />
                </button>
            </div>

            {isCreatingProject && (
                <form onSubmit={handleCreateProject} className="px-2 pb-2">
                    <input
                        autoFocus
                        className="w-full rounded border border-sidebar-border bg-transparent px-2 py-1 text-xs text-sidebar-foreground outline-none focus:border-sidebar-foreground/30"
                        placeholder="Project name..."
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        onBlur={() => !newProjectName && setIsCreatingProject(false)}
                    />
                </form>
            )}

            <div className="flex flex-col gap-0.5">
                {projects.map((project) => {
                    const projectPagesTree = globalTree.filter(node => node.project_id === project.id);
                    const isExpanded = expandedProjectIds.has(project.id);

                    return (
                        <div key={project.id} className="group flex flex-col">
                            <div 
                                className={cn(
                                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors cursor-pointer",
                                    isExpanded ? "bg-black/5 dark:bg-white/5 text-sidebar-foreground" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-sidebar-foreground"
                                )}
                                onClick={() => toggleProject(project.id)}
                            >
                                <ChevronDown className={cn(
                                    "h-3 w-3 shrink-0 transition-transform duration-200",
                                    !isExpanded && "-rotate-90"
                                )} />
                                {getProjectIcon(project.name, project.emoji_icon)}
                                {renamingProjectId === project.id ? (
                                    <input
                                        autoFocus
                                        className="w-full bg-transparent p-0 text-inherit outline-none focus:ring-0"
                                        value={renameValue}
                                        onChange={(e) => setRenameValue(e.target.value)}
                                        onBlur={() => handleRenameProject(project.id)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleRenameProject(project.id);
                                            if (e.key === 'Escape') setRenamingProjectId(null);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ) : (
                                    <span className="truncate">{project.name}</span>
                                )}
                                
                                <div className="ml-auto flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setRenameValue(project.name);
                                            setRenamingProjectId(project.id);
                                        }}
                                        className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                                        title="Rename folder"
                                    >
                                        <Pencil className="h-3 w-3" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteProject(project.id);
                                        }}
                                        className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-red-500/10 hover:text-red-500"
                                        title="Delete folder"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCreatePageInProject(project.id);
                                        }}
                                        className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                                        title="Add page to folder"
                                    >
                                        <Plus className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="mt-0.5 border-l border-sidebar-border ml-4">
                                    {projectPagesTree.length === 0 ? (
                                        <div className="py-2 pl-4 text-[10px] italic text-muted-foreground/50">No pages yet</div>
                                    ) : (
                                        projectPagesTree.map((node) => (
                                            <PageTreeItem
                                                key={node.id}
                                                node={node}
                                                level={0}
                                                expandedIds={expandedPageIds}
                                                onToggleExpand={handleToggleExpandPage}
                                                onCreateChild={handleCreateChild}
                                                onDelete={(id) => removePage(id)}
                                                onRename={(id, title) => updatePage({ id, patch: { title } })}
                                                onClick={() => isMobile && toggleSidebar()}
                                            />
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
