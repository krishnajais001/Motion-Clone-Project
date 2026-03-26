import type { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BubbleToolbarProps {
    editor: Editor;
}

interface ToolbarButtonProps {
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
    title: string;
}

function ToolbarButton({ onClick, isActive, children, title }: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={cn(
                'flex h-7 w-7 items-center justify-center rounded-sm transition-colors',
                isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
        >
            {children}
        </button>
    );
}

function Divider() {
    return <div className="mx-0.5 h-5 w-px bg-border" />;
}

export function BubbleToolbar({ editor }: BubbleToolbarProps) {
    return (
        <BubbleMenu
            editor={editor}
        >
            <div className="flex items-center gap-0.5 rounded-lg border border-border bg-background px-1.5 py-1 shadow-lg">
                {/* ─── Text Style ─── */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="Bold (Ctrl+B)"
                >
                    <Bold className="h-3.5 w-3.5" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="Italic (Ctrl+I)"
                >
                    <Italic className="h-3.5 w-3.5" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive('underline')}
                    title="Underline (Ctrl+U)"
                >
                    <Underline className="h-3.5 w-3.5" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    title="Strikethrough (Ctrl+Shift+S)"
                >
                    <Strikethrough className="h-3.5 w-3.5" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    isActive={editor.isActive('code')}
                    title="Inline Code (Ctrl+E)"
                >
                    <Code className="h-3.5 w-3.5" />
                </ToolbarButton>

                <Divider />

                {/* ─── Headings ─── */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                    title="Heading 1"
                >
                    <Heading1 className="h-3.5 w-3.5" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    title="Heading 2"
                >
                    <Heading2 className="h-3.5 w-3.5" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive('heading', { level: 3 })}
                    title="Heading 3"
                >
                    <Heading3 className="h-3.5 w-3.5" />
                </ToolbarButton>

                <Divider />

                {/* ─── Block Types ─── */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    title="Bullet List"
                >
                    <List className="h-3.5 w-3.5" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    title="Numbered List"
                >
                    <ListOrdered className="h-3.5 w-3.5" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    title="Quote"
                >
                    <Quote className="h-3.5 w-3.5" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    isActive={false}
                    title="Divider"
                >
                    <Minus className="h-3.5 w-3.5" />
                </ToolbarButton>
            </div>
        </BubbleMenu>
    );
}
