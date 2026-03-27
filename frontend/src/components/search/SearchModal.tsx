import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText } from 'lucide-react';
import Fuse from 'fuse.js';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/useUIStore';
import { usePages } from '@/hooks/usePages';
import { getBreadcrumbPath } from '@/lib/treeUtils';

export function SearchModal() {
    const navigate = useNavigate();
    const { pages } = usePages();
    const { searchOpen, closeSearch } = useUIStore();
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Build Fuse index (re-indexes when pages change)
    const fuse = useMemo(
        () =>
            new Fuse(pages, {
                keys: ['title'],
                threshold: 0.4,
                includeScore: true,
            }),
        [pages]
    );

    // Search results
    const results = useMemo(() => {
        if (!query.trim()) return pages.slice(0, 10); // Show recent pages when empty
        return fuse.search(query).map((r) => r.item);
    }, [query, fuse, pages]);

    // Reset on open
    useEffect(() => {
        if (searchOpen) {
            setQuery('');
            setSelectedIndex(0);
            // Focus input after modal animation
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [searchOpen]);

    // Reset selected index when results change
    useEffect(() => {
        setSelectedIndex(0);
    }, [results]);

    const handleSelect = useCallback(
        (pageId: string) => {
            closeSearch();
            navigate(`/app/page/${pageId}`);
        },
        [closeSearch, navigate]
    );

    // Keyboard navigation
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex((i) => Math.max(i - 1, 0));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (results[selectedIndex]) {
                        handleSelect(results[selectedIndex].id);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    closeSearch();
                    break;
            }
        },
        [results, selectedIndex, handleSelect, closeSearch]
    );

    if (!searchOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-xs"
                onClick={closeSearch}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-background shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                {/* Search input */}
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                    <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search pages…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                    <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div className="max-h-72 overflow-y-auto py-1">
                    {results.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            No pages found for &apos;{query}&apos;
                        </div>
                    ) : (
                        results.map((page, index) => {
                            const breadcrumb = getBreadcrumbPath(
                                pages.map((p) => ({
                                    id: p.id,
                                    parent_id: p.parent_id,
                                    project_id: p.project_id,
                                    title: p.title,
                                    emoji_icon: p.emoji_icon,
                                })),
                                page.id
                            );

                            return (
                                <button
                                    key={page.id}
                                    className={cn(
                                        'flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors',
                                        index === selectedIndex
                                            ? 'bg-accent text-accent-foreground'
                                            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                                    )}
                                    onClick={() => handleSelect(page.id)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    <span className="shrink-0 text-base">
                                        {page.emoji_icon || (
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <span className="block truncate font-medium">
                                            {page.title}
                                        </span>
                                        {breadcrumb.length > 1 && (
                                            <span className="block truncate text-xs text-muted-foreground">
                                                {breadcrumb.map((b) => b.title).join(' / ')}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
