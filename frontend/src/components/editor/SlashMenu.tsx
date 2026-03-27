import {
    useEffect,
    useRef,
    useState,
    useCallback,
    type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import type { Editor } from '@tiptap/react';
import {
    Type,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    ListChecks,
    Table,
    Image,
    Minus,
    Quote,
    Code,
    FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SlashMenuState } from './SlashMenuExtension';
import { usePageStore } from '@/stores/usePageStore';
import { usePages } from '@/hooks/usePages';

// ─── Menu item definition ───────────────────────────────────────────────────

interface SlashMenuItem {
    id: string;
    label: string;
    description: string;
    icon: ReactNode;
    keywords?: string[];
    action: (editor: Editor, from: number, createChildPage?: (title: string) => Promise<string | undefined>) => void | Promise<void>;
}

const MENU_ITEMS: SlashMenuItem[] = [
    {
        id: 'text',
        label: 'Text',
        description: 'Plain paragraph',
        icon: <Type className="h-4 w-4" />,
        action: (editor, from) => {
            editor
                .chain()
                .focus()
                .deleteRange({ from: from - 1, to: editor.state.selection.from })
                .setParagraph()
                .run();
        },
    },
    {
        id: 'h1',
        label: 'Heading 1',
        description: 'Large section heading',
        icon: <Heading1 className="h-4 w-4" />,
        keywords: ['heading', 'h1', 'title'],
        action: (editor, from) => {
            editor
                .chain()
                .focus()
                .deleteRange({ from: from - 1, to: editor.state.selection.from })
                .setHeading({ level: 1 })
                .run();
        },
    },
    {
        id: 'h2',
        label: 'Heading 2',
        description: 'Medium section heading',
        icon: <Heading2 className="h-4 w-4" />,
        keywords: ['heading', 'h2'],
        action: (editor, from) => {
            editor
                .chain()
                .focus()
                .deleteRange({ from: from - 1, to: editor.state.selection.from })
                .setHeading({ level: 2 })
                .run();
        },
    },
    {
        id: 'h3',
        label: 'Heading 3',
        description: 'Small section heading',
        icon: <Heading3 className="h-4 w-4" />,
        keywords: ['heading', 'h3'],
        action: (editor, from) => {
            editor
                .chain()
                .focus()
                .deleteRange({ from: from - 1, to: editor.state.selection.from })
                .setHeading({ level: 3 })
                .run();
        },
    },
    {
        id: 'bulletList',
        label: 'Bullet List',
        description: 'Unordered list with dots',
        icon: <List className="h-4 w-4" />,
        keywords: ['bullet', 'ul', 'list'],
        action: (editor, from) => {
            editor
                .chain()
                .focus()
                .deleteRange({ from: from - 1, to: editor.state.selection.from })
                .toggleBulletList()
                .run();
        },
    },
    {
        id: 'orderedList',
        label: 'Numbered List',
        description: 'Ordered list with numbers',
        icon: <ListOrdered className="h-4 w-4" />,
        keywords: ['ordered', 'ol', 'numbered'],
        action: (editor, from) => {
            editor
                .chain()
                .focus()
                .deleteRange({ from: from - 1, to: editor.state.selection.from })
                .toggleOrderedList()
                .run();
        },
    },
    {
        id: 'taskList',
        label: 'Task List',
        description: 'Checklist with checkboxes',
        icon: <ListChecks className="h-4 w-4" />,
        keywords: ['task', 'todo', 'check'],
        action: (editor, from) => {
            editor
                .chain()
                .focus()
                .deleteRange({ from: from - 1, to: editor.state.selection.from })
                .toggleTaskList()
                .run();
        },
    },
    {
        id: 'blockquote',
        label: 'Quote',
        description: 'Callout quote block',
        icon: <Quote className="h-4 w-4" />,
        keywords: ['quote', 'blockquote'],
        action: (editor, from) => {
            editor
                .chain()
                .focus()
                .deleteRange({ from: from - 1, to: editor.state.selection.from })
                .toggleBlockquote()
                .run();
        },
    },
    {
        id: 'codeBlock',
        label: 'Code Block',
        description: 'Code block with syntax',
        icon: <Code className="h-4 w-4" />,
        keywords: ['code', 'codeblock'],
        action: (editor, from) => {
            editor
                .chain()
                .focus()
                .deleteRange({ from: from - 1, to: editor.state.selection.from })
                .toggleCodeBlock()
                .run();
        },
    },
    {
        id: 'table',
        label: 'Table',
        description: 'Insert a 3×3 table',
        icon: <Table className="h-4 w-4" />,
        keywords: ['table', 'grid'],
        action: (editor, from) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (editor.chain().focus() as any)
                .deleteRange({ from: from - 1, to: editor.state.selection.from })
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run();
        },
    },
    {
        id: 'image',
        label: 'Image',
        description: 'Upload or embed an image',
        icon: <Image className="h-4 w-4" />,
        keywords: ['image', 'photo', 'picture'],
        action: (editor, from) => {
            // Delete the slash text then trigger image upload node
            editor
                .chain()
                .focus()
                .deleteRange({ from: from - 1, to: editor.state.selection.from })
                .run();
            // Try using the image upload command if available
            const chain = editor.chain().focus();
            if ('setImageUpload' in chain) {
                (chain as unknown as { setImageUpload: () => typeof chain }).setImageUpload().run();
            }
        },
    },
    {
        id: 'divider',
        label: 'Divider',
        description: 'Horizontal line separator',
        icon: <Minus className="h-4 w-4" />,
        keywords: ['divider', 'hr', 'rule', 'line'],
        action: (editor, from) => {
            editor
                .chain()
                .focus()
                .deleteRange({ from: from - 1, to: editor.state.selection.from })
                .setHorizontalRule()
                .run();
        },
    },
    {
        id: 'subpage',
        label: 'Sub-page',
        description: 'Create a nested child page',
        icon: <FileText className="h-4 w-4" />,
        keywords: ['subpage', 'page', 'child', 'link'],
        action: async (editor, from, createChildPage) => {
            const title = 'Untitled';
            const newId = await createChildPage?.(title);
            editor
                .chain()
                .focus()
                .deleteRange({ from: from - 1, to: editor.state.selection.from })
                .insertContent(`📄 ${title}`)
                .run();
            // Navigate to the new page
            if (newId) {
                window.location.href = `/app/page/${newId}`;
            }
        },
    },
];

// ─── Fuzzy filter ────────────────────────────────────────────────────────────

function filterItems(items: SlashMenuItem[], query: string): SlashMenuItem[] {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter(
        (item) =>
            item.label.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.keywords?.some((k) => k.includes(q))
    );
}

// ─── SlashMenu component ─────────────────────────────────────────────────────

interface SlashMenuProps {
    editor: Editor;
    menuState: SlashMenuState | null;
    onClose: () => void;
}

export function SlashMenu({ editor, menuState, onClose }: SlashMenuProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const menuRef = useRef<HTMLDivElement>(null);
    const { addPage } = usePages();
    const { activePageId } = usePageStore();

    const items = menuState ? filterItems(MENU_ITEMS, menuState.query) : [];

    // Reset selection when items change
    useEffect(() => {
        setSelectedIndex(0);
    }, [menuState?.query]);

    // Calculate position from cursor
    useEffect(() => {
        if (!menuState?.active) return;

        const domSelection = window.getSelection();
        if (!domSelection || domSelection.rangeCount === 0) return;

        const range = domSelection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        setPosition({
            top: rect.bottom + window.scrollY + 4,
            left: Math.min(rect.left + window.scrollX, window.innerWidth - 280),
        });
    }, [menuState]);

    // Keyboard navigation
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!menuState?.active || items.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((i) => (i + 1) % items.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((i) => (i - 1 + items.length) % items.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                executeItem(items[selectedIndex]);
            } else if (e.key === 'Escape') {
                onClose();
            }
        },
        [menuState, items, selectedIndex, onClose]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [handleKeyDown]);

    // Click outside to close
    useEffect(() => {
        if (!menuState?.active) return;
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [menuState?.active, onClose]);

    const createChildPage = useCallback(
        async (title: string): Promise<string | undefined> => {
            const newPage = await addPage({
                title,
                parent_id: activePageId,
                project_id: null
            });
            return newPage?.id;
        },
        [activePageId, addPage]
    );

    const executeItem = useCallback(
        (item: SlashMenuItem) => {
            if (!menuState) return;
            item.action(editor, menuState.from, createChildPage);
            onClose();
        },
        [editor, menuState, onClose, createChildPage]
    );

    if (!menuState?.active || items.length === 0) return null;

    return createPortal(
        <div
            ref={menuRef}
            style={{ top: position.top, left: position.left }}
            className="slash-menu"
            role="listbox"
            aria-label="Insert block"
        >
            <div className="slash-menu-header">Basic blocks</div>
            {items.map((item, index) => (
                <button
                    key={item.id}
                    role="option"
                    aria-selected={index === selectedIndex}
                    className={cn(
                        'slash-menu-item',
                        index === selectedIndex && 'slash-menu-item--active'
                    )}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onMouseDown={(e) => {
                        e.preventDefault(); // Don't blur editor
                        executeItem(item);
                    }}
                >
                    <span className="slash-menu-item__icon">{item.icon}</span>
                    <span className="slash-menu-item__text">
                        <span className="slash-menu-item__label">{item.label}</span>
                        <span className="slash-menu-item__desc">{item.description}</span>
                    </span>
                </button>
            ))}
        </div>,
        document.body
    );
}
