"use client"

import { useCallback, useEffect, useRef, useState } from 'react';
import { EditorContent, EditorContext, useEditor } from '@tiptap/react';

// --- Tiptap Core Extensions ---
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { TextAlign } from '@tiptap/extension-text-align';
import { Typography } from '@tiptap/extension-typography';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Selection } from '@tiptap/extensions';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';

// --- Tiptap Node Extensions ---
import { ImageUploadNode } from '@/components/tiptap-node/image-upload-node/image-upload-node-extension';
import { HorizontalRule } from '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension';

// --- Tiptap Node Styles ---
import '@/components/tiptap-node/blockquote-node/blockquote-node.scss';
import '@/components/tiptap-node/code-block-node/code-block-node.scss';
import '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss';
import '@/components/tiptap-node/list-node/list-node.scss';
import '@/components/tiptap-node/image-node/image-node.scss';
import '@/components/tiptap-node/heading-node/heading-node.scss';
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss';

// --- UI Primitives ---
import { Spacer } from '@/components/tiptap-ui-primitive/spacer';
import {
    Toolbar,
    ToolbarGroup,
    ToolbarSeparator,
} from '@/components/tiptap-ui-primitive/toolbar';

// --- Tiptap UI Components ---
import { HeadingDropdownMenu } from '@/components/tiptap-ui/heading-dropdown-menu';
import { ImageUploadButton } from '@/components/tiptap-ui/image-upload-button';
import { ListDropdownMenu } from '@/components/tiptap-ui/list-dropdown-menu';
import { BlockquoteButton } from '@/components/tiptap-ui/blockquote-button';
import { CodeBlockButton } from '@/components/tiptap-ui/code-block-button';
import {
    ColorHighlightPopover,
} from '@/components/tiptap-ui/color-highlight-popover';
import {
    LinkPopover,
} from '@/components/tiptap-ui/link-popover';
import { MarkButton } from '@/components/tiptap-ui/mark-button';
import { UndoRedoButton } from '@/components/tiptap-ui/undo-redo-button';

// --- Slash Menu ---
import { SlashMenuExtension } from './SlashMenuExtension';
import { SlashMenu } from './SlashMenu';
import type { SlashMenuState } from './SlashMenuExtension';

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from '@/lib/tiptap-utils';

interface EditorProps {
    content: Record<string, unknown> | null;
    onUpdate?: (content: Record<string, unknown>) => void;
    editable?: boolean;
}

export function Editor({ content, onUpdate, editable = true }: EditorProps) {
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [slashMenuState, setSlashMenuState] = useState<SlashMenuState | null>(null);

    const handleSlashClose = useCallback(() => setSlashMenuState(null), []);

    const editor = useEditor({
        immediatelyRender: false,
        editorProps: {
            attributes: {
                autocomplete: 'off',
                autocorrect: 'off',
                autocapitalize: 'off',
                'aria-label': 'Page content editor',
                class: 'motion-editor',
            },
        },
        extensions: [
            StarterKit.configure({
                horizontalRule: false,
                heading: {
                    levels: [1, 2, 3],
                },
                link: {
                    openOnClick: false,
                    enableClickSelection: true,
                },
            }),
            HorizontalRule,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Highlight.configure({ multicolor: true }),
            Image,
            Typography,
            Superscript,
            Subscript,
            Selection,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            ImageUploadNode.configure({
                accept: 'image/*',
                maxSize: MAX_FILE_SIZE,
                limit: 3,
                upload: handleImageUpload,
                onError: (error) => console.error('Upload failed:', error),
            }),
            SlashMenuExtension.configure({
                onOpen: (state) => setSlashMenuState(state),
                onUpdate: (state) => setSlashMenuState(state),
                onClose: () => setSlashMenuState(null),
            }),
        ],
        content: content || undefined,
        editable,
        onUpdate: ({ editor }) => {
            // Debounced auto-save (1 second)
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            debounceRef.current = setTimeout(() => {
                const json = editor.getJSON();
                onUpdate?.(json as Record<string, unknown>);
            }, 1000);
        },
    });

    // Update editor content when content prop changes externally
    useEffect(() => {
        if (editor && content && !editor.isFocused) {
            const currentContent = JSON.stringify(editor.getJSON());
            const newContent = JSON.stringify(content);
            if (currentContent !== newContent) {
                editor.commands.setContent(content);
            }
        }
    }, [editor, content]);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return (
        <div className="motion-editor-wrapper">
            <EditorContext.Provider value={{ editor }}>
                <Toolbar ref={toolbarRef}>
                    <Spacer />

                    <ToolbarGroup>
                        <UndoRedoButton action="undo" />
                        <UndoRedoButton action="redo" />
                    </ToolbarGroup>

                    <ToolbarSeparator />

                    <ToolbarGroup>
                        <HeadingDropdownMenu levels={[1, 2, 3]} />
                        <ListDropdownMenu
                            types={['bulletList', 'orderedList', 'taskList']}
                        />
                        <BlockquoteButton />
                        <CodeBlockButton />
                    </ToolbarGroup>

                    <ToolbarSeparator />

                    <ToolbarGroup>
                        <MarkButton type="bold" />
                        <MarkButton type="italic" />
                        <MarkButton type="strike" />
                        <MarkButton type="code" />
                        <MarkButton type="underline" />
                        <ColorHighlightPopover />
                        <LinkPopover />
                    </ToolbarGroup>

                    <ToolbarSeparator />

                    <ToolbarGroup>
                        <MarkButton type="superscript" />
                        <MarkButton type="subscript" />
                    </ToolbarGroup>

                    <ToolbarSeparator />

                    <ToolbarGroup>
                        <ImageUploadButton text="Add" />
                    </ToolbarGroup>

                    <Spacer />
                </Toolbar>

                <EditorContent
                    editor={editor}
                    role="presentation"
                    className="motion-editor-content"
                />

                {/* Slash Menu portal */}
                {editor && (
                    <SlashMenu
                        editor={editor}
                        menuState={slashMenuState}
                        onClose={handleSlashClose}
                    />
                )}
            </EditorContext.Provider>
        </div>
    );
}
