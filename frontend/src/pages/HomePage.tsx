import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, 
    Calendar, 
    Timer, 
    PenTool, 
    ArrowUpRight, 
    FileText, 
    ChevronRight,
    Activity,
    Database,
    Clock
} from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';
import { usePages } from '@/hooks/usePages';
import { useProjects } from '@/hooks/useProjects';
import { cn } from '@/lib/utils';
import ProjectFooter from '@/components/ProjectFooter';

export default function HomePage() {
    const navigate = useNavigate();
    const { pages } = usePages();
    const { projects } = useProjects();
    const { openSearch } = useUIStore();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const recentPages = useMemo(() => {
        return [...pages]
            .sort((a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime())
            .slice(0, 4);
    }, [pages]);

    const tools = [
        {
            title: 'My Planner',
            description: 'Organize your schedule and tasks.',
            icon: <Calendar className="h-4 w-4" />,
            path: '/app/calendar',
            color: 'bg-white text-black dark:bg-black dark:text-white'
        },
        {
            title: 'Study Mode',
            description: 'Focused session with pomodoro',
            icon: <Timer className="h-4 w-4" />,
            path: '/app/study',
            color: 'bg-black text-white dark:bg-white dark:text-black'
        },
        {
            title: 'Whiteboard',
            description: 'Visualize your thoughts.',
            icon: <PenTool className="h-4 w-4" />,
            path: '/app/whiteboard',
            color: 'bg-white text-black dark:bg-black dark:text-white border-2 border-black dark:border-white'
        }
    ];

    const stats = [
        { label: 'Archives', value: pages.length, icon: <FileText size={12} /> },
        { label: 'Projects', value: projects.length, icon: <Database size={12} /> },
        { label: 'Uptime', value: '99.9%', icon: <Activity size={12} /> },
    ];

    return (
        <div className="flex h-full flex-col overflow-y-auto custom-scrollbar bg-white dark:bg-black selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black font-sans antialiased">
            <main className="flex-1 px-6 pt-10 pb-20 max-w-5xl mx-auto w-full">
                {/* Hero Section - Parallel Layout */}
                <div className="mb-10 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] font-black leading-[0.8] tracking-tighter uppercase select-none italic">
                            Motion.
                        </h1>
                        <div 
                            onClick={openSearch}
                            className="group relative flex h-12 w-full lg:w-96 items-center border border-black dark:border-white transition-all cursor-pointer hover:bg-black dark:hover:bg-white overflow-hidden active:scale-[0.98]"
                        >
                            <Search className="absolute left-4 h-4 w-4 text-black dark:text-white group-hover:text-white dark:group-hover:text-black" />
                            <span className="ml-12 text-[11px] font-black uppercase tracking-[0.25em] text-black dark:text-white group-hover:text-white dark:group-hover:text-black">
                                Universal Search
                            </span>
                        </div>
                    </div>
                    <p className="max-w-2xl text-xs sm:text-sm font-medium leading-relaxed text-black/40 dark:text-white/40 uppercase tracking-wide">
                        Motion redefines productivity as discipline — a high-performance workspace where projects, ideas, and focus converge into a single command system.
                    </p>
                </div>

                {/* Command Center / Ticker Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-14 border-y border-black/10 dark:border-white/10 py-8">
                    {/* Clock Module */}
                    <div className="col-span-1 md:col-span-2 flex flex-col justify-center gap-2 border-r border-black/10 dark:border-white/10 pr-6">
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] text-black/40 dark:text-white/40">
                            <Clock size={10} />
                            <span>Universal Time</span>
                        </div>
                        <div className="flex items-baseline justify-between gap-4">
                            <div className="text-4xl font-black tabular-nums tracking-tighter text-black dark:text-white">
                                {time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                            <div className="text-[11px] font-black tracking-widest text-black/30 dark:text-white/30 uppercase tabular-nums">
                                {time.toISOString().split('T')[0].split('-').join(' / ')}
                            </div>
                        </div>
                    </div>

                    {/* Stats Module */}
                    <div className="col-span-1 md:col-span-2 grid grid-cols-3 gap-4 pl-0 md:pl-6">
                        {stats.map((stat) => (
                            <div key={stat.label} className="flex flex-col justify-center gap-1 group">
                                <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.3em] text-black/30 dark:text-white/30 group-hover:text-black dark:group-hover:text-white transition-colors">
                                    {stat.icon}
                                    {stat.label}
                                </div>
                                <div className="text-xl font-black text-black dark:text-white tabular-nums">
                                    {stat.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Grid Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
                    {tools.map((tool) => (
                        <div 
                            key={tool.title}
                            onClick={() => navigate(tool.path)}
                            className={cn(
                                "group relative flex h-40 sm:h-48 flex-col justify-between border-2 border-black dark:border-white p-5 sm:p-6 transition-all cursor-pointer overflow-hidden backdrop-blur-sm",
                                tool.color === 'bg-black text-white dark:bg-white dark:text-black' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white text-black dark:bg-black dark:text-white',
                                "hover:scale-[1.01] active:scale-[0.99]"
                            )}
                        >
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="border border-current p-1.5 rounded-sm">
                                        {tool.icon}
                                    </div>
                                    <ArrowUpRight className="h-4 w-4 opacity-0 -translate-y-1 translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0" />
                                </div>
                                <h3 className="text-sm sm:text-base font-black uppercase tracking-tight">{tool.title}</h3>
                                <p className="text-[10px] sm:text-[11px] font-medium leading-snug opacity-70 line-clamp-2">{tool.description}</p>
                            </div>
                            <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.25em] opacity-40 group-hover:opacity-100 transition-opacity">
                                <span>Execute</span>
                                <ChevronRight className="h-2 w-2" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Section */}
                <div className="space-y-5">
                    <div className="flex items-center justify-between border-b border-black dark:border-white pb-2.5">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em]">Archive Repository</h2>
                        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-black/30 dark:text-white/30">Auto-Index Active</span>
                    </div>

                    {recentPages.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {recentPages.map((page) => (
                                <div 
                                    key={page.id}
                                    onClick={() => navigate(`/app/page/${page.id}`)}
                                    className="group flex flex-col gap-2.5 border border-black/5 dark:border-white/5 p-4 transition-all hover:border-black dark:hover:border-white cursor-pointer relative"
                                >
                                    <div className="flex h-7 w-7 items-center justify-center border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all font-bold text-xs uppercase">
                                        <FileText className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="font-bold truncate text-black dark:text-white uppercase tracking-tight text-[11px]">
                                            {page.title || 'Untitled Archive'}
                                        </h4>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-black/20 dark:text-white/20">
                                            {new Date(page.updated_at || page.created_at || '').toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="absolute top-3 right-3 text-[5px] font-black text-black/10 dark:text-white/10 uppercase group-hover:text-black/30 dark:group-hover:text-white/30">
                                        REF {page.id.slice(0, 4)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-20 items-center justify-center border border-dashed border-black/10 dark:border-white/10">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-black/20 dark:text-white/20 italic">No files in current archive</p>
                        </div>
                    )}
                </div>
            </main>

            <ProjectFooter />
        </div>
    );
}
