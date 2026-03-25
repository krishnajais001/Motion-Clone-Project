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
}

export function PageTreeItem({
    node,
    level,
    expandedIds,
    onToggleExpand,
    onCreateChild,
    onDelete,
    onRename,
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

    return (
        <div>
            {/* Page row */}
            <div
                className={cn(
                    'group flex h-8 cursor-pointer items-center gap-0.5 rounded-md px-2 text-sm transition-colors duration-100',
                    isActive
                        ? 'bg-accent text-accent-foreground font-medium'
                        : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                    isRenaming && 'bg-accent/60'
                )}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                onClick={() => { if (!isRenaming) navigate(`/app/page/${node.id}`); }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Expand / collapse toggle */}
                <button
                    className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-sm transition-colors hover:bg-accent',
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
                    <span className="min-w-0 flex-1 truncate">{node.title}</span>
                )}

                {/* Hover actions */}
                {hovered && !isRenaming && (
                    <div className="flex shrink-0 items-center gap-0.5">
                        {/* Rename */}
                        <button
                            className="flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            onClick={(e) => {
                                e.stopPropagation();
                                setRenameValue(node.title);
                                setIsRenaming(true);
                            }}
                            aria-label="Rename page"
                            title="Rename"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                            className="flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(node.id);
                            }}
                            aria-label="Delete page"
                            title="Delete"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        {/* Add child */}
                        <button
                            className="flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            onClick={(e) => {
                                e.stopPropagation();
                                onCreateChild(node.id);
                            }}
                            aria-label="Add child page"
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
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
