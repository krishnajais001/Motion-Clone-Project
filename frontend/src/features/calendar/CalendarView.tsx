import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, CheckCircle2, Circle, Pencil, X } from 'lucide-react';
import { EventService } from '../../lib/services/event.service';
import { TaskService } from '../../lib/services/task.service';
import type { Event } from '../../lib/services/event.service';
import type { Task } from '../../lib/services/task.service';
import { cn } from '../../lib/utils';

export const CalendarView: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Inline form state
    const [showTaskInput, setShowTaskInput] = useState(false);
    const [taskInput, setTaskInput] = useState('');
    
    // Inline edit state
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editTaskTitle, setEditTaskTitle] = useState('');

    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    useEffect(() => {
        const fetchEventsAndTasks = async () => {
            try {
                const [eventsData, tasksData] = await Promise.all([
                    EventService.getAll({ 
                        start: startDate.toISOString(), 
                        end: endDate.toISOString() 
                    }),
                    TaskService.getAll() 
                ]);
                setEvents(eventsData);
                setTasks(tasksData);
            } catch (err) {
                console.error('Failed to fetch data:', err);
            }
        };
        fetchEventsAndTasks();
    }, [currentDate]);

    const firstDayOfMonth = startDate.getDay();

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
    };

    const days = Array.from({ length: 42 }, (_, i) => {
        const day = i - firstDayOfMonth + 1;
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        return {
            date,
            isCurrentMonth: date.getMonth() === currentDate.getMonth(),
            isToday: date.toLocaleDateString() === new Date().toLocaleDateString(),
            isSelected: date.toLocaleDateString() === selectedDate.toLocaleDateString()
        };
    });

    const submitTask = async () => {
        if (!taskInput.trim()) {
            setShowTaskInput(false);
            return;
        }

        try {
            const _tempDate = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000));
            const newTask = await TaskService.create({ 
                title: taskInput, 
                status: 'todo',
                priority: 'medium',
                due_date: _tempDate.toISOString().split('T')[0],
                order_index: 0
            });
            setTasks([...tasks, newTask]);
            setTaskInput('');
            setShowTaskInput(false);
        } catch (err) {
            console.error('Failed to create task:', err);
        }
    };

    const toggleTaskStatus = async (task: Task) => {
        const newStatus = task.status === 'done' ? 'todo' : 'done';
        
        // Optimistic UI Update for instant feedback
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
        
        try {
            await TaskService.update(task.id, { status: newStatus });
        } catch (err) {
            console.error('Failed to update task:', err);
            // Revert on failure
            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: task.status } : t));
        }
    };

    const handleDeleteTask = async (task: Task) => {
        // Optimistic UI delete
        const originalTasks = [...tasks];
        setTasks(prev => prev.filter(t => t.id !== task.id));
        try {
            await TaskService.delete(task.id);
        } catch (err) {
            console.error('Failed to delete task:', err);
            setTasks(originalTasks);
        }
    };

    const startEditing = (task: Task) => {
        setEditingTaskId(task.id);
        setEditTaskTitle(task.title);
    };

    const saveEditTask = async () => {
        if (editingTaskId && editTaskTitle.trim()) {
            const task = tasks.find(t => t.id === editingTaskId);
            if (!task) return;
            const originalTitle = task.title;
            // Optimistic Update
            setTasks(prev => prev.map(t => t.id === editingTaskId ? { ...t, title: editTaskTitle.trim() } : t));
            setEditingTaskId(null);
            try {
                await TaskService.update(editingTaskId, { title: editTaskTitle.trim() });
            } catch (err) {
                console.error('Failed to rename task:', err);
                setTasks(prev => prev.map(t => t.id === editingTaskId ? { ...t, title: originalTitle } : t));
            }
        } else {
             setEditingTaskId(null);
        }
    };

    const selectedDateTasks = tasks.filter(t => {
        if (!t.due_date) return false;
        const taskDate = new Date(t.due_date);
        return taskDate.getDate() === selectedDate.getDate() && taskDate.getMonth() === selectedDate.getMonth() && taskDate.getFullYear() === selectedDate.getFullYear();
    });


    return (
        <div className="flex w-full h-full bg-white dark:bg-transparent border border-black dark:border-white/10 overflow-hidden relative font-sans transition-colors duration-300">
            {/* Calendar Main Portion */}
            <div className="flex-1 flex flex-col h-full border-r border-black dark:border-white/10">
                <header className="flex items-center justify-between px-8 py-6 border-b border-black dark:border-white/10 bg-white dark:bg-transparent">
                    <div className="flex items-center gap-4">
                        <div className="p-2 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded-md">
                            <CalendarIcon size={24} className="stroke-white dark:stroke-black" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-black text-black dark:text-white uppercase tracking-tight">
                                    {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                </h2>
                                <div className="flex items-center bg-gray-50 dark:bg-white/5 rounded border border-gray-200 dark:border-white/5 p-0.5">
                                    <button onClick={prevMonth} className="p-0.5 hover:bg-white dark:hover:bg-white/10 rounded-[4px] text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors hover:shadow-sm">
                                        <ChevronLeft size={16} className="stroke-[3px]" />
                                    </button>
                                    <button onClick={nextMonth} className="p-0.5 hover:bg-white dark:hover:bg-white/10 rounded-[4px] text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors hover:shadow-sm">
                                        <ChevronRight size={16} className="stroke-[3px]" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold tracking-widest uppercase mt-0.5">Your Schedule</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-7 border-b border-black dark:border-white/10 bg-gray-50/50 dark:bg-transparent">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-3 text-center text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest border-r border-black/10 dark:border-white/5 last:border-r-0">{day}</div>
                    ))}
                </div>

                <div className="flex-1 grid grid-cols-7 grid-rows-6 auto-rows-fr bg-gray-50/20 dark:bg-transparent">
                    {days.map((day, idx) => {
                        const dayEvents = events.filter(e => new Date(e.start_time).toLocaleDateString() === day.date.toLocaleDateString());
                        const dayTasks = tasks.filter(t => t.due_date && new Date(t.due_date).toLocaleDateString() === day.date.toLocaleDateString());
                        
                        return (
                            <div 
                                key={idx} 
                                onClick={() => handleDayClick(day.date)}
                                className={cn(
                                    "group min-h-0 border-r border-b border-black dark:border-white/10 p-2 flex flex-col justify-center items-center transition-all cursor-pointer relative bg-white dark:bg-transparent overflow-hidden",
                                    !day.isCurrentMonth && "bg-gray-50/50 dark:bg-white/5",
                                    day.isToday && !day.isSelected && "bg-gray-100 dark:bg-white/10 ring-1 ring-inset ring-black/10 dark:ring-white/10",
                                    day.isSelected ? "z-10 bg-white dark:bg-transparent" : "hover:bg-gray-50 dark:hover:bg-white/5"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 flex items-center justify-center rounded-full transition-all",
                                    day.isSelected ? "bg-black dark:bg-white text-white dark:text-black" : "text-black dark:text-white",
                                    !day.isCurrentMonth && !day.isSelected && "text-gray-300 dark:text-gray-600",
                                    day.isToday && !day.isSelected && "ring-2 ring-black dark:ring-white font-black"
                                )}>
                                    <span className={cn("text-lg font-bold")}>
                                        {day.date.getDate()}
                                    </span>
                                </div>
                                
                                <div className="flex gap-1.5 items-center mt-2 h-2">
                                    {(dayTasks.length > 0) && <div className={cn("w-1.5 h-1.5 rounded-full bg-black dark:bg-white")}></div>}
                                    {(dayEvents.length > 0) && <div className={cn("w-1.5 h-1.5 rounded-full border border-black dark:border-white bg-transparent")}></div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar To-Do List */}
            <div className="w-[340px] bg-white dark:bg-transparent flex flex-col h-full z-20 border-l border-black dark:border-white/10">
                <div className="px-6 py-8 border-b border-black dark:border-white/10 bg-white dark:bg-transparent">
                    <h3 className="text-2xl font-black text-black dark:text-white tracking-tight uppercase">
                        {selectedDate.toLocaleDateString(undefined, { weekday: 'long' })}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-bold tracking-widest uppercase mt-1">{selectedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
                    {/* Tasks for selected day */}
                    <div>
                        <div className="flex items-center justify-between mb-4 border-b border-black/10 dark:border-white/10 pb-2">
                            <h4 className="text-xs font-black text-black dark:text-white uppercase tracking-widest flex items-center">
                                Tasklist <span className="bg-black dark:bg-white text-white dark:text-black rounded-full px-2 py-0.5 text-[10px] ml-2">{selectedDateTasks.length}</span>
                            </h4>
                            <button onClick={() => setShowTaskInput(true)} title="Add Task" className="text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 p-1 rounded transition-all">
                                <Plus size={16} className="stroke-[3px]" />
                            </button>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            {selectedDateTasks.length === 0 && !showTaskInput && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest py-2">No tasks remaining.</p>
                            )}
                            
                            {selectedDateTasks.map(task => (
                                <div key={task.id} className="p-3 bg-white dark:bg-transparent border border-gray-200 dark:border-white/10 rounded flex items-start gap-3 group transition-all hover:border-black dark:hover:border-white/30 cursor-default">
                                    <button onClick={() => toggleTaskStatus(task)} className="text-gray-300 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors shrink-0 mt-px">
                                        {task.status === 'done' ? <CheckCircle2 size={16} className="text-black dark:text-white"/> : <Circle size={16} className="dark:text-gray-400" />}
                                    </button>
                                    <div className="flex flex-col flex-1 min-w-0 justify-center">
                                        {editingTaskId === task.id ? (
                                            <input
                                                type="text"
                                                autoFocus
                                                value={editTaskTitle}
                                                onChange={(e) => setEditTaskTitle(e.target.value)}
                                                onBlur={saveEditTask}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') saveEditTask();
                                                    if (e.key === 'Escape') setEditingTaskId(null);
                                                }}
                                                className="text-sm font-bold text-black dark:text-white border-b border-black dark:border-white/20 outline-none bg-transparent py-0.5"
                                            />
                                        ) : (
                                            <p className={cn(
                                                "text-sm font-bold truncate transition-all",
                                                task.status === 'done' ? "text-gray-400 dark:text-gray-500 line-through" : "text-black dark:text-gray-200"
                                            )}>
                                                {task.title}
                                            </p>
                                        )}
                                    </div>
                                    {editingTaskId !== task.id && (
                                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity shrink-0">
                                            <button onClick={() => startEditing(task)} className="p-1.5 text-black dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors" title="Rename Task">
                                                <Pencil size={14} className="stroke-[2.5px]"/>
                                            </button>
                                            <button onClick={() => handleDeleteTask(task)} className="p-1.5 text-black dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors" title="Delete Task">
                                                <X size={16} className="stroke-[2.5px]"/>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Inline Task Input */}
                            {showTaskInput && (
                                <div className="p-3 bg-gray-50 dark:bg-white/5 border border-black dark:border-white/30 border-dashed flex items-center gap-3">
                                    <Circle size={16} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
                                    <input 
                                        autoFocus
                                        type="text"
                                        className="w-full text-sm font-bold text-black dark:text-white border-none outline-none bg-transparent placeholder-gray-400 dark:placeholder-gray-600"
                                        placeholder="What needs to be done?"
                                        value={taskInput}
                                        onChange={e => setTaskInput(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') submitTask();
                                            if (e.key === 'Escape') { setShowTaskInput(false); setTaskInput(''); }
                                        }}
                                        onBlur={submitTask}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="p-6 bg-white dark:bg-transparent border-t border-black/10 dark:border-white/10 mt-auto">
                    <button onClick={() => setShowTaskInput(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-black dark:bg-white/5 dark:border dark:border-white/10 text-white rounded-md text-sm font-black tracking-widest uppercase hover:bg-gray-800 dark:hover:bg-white dark:hover:text-black transition-all">
                        <Plus size={18} className="stroke-[3px]" /> New Task
                    </button>
                </div>
            </div>
        </div>
    );
};
