import { useState } from 'react';
import { CalendarView } from '@/features/calendar/CalendarView';
import ProjectFooter from '@/components/ProjectFooter';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    return (
        <div className="h-full bg-white dark:bg-background text-black dark:text-white transition-colors duration-300 overflow-y-auto font-sans custom-scrollbar">
            <div className="max-w-5xl mx-auto px-6 py-8 lg:py-12">
                
                {/* Tactical Header */}
                <div className="mb-8 flex items-end justify-between border-b border-black dark:border-white pb-6">
                    <div className="flex items-center gap-6">
                        <div>
                            <h1 className="text-xl font-black tracking-tighter mb-1 uppercase">My Planner</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] opacity-80">
                                {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-1">
                            <button 
                                onClick={prevMonth}
                                className="p-1 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <button 
                                onClick={nextMonth}
                                className="p-1 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                        <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30">Universal Time</div>
                        <div className="text-sm font-black uppercase tracking-[0.2em] text-black dark:text-white tabular-nums">
                            {new Date().toISOString().split('T')[0].split('-').join(' / ')}
                        </div>
                    </div>
                </div>

                <div className="flex-1">
                    <CalendarView currentDate={currentDate} />
                </div>
            </div>
            <ProjectFooter />
        </div>
    );
}
