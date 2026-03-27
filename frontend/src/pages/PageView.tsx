import { useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ImagePlus, SmilePlus } from 'lucide-react';
import { usePageStore } from '@/stores/usePageStore';
import { usePages } from '@/hooks/usePages';
import { Editor } from '@/components/editor/Editor';
import { EmojiPicker } from '@/components/page/EmojiPicker';
import ProjectFooter from '@/components/ProjectFooter';

export default function PageView() {
    const { id } = useParams<{ id: string }>();
    const { pages, updatePage } = usePages();
    const { setActivePageId } = usePageStore();
    const activePage = pages.find((p) => p.id === id) || null;
    const titleRef = useRef<HTMLDivElement>(null);

    // Set the active page ID when the route changes
    useEffect(() => {
        setActivePageId(id || null);
    }, [id, setActivePageId]);


    // Sync title text in contenteditable when page changes
    useEffect(() => {
        if (titleRef.current && activePage) {
            if (titleRef.current.textContent !== activePage.title) {
                titleRef.current.textContent = activePage.title;
            }
        }
    }, [activePage?.id]); // Only on page switch, not every title update

    const handleTitleInput = useCallback(() => {
        if (!titleRef.current || !activePage) return;
        const newTitle = titleRef.current.textContent?.trim() || 'Untitled';
        updatePage({ id: activePage.id, patch: { title: newTitle } });
    }, [activePage, updatePage]);

    const handleTitleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                // Move focus to the editor body (the TipTap editor gets focused)
                const editorEl = document.querySelector('.notion-editor') as HTMLElement;
                editorEl?.focus();
            }
        },
        []
    );

    const handleEditorUpdate = useCallback(
        (content: Record<string, unknown>) => {
            if (!activePage) return;
            updatePage({ id: activePage.id, patch: { content } });
        },
        [activePage, updatePage]
    );

    if (!activePage) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">Page not found</p>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col overflow-y-auto">
            {/* ─── Thumbnail Banner Area ─── */}
            {activePage.thumbnail_url ? (
                <div className="group relative h-[200px] w-full shrink-0 overflow-hidden">
                    <img
                        src={activePage.thumbnail_url}
                        alt="Page cover"
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                    <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <button className="rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-foreground shadow-sm hover:bg-white">
                            Change cover
                        </button>
                        <button className="rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-foreground shadow-sm hover:bg-white">
                            Remove
                        </button>
                    </div>
                </div>
            ) : null}

            {/* ─── Page Content Area (centered like Notion) ─── */}
            <div className="mx-auto w-full max-w-[1000px] px-6 md:px-24 pb-20">
                {/* Controls that appear on hover */}
                <div className="group/controls mt-16 flex items-center gap-2 opacity-0 transition-opacity hover:opacity-100 focus-within:opacity-100">
                    {!activePage.emoji_icon && (
                        <EmojiPicker
                            onEmojiSelect={(emoji) => updatePage({ id: activePage.id, patch: { emoji_icon: emoji } })}
                            hasIcon={false}
                        >
                            <button className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                                <SmilePlus className="h-3.5 w-3.5" />
                                Add icon
                            </button>
                        </EmojiPicker>
                    )}
                    {!activePage.thumbnail_url && (
                        <button className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                            <ImagePlus className="h-3.5 w-3.5" />
                            Add cover
                        </button>
                    )}
                </div>

                {/* ─── Emoji Icon ─── */}
                {activePage.emoji_icon && (
                    <div className="-ml-1 mt-4 mb-2">
                        <EmojiPicker
                            onEmojiSelect={(emoji) => updatePage({ id: activePage.id, patch: { emoji_icon: emoji } })}
                            onRemove={() => updatePage({ id: activePage.id, patch: { emoji_icon: null } })}
                            hasIcon={true}
                        >
                            <button
                                className="rounded-md p-1 text-5xl leading-none transition-colors hover:bg-accent"
                                title="Change icon"
                            >
                                {activePage.emoji_icon}
                            </button>
                        </EmojiPicker>
                    </div>
                )}

                {/* ─── Title ─── */}
                <div
                    ref={titleRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleTitleInput}
                    onKeyDown={handleTitleKeyDown}
                    data-placeholder="Untitled"
                    className="mb-2 text-[2.5rem] font-bold leading-[1.2] text-foreground outline-none empty:before:text-muted-foreground/50 empty:before:content-[attr(data-placeholder)]"
                    role="textbox"
                    aria-label="Page title"
                />

                {/* ─── TipTap Editor ─── */}
                <Editor
                    key={activePage.id}
                    content={activePage.content}
                    onUpdate={handleEditorUpdate}
                />
            </div>
            <ProjectFooter />
        </div>
    );
}
