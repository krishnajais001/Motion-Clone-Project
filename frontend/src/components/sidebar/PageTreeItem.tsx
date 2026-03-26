import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronRight,
    Plus,
    FileText,
    Pencil,
    Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PageTreeNode } from '@/types';

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
    const [hovered, setHovered] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameValue, setRenameValue] = useState(node.title);
    const inputRef = useRef<HTMLInputElement>(null);

    const isExpanded = expandedIds.has(node.id);
    const hasChildren = node.children.length > 0;
    const isActive = activePageId === node.id;

    // Focus & select all text when rename mode starts
    useEffect(() => {
        if (isRenaming && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isRenaming]);

    const commitRename = () => {
        const trimmed = renameValue.trim();
        if (trimmed && trimmed !== node.title) {
            onRename(node.id, trimmed);
        } else {
            setRenameValue(node.title); // revert if empty or unchanged
        }
        setIsRenaming(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') commitRename();
        if (e.key === 'Escape') {
            setRenameValue(node.title);
            setIsRenaming(false);
        }
    };

    const handleItemClick = () => {
        if (isRenaming) return;
        navigate(`/app/page/${node.id}`);
        if (onClick) onClick();
    };

    return (
        <div>
            {/* Page row */}
            <div
                className={cn(
                    'group flex h-8 cursor-pointer items-center gap-0.5 rounded-md px-2 text-sm transition-all duration-150',
                    isActive
                        ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                        : 'font-medium text-sidebar-foreground hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
                    isRenaming && 'bg-black/5 dark:bg-white/10'
                )}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                onClick={handleItemClick}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Expand / collapse toggle */}
                <button
                    className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-sm transition-colors hover:bg-black/10 dark:hover:bg-white/10',
                        !hasChildren && 'invisible'
                    )}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleExpand(node.id);
                    }}
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                >
                    <ChevronRight
                        className={cn(
                            'h-3.5 w-3.5 text-muted-foreground transition-transform duration-150',
                            isExpanded && 'rotate-90'
                        )}
                    />
                </button>

                {/* Icon */}
                <span className="mr-1 shrink-0 text-base leading-none">
                    {node.emoji_icon || (
                        <FileText className="h-4 w-4 text-muted-foreground/70" />
                    )}
                </span>

                {/* Title OR inline input */}
                {isRenaming ? (
                    <input
                        ref={inputRef}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        className="min-w-0 flex-1 truncate bg-transparent outline-none text-foreground text-sm font-medium"
                    />
                ) : (
                    <span className="min-w-0 flex-1 truncate capitalize">{node.title}</span>
                )}

                {/* Hover actions */}
                {!isRenaming && (
                    <div className={cn(
                        "flex shrink-0 items-center gap-0.5 transition-opacity duration-150",
                        hovered ? "opacity-100" : "opacity-0"
                    )}>
                        {/* Rename */}
                        <button
                            className="flex h-6 w-6 items-center justify-center rounded-sm text-inherit transition-all hover:bg-white/20 dark:hover:bg-black/20"
                            onClick={(e) => {
                                e.stopPropagation();
                                setRenameValue(node.title);
                                setIsRenaming(true);
                            }}
                            title="Rename"
                        >
                            <Pencil className="h-3 w-3" />
                        </button>

                        {/* Delete */}
                        <button
                            className="flex h-6 w-6 items-center justify-center rounded-sm text-inherit transition-all hover:bg-white/20 dark:hover:bg-black/20"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(node.id);
                            }}
                            title="Delete"
                        >
                            <Trash2 className="h-3 w-3" />
                        </button>

                        {/* Add child */}
                        <button
                            className="flex h-6 w-6 items-center justify-center rounded-sm text-inherit transition-all hover:bg-white/20 dark:hover:bg-black/20"
                            onClick={(e) => {
                                e.stopPropagation();
                                onCreateChild(node.id);
                            }}
                            title="Add page"
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Children (collapsible) */}
            {hasChildren && isExpanded && (
                <div>
                    {node.children.map((child) => (
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
