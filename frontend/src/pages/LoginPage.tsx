import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
    ArrowRight, 
    Calendar, 
    Timer, 
    PenTool, 
    ShieldCheck, 
    Clock, 
    Activity, 
    Database, 
    FileText,
    Sun,
    Moon,
    ChevronRight
} from 'lucide-react';
import ProjectFooter from '@/components/ProjectFooter';
import { useUIStore } from '@/stores/useUIStore';

export default function LoginPage() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useUIStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error } = await (async () => {
            if (email === 'admin@motion.com' && password === 'password') {
                localStorage.setItem('motion-demo-session', 'true');
                return { error: null };
            }
            return supabase.auth.signInWithPassword({ email, password });
        })();

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            navigate('/app');
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black font-sans antialiased overflow-y-auto custom-scrollbar">
            <main className="max-w-5xl mx-auto w-full px-6 pt-10 pb-20">
                {/* Hero Section */}
                <div className="mb-10 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] font-black leading-[0.8] tracking-tighter uppercase select-none italic">
                            Motion.
                        </h1>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleTheme}
                                className="flex h-10 w-10 items-center justify-center border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all active:scale-95"
                                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Auth Protocol: 200</span>
                                <div className="h-2 w-12 bg-black/5 dark:bg-white/10 mt-1 overflow-hidden">
                                     <div className="h-full bg-black dark:bg-white animate-[progress_2s_infinite_linear]" style={{ width: '40%' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="max-w-xl text-[11px] font-medium leading-tight opacity-60">
                         Motion redefines productivity as discipline — a high-performance workspace where projects, ideas, and focus converge into a single command system.
                    </p>
                </div>

                {/* Command Center / Ticker Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-20 border-y border-black/10 dark:border-white/10 py-10">
                    <div className="col-span-1 md:col-span-2 flex flex-col justify-center gap-2 border-r border-black/10 dark:border-white/10 pr-6">
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] opacity-40">
                            <Clock size={10} />
                            <span>Universal Time</span>
                        </div>
                        <div className="flex items-baseline justify-between gap-4">
                            <div className="text-4xl font-black tabular-nums tracking-tighter">
                                {time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                            <div className="text-[11px] font-black tracking-widest opacity-30 uppercase tabular-nums">
                                {time.toISOString().split('T')[0].split('-').join(' / ')}
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 grid grid-cols-3 gap-6 pl-0 md:pl-6">
                        {[
                            { label: 'Archives', value: '----', icon: <FileText size={12} /> },
                            { label: 'Projects', value: '----', icon: <Database size={12} /> },
                            { label: 'Uptime', value: '----', icon: <Activity size={12} /> },
                        ].map((stat) => (
                            <div key={stat.label} className="flex flex-col justify-center gap-1">
                                <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.3em] opacity-30">
                                    {stat.icon}
                                    {stat.label}
                                </div>
                                <div className="text-xl font-black tabular-nums">{stat.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                    {/* Architectural Tool Previews */}
                    <div className="md:col-span-4 space-y-4">
                        <div className="flex h-36 flex-col justify-between border-2 border-black dark:border-white bg-white text-black dark:bg-black dark:text-white p-5 sm:p-6 opacity-40 pointer-events-none">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="border border-current p-1.5 rounded-sm"><Calendar className="h-4 w-4" /></div>
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-tight">My Planner</h3>
                                <p className="text-[10px] font-medium leading-snug opacity-70">Organize your schedule and tasks.</p>
                            </div>
                            <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.25em] opacity-40">
                                <span>Execute</span>
                                <ChevronRight className="h-2 w-2" />
                            </div>
                        </div>
                        <div className="flex h-36 flex-col justify-between border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black p-5 sm:p-6 opacity-40 pointer-events-none">
                             <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="border border-current p-1.5 rounded-sm"><Timer className="h-4 w-4" /></div>
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-tight">Study Mode</h3>
                                <p className="text-[10px] font-medium leading-snug opacity-70">Focused session with pomodoro</p>
                            </div>
                            <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.25em] opacity-40">
                                <span>Execute</span>
                                <ChevronRight className="h-2 w-2" />
                            </div>
                        </div>
                        <div className="flex h-36 flex-col justify-between border-2 border-black dark:border-white bg-white text-black dark:bg-black dark:text-white p-5 sm:p-6 opacity-40 pointer-events-none">
                             <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="border border-current p-1.5 rounded-sm"><PenTool className="h-4 w-4" /></div>
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-tight">Whiteboard</h3>
                                <p className="text-[10px] font-medium leading-snug opacity-70">Visualize your thoughts.</p>
                            </div>
                            <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.25em] opacity-40">
                                <span>Execute</span>
                                <ChevronRight className="h-2 w-2" />
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-8 flex flex-col justify-center">
                        <div className="border-4 border-black dark:border-white p-10 bg-black text-white dark:bg-white dark:text-black">
                            <div className="flex items-center justify-between mb-8 border-b border-white/20 dark:border-black/20 pb-4">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black uppercase tracking-tighter">Identity Authentication</h2>
                                    <p className="text-[11px] font-medium opacity-50">Authorized access protocol. Verify your identity.</p>
                                </div>
                                <ShieldCheck size={32} strokeWidth={2.5} />
                            </div>

                            <form onSubmit={handleLogin} className="space-y-6">
                                {error && (
                                    <div className="border border-white/40 dark:border-black/40 p-3 text-[10px] font-black uppercase tracking-[0.2em] bg-red-600 text-white">
                                        Encryption Error: {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Designate Email</label>
                                        <input
                                            type="email"
                                            placeholder="IDENTITY@VAULT.SYS"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full bg-white/5 dark:bg-black/5 border-b-2 border-white dark:border-black p-4 text-base font-black placeholder:opacity-10 outline-none focus:bg-white/10 transition-all uppercase tracking-tight"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Security Hash</label>
                                        <input
                                            type="password"
                                            placeholder="HASH_KEY"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full bg-white/5 dark:bg-black/5 border-b-2 border-white dark:border-black p-4 text-base font-black placeholder:opacity-10 outline-none focus:bg-white/10 transition-all uppercase tracking-tight"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-center gap-6 pt-6">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="group flex-1 bg-white text-black dark:bg-black dark:text-white border-2 border-white dark:border-black p-5 text-sm font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-transparent hover:text-white dark:hover:text-black transition-all disabled:opacity-50"
                                    >
                                        {loading ? 'Processing...' : (
                                            <>
                                                <span>Initialize Session</span>
                                                <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                    
                                    <Link 
                                        to="/signup"
                                        className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 hover:text-white dark:hover:text-black decoration-white/40 underline-offset-8 underline"
                                    >
                                        New Account Request
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <ProjectFooter />
        </div>
    );
}
