import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronDown,
    Plus,
    FileText,
    Pencil,
    Trash2,
    FolderInput,
    Folder,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PageTreeNode } from '@/types';
import { usePages } from '@/hooks/usePages';
import { useProjects } from '@/hooks/useProjects';

interface PageTreeItemProps {
    node: PageTreeNode;
    level: number;
    expandedIds: Set<string>;
    onToggleExpand: (id: string) => void;
    onCreateChild: (parentId: string) => void;
    onDelete: (id: string) => void;
    onRename: (id: string, newTitle: string) => void;
    onClick?: () => void;
}

export function PageTreeItem({
    node,
    level,
    expandedIds,
    onToggleExpand,
    onCreateChild,
    onDelete,
    onRename,
    onClick,
}: PageTreeItemProps) {
    const navigate = useNavigate();
    const { id: activePageId } = useParams();
    const { updatePage } = usePages();
    const { projects } = useProjects();
    const [hovered, setHovered] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [isMoving, setIsMoving] = useState(false);
    const [renameValue, setRenameValue] = useState(node.title);
    const inputRef = useRef<HTMLInputElement>(null);

    const isExpanded = expandedIds.has(node.id);
    const isActive = activePageId === node.id;
    const hasChildren = node.children && node.children.length > 0;

    useEffect(() => {
        if (isRenaming && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isRenaming]);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleExpand(node.id);
    };

    const handleRenameSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (renameValue.trim() && renameValue !== node.title) {
            onRename(node.id, renameValue.trim());
        }
        setIsRenaming(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleRenameSubmit();
        if (e.key === 'Escape') {
            setRenameValue(node.title);
            setIsRenaming(false);
        }
    };

    const handleItemClick = () => {
        if (isRenaming || isMoving) return;
        navigate(`/app/page/${node.id}`);
        if (onClick) onClick();
    };

    const handleMove = async (projectId: string) => {
        await updatePage({ id: node.id, patch: { project_id: projectId || null } });
        setIsMoving(false);
    };

    return (
        <div className="relative">
            {/* Page row */}
            <div
                className={cn(
                    'group flex h-8 items-center gap-1.5 rounded-md transition-all duration-200 cursor-pointer px-2',
                    isActive
                        ? 'bg-black/5 dark:bg-white/10 text-sidebar-foreground font-semibold'
                        : 'font-medium text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-sidebar-foreground',
                    isRenaming && 'bg-black/5 dark:bg-white/10'
                )}
                style={{ paddingLeft: `${level * 8 + 4}px` }}
                onClick={handleItemClick}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => {
                    setHovered(false);
                    if (!isMoving) setIsMoving(false);
                }}
            >
                {/* Expand / collapse toggle */}
                <button
                    className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-inherit transition-all hover:bg-black/10 dark:hover:bg-white/10',
                        !hasChildren && 'invisible'
                    )}
                    onClick={handleToggle}
                >
                    <ChevronDown
                        className={cn(
                            'h-3.5 w-3.5 transition-transform duration-200',
                            !isExpanded && '-rotate-90'
                        )}
                    />
                </button>

                {/* Icon */}
                <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                    {node.emoji_icon ? (
                        <span className="text-[14px] leading-none">{node.emoji_icon}</span>
                    ) : (
                        <FileText className="h-4 w-4 opacity-50" />
                    )}
                </div>

                {/* Title / Input */}
                <div className="flex-1 overflow-hidden">
                    {isRenaming ? (
                        <input
                            ref={inputRef}
                            className="w-full border-none bg-transparent p-0 text-inherit outline-none focus:ring-0"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={() => handleRenameSubmit()}
                            onKeyDown={handleKeyDown}
                        />
                    ) : (
                        <span className="block truncate text-[13px]">{node.title || 'Untitled'}</span>
                    )}
                </div>

                {/* Actions (hover) */}
                {!isRenaming && (
                    <div className={cn(
                        "flex shrink-0 items-center gap-0.5 transition-opacity duration-150",
                        hovered || isMoving ? "opacity-100" : "opacity-0"
                    )}>
                        {/* Move to Vault */}
                        <button
                            className="flex h-6 w-6 items-center justify-center rounded-sm text-inherit transition-all hover:bg-black/10 dark:hover:bg-white/10"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMoving(!isMoving);
                            }}
                            title="Move to project"
                        >
                            <FolderInput className="h-3 w-3" />
                        </button>

                        {/* Rename */}
                        <button
                            className="flex h-6 w-6 items-center justify-center rounded-sm text-inherit transition-all hover:bg-black/10 dark:hover:bg-white/10"
                            onClick={(e) => {
                                e.stopPropagation();
                                setRenameValue(node.title);
                                setIsRenaming(true);
                            }}
                        >
                            <Pencil className="h-3 w-3" />
                        </button>

                        {/* Delete */}
                        <button
                            className="flex h-6 w-6 items-center justify-center rounded-sm text-inherit transition-all hover:bg-red-500/10 hover:text-red-500"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(node.id);
                            }}
                        >
                            <Trash2 className="h-3 w-3" />
                        </button>

                        {/* Add child */}
                        <button
                            className="flex h-6 w-6 items-center justify-center rounded-sm text-inherit transition-all hover:bg-black/10 dark:hover:bg-white/10"
                            onClick={(e) => {
                                e.stopPropagation();
                                onCreateChild(node.id);
                            }}
                            title="Add sub-page"
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Move Dropdown */}
            {isMoving && (
                <div 
                    className="absolute right-2 top-full z-50 mt-1 min-w-[180px] rounded-md border border-sidebar-border bg-sidebar p-1 shadow-2xl backdrop-blur-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-sidebar-border mb-1">Move to project...</p>
                    <div className="flex flex-col gap-0.5 max-h-[200px] overflow-y-auto custom-scrollbar">
                        {projects.map(p => (
                            <button
                                key={p.id}
                                className={cn(
                                    "flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/10 text-sidebar-foreground",
                                    node.project_id === p.id && "bg-black/5 dark:bg-white/5 opacity-40 cursor-default"
                                )}
                                onClick={() => node.project_id !== p.id && handleMove(p.id)}
                            >
                                <Folder className="h-3 w-3 text-muted-foreground" />
                                <span className="truncate">{p.name}</span>
                            </button>
                        ))}
                        {projects.length === 0 && (
                            <p className="px-2 py-2 text-xs text-muted-foreground italic">No projects created</p>
                        )}
                        <button
                             className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/10 text-blue-500 mt-1 border-t border-sidebar-border"
                             onClick={() => handleMove('')} // Remove from project
                        >
                            <FolderInput className="h-3 w-3" />
                            <span className="truncate">Move to Independent</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Children (collapsible) */}
            {hasChildren && isExpanded && (
                <div className="border-l border-sidebar-border/30 ml-2">
                    {node.children!.map((child) => (
                        <PageTreeItem
                            key={child.id}
                            node={child}
                            level={level + 1}
                            expandedIds={expandedIds}
                            onToggleExpand={onToggleExpand}
                            onCreateChild={onCreateChild}
                            onDelete={onDelete}
                            onRename={onRename}
                            onClick={onClick}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
