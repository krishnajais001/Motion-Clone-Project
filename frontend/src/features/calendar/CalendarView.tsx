import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';
import { EventService } from '../../lib/services/event.service';
import type { Event } from '../../lib/services/event.service';
import { cn } from '../../lib/utils';

export const CalendarView: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await EventService.getAll({ 
                    start: startDate.toISOString(), 
                    end: endDate.toISOString() 
                });
                setEvents(data);
            } catch (err) {
                console.error('Failed to fetch events:', err);
            }
        };
        fetchEvents();
    }, [currentDate]);

    const firstDayOfMonth = startDate.getDay();

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const days = Array.from({ length: 42 }, (_, i) => {
        const day = i - firstDayOfMonth + 1;
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        return {
            date,
            isCurrentMonth: date.getMonth() === currentDate.getMonth(),
            isToday: date.toLocaleDateString() === new Date().toLocaleDateString(),
        };
    });

    const handleAddEvent = async (date: Date) => {
        const title = window.prompt(`Event for ${date.toLocaleDateString()}:`);
        if (!title) return;

        try {
            const start_time = new Date(date);
            start_time.setHours(9, 0, 0, 0);
            const end_time = new Date(date);
            end_time.setHours(10, 0, 0, 0);

            const newEvent = await EventService.create({ 
                title, 
                start_time: start_time.toISOString(), 
                end_time: end_time.toISOString() 
            });
            setEvents([...events, newEvent]);
        } catch (err) {
            console.error('Failed to create event:', err);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <header className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                        <CalendarIcon size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </h2>
                        <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mt-0.5">Your Schedule</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
                        <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-all active:scale-95">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-all border-x border-slate-100">
                            Today
                        </button>
                        <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-all active:scale-95">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-[0.98] transition-all">
                        <Plus size={18} />
                        Add Event
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/30">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">{day}</div>
                ))}
            </div>

            <div className="flex-1 grid grid-cols-7 grid-rows-6 auto-rows-fr bg-[#F8FAFC]">
                {days.map((day, idx) => {
                    const dayEvents = events.filter(e => new Date(e.start_time).toLocaleDateString() === day.date.toLocaleDateString());
                    
                    return (
                        <div 
                            key={idx} 
                            onClick={() => handleAddEvent(day.date)}
                            className={cn(
                                "group min-h-[140px] border-r border-b border-slate-100 p-3 flex flex-col transition-all hover:bg-white hover:z-10 hover:shadow-2xl hover:scale-[1.01] cursor-pointer",
                                !day.isCurrentMonth && "bg-slate-50/50 grayscale-[0.2]",
                                day.isToday && "bg-indigo-50/20"
                            )}
                        >
                            <span className={cn(
                                "w-9 h-9 flex items-center justify-center text-sm font-bold rounded-full mb-3 self-end transition-all",
                                day.isToday ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 ring-4 ring-indigo-50" : 
                                day.isCurrentMonth ? "text-slate-700" : "text-slate-300"
                            )}>
                                {day.date.getDate()}
                            </span>
                            
                            <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar pr-1">
                                {dayEvents.map(event => (
                                    <div 
                                        key={event.id}
                                        style={{ borderLeftColor: event.color }}
                                        className="text-[11px] font-bold px-2.5 py-2 rounded-lg bg-white border border-slate-200 border-l-[3px] shadow-sm flex items-center justify-between group/event hover:border-indigo-200 hover:shadow-md transition-all animate-in fade-in slide-in-from-top-1"
                                    >
                                        <div className="flex flex-col gap-0.5 min-w-0">
                                            <span className="text-slate-800 truncate leading-tight uppercase tracking-tight">{event.title}</span>
                                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                                <Clock size={10} />
                                                {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
