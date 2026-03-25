import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, X, Zap, Target } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const PREDEFINED_PROMPTS = [
    { label: 'Summarize Page', icon: Sparkles, prompt: 'Summarize the current page for me.' },
    { label: 'Generate Tasks', icon: Zap, prompt: 'Extract actionable tasks from this content.' },
    { label: 'Check Schedule', icon: Target, prompt: 'Do I have any events for tomorrow?' },
];

export const ChatSidebar: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I am your AI workspace assistant. I can help you summarize pages, manage tasks, and check your calendar. What can I do for you today?',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async (content: string) => {
        if (!content.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `I've processed your request: "${content}". This is a mock response — AI API not yet connected.`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full w-[380px] bg-white text-black border-l border-black/10 shadow-2xl animate-in slide-in-from-right duration-300">

            {/* Header */}
            <header className="flex items-center justify-between px-5 py-4 border-b border-black/10 bg-black text-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white text-black">
                        <Bot size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-tight leading-none">Notion AI</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Online</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                    <X size={18} />
                </button>
            </header>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 bg-white">
                {messages.map((msg) => (
                    <div key={msg.id} className={cn(
                        "flex gap-3",
                        msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                    )}>
                        {/* Avatar */}
                        <div className={cn(
                            "w-8 h-8 flex items-center justify-center shrink-0 border-2 transition-all",
                            msg.role === 'assistant'
                                ? "bg-black text-white border-black"
                                : "bg-white text-black border-black"
                        )}>
                            {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                        </div>

                        {/* Bubble */}
                        <div className={cn(
                            "px-4 py-3 max-w-[85%] text-sm leading-relaxed border-2",
                            msg.role === 'assistant'
                                ? "bg-white text-black border-black/10"
                                : "bg-black text-white border-black"
                        )}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 bg-black text-white flex items-center justify-center border-2 border-black">
                            <Bot size={16} />
                        </div>
                        <div className="bg-white border-2 border-black/10 px-4 py-3 flex gap-1.5 items-center">
                            <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="p-4 bg-white border-t border-black/10">
                {/* Quick prompts */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {PREDEFINED_PROMPTS.map((p, i) => (
                        <button
                            key={i}
                            onClick={() => handleSend(p.prompt)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-black border-2 border-black/10 hover:bg-black hover:text-white hover:border-black transition-all uppercase tracking-wide"
                        >
                            <p.icon size={11} />
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Input */}
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                    className="flex border-2 border-black/10 focus-within:border-black transition-all"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask Notion AI..."
                        className="flex-1 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-black/25 text-black font-medium"
                    />
                    <button
                        type="submit"
                        className="px-4 bg-black text-white hover:bg-black/80 transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </form>
            </footer>
        </div>
    );
};
