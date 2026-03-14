import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export const SLASH_MENU_KEY = new PluginKey('slashMenu');

export interface SlashMenuState {
    active: boolean;
    query: string;
    /** Position in the document where the '/' was typed */
    from: number;
}

export interface SlashMenuOptions {
    onOpen: (state: SlashMenuState) => void;
    onUpdate: (state: SlashMenuState) => void;
    onClose: () => void;
}

export const SlashMenuExtension = Extension.create<SlashMenuOptions>({
    name: 'slashMenu',

    addOptions() {
        return {
            onOpen: () => { },
            onUpdate: () => { },
            onClose: () => { },
        };
    },

    addProseMirrorPlugins() {
        const options = this.options;
        let slashFrom: number | null = null;

        return [
            new Plugin({
                key: SLASH_MENU_KEY,

                props: {
                    handleKeyDown(view, event) {
                        const { state } = view;
                        const { selection } = state;
                        const { $from } = selection;

                        // Escape: close
                        if (event.key === 'Escape' && slashFrom !== null) {
                            slashFrom = null;
                            options.onClose();
                            return false;
                        }

                        // Backspace: if query is empty close, else shorten query
                        if (event.key === 'Backspace' && slashFrom !== null) {
                            const currentPos = selection.from;
                            if (currentPos <= slashFrom) {
                                // Deleted the '/' itself
                                slashFrom = null;
                                options.onClose();
                            }
                            // Otherwise let the keydown proceed; the state update will re-derive the query
                            return false;
                        }

                        // '/' opens the menu — only at start of line or after space
                        if (event.key === '/') {
                            const textBefore = $from.parent.textContent.slice(
                                0,
                                $from.parentOffset
                            );
                            const isAtStart = textBefore.length === 0;
                            const isAfterSpace =
                                textBefore.length > 0 &&
                                textBefore[textBefore.length - 1] === ' ';

                            if (isAtStart || isAfterSpace) {
                                // We defer setting slashFrom until after the character is inserted
                                setTimeout(() => {
                                    const newState = view.state;
                                    slashFrom = newState.selection.from; // position AFTER the '/'
                                    options.onOpen({
                                        active: true,
                                        query: '',
                                        from: slashFrom,
                                    });
                                }, 0);
                            }
                            return false;
                        }

                        return false;
                    },
                },

                // After each transaction, update the query
                view() {
                    return {
                        update(view) {
                            if (slashFrom === null) return;

                            const { state } = view;
                            const { selection, doc } = state;
                            const currentPos = selection.from;

                            // If cursor moved before the slash position, close
                            if (currentPos < slashFrom) {
                                slashFrom = null;
                                options.onClose();
                                return;
                            }

                            // Extract the text between slashFrom and cursor (the query after '/')
                            const slashPos = slashFrom - 1; // position of '/'
                            if (slashPos < 0) {
                                slashFrom = null;
                                options.onClose();
                                return;
                            }

                            // Get the text of the current block
                            const $pos = doc.resolve(slashFrom);
                            const blockText = $pos.parent.textContent;
                            // The '/' is at parentOffset = slashFrom - $pos.start()
                            const slashOffset = slashFrom - $pos.start() - 1;

                            if (blockText[slashOffset] !== '/') {
                                // The '/' was deleted
                                slashFrom = null;
                                options.onClose();
                                return;
                            }

                            const query = blockText.slice(slashOffset + 1, currentPos - $pos.start());

                            options.onUpdate({
                                active: true,
                                query,
                                from: slashFrom,
                            });
                        },
                    };
                },
            }),
        ];
    },
});
