import { useState } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface EmojiPickerProps {
    children: React.ReactNode;
    onEmojiSelect: (emoji: string) => void;
    onRemove?: () => void;
    hasIcon?: boolean;
}

export function EmojiPicker({ children, onEmojiSelect, onRemove, hasIcon }: EmojiPickerProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (emoji: any) => {
        onEmojiSelect(emoji.native);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent
                className="w-full p-0 border-none shadow-none bg-transparent flex flex-col items-center"
                align="start"
                side="bottom"
            >
                <div className="bg-white rounded-lg shadow-md border overflow-hidden">
                    <Picker
                        data={data}
                        onEmojiSelect={handleSelect}
                        theme="light"
                        navPosition="bottom"
                        previewPosition="none"
                    />
                    {hasIcon && onRemove && (
                        <div className="p-2 pt-0 w-full bg-white">
                            <button
                                onClick={() => {
                                    onRemove();
                                    setOpen(false);
                                }}
                                className="w-full flex items-center justify-center rounded-md px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 font-medium"
                            >
                                Remove icon
                            </button>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
