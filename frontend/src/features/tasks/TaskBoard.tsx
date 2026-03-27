import React from 'react';
import { Plus, MoreHorizontal, Calendar as CalendarIcon, Flag, CheckCircle2, Circle } from 'lucide-react';
import type { TaskStatus } from '../../lib/services/task.service';
import { cn } from '../../lib/utils';
import { useTasks } from '@/hooks/useTasks';

const COLUMNS: { label: string; value: TaskStatus; color: string; dot: string }[] = [
    { label: 'To Do', value: 'todo', color: 'bg-slate-200/50 dark:bg-white/5', dot: 'bg-slate-400' },
    { label: 'In Progress', value: 'in-progress', color: 'bg-blue-100/50 dark:bg-blue-500/10', dot: 'bg-blue-500' },
    { label: 'Done', value: 'done', color: 'bg-emerald-100/50 dark:bg-emerald-500/10', dot: 'bg-emerald-500' },
    { label: 'Blocked', value: 'blocked', color: 'bg-rose-100/50 dark:bg-rose-500/10', dot: 'bg-rose-500' },
];

export const TaskBoard: React.FC<{ pageId?: string }> = ({ pageId }) => {
    const { 
        tasks, 
        isLoading, 
        createTask, 
        updateTask 
    } = useTasks(pageId);

    const handleAddTask = async (status: TaskStatus) => {
        const title = window.prompt('Task title:');
        if (!title) return;

        try {
            await createTask({ title, status, page_id: pageId });
        } catch (err) {
            console.error('Failed to create task:', err);
        }
    };

    const handleUpdateStatus = async (id: string, status: TaskStatus) => {
        try {
            await updateTask({ id, patch: { status } });
        } catch (err) {
            console.error('Failed to update task:', err);
        }
    };

    if (isLoading) return <div className="p-8 text-slate-400">Loading tasks...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 overflow-x-auto">
            {COLUMNS.map((column) => (
                <div key={column.value} className="flex flex-col min-w-[300px]">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <div className="flex items-center gap-2">
                            <span className={cn("inline-block w-2 h-2 rounded-full", column.dot)}></span>
                            <h3 className="font-semibold text-slate-700 dark:text-gray-200">{column.label}</h3>
                            <span className="text-sm text-slate-400 dark:text-gray-500 font-medium">
                                {tasks.filter((t: any) => t.status === column.value).length}
                            </span>
                        </div>
                        <button 
                            onClick={() => handleAddTask(column.value)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-md transition-colors text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-white"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    <div className={cn("flex flex-col gap-3 min-h-[500px] border-2 border-dashed border-slate-100 dark:border-white/5 rounded-xl p-2 transition-colors hover:border-slate-200 dark:hover:border-white/10", column.color)}>
                        {tasks
                            .filter((t: any) => t.status === column.value)
                            .map((task: any) => (
                                <div 
                                    key={task.id}
                                    className="group bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing hover:border-indigo-200 dark:hover:border-white/30"
                                >
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => handleUpdateStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
                                            className="mt-0.5 text-slate-300 dark:text-gray-600 hover:text-indigo-500 dark:hover:text-white transition-colors"
                                        >
                                            {task.status === 'done' ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Circle size={18} />}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={cn("text-sm font-medium text-slate-800 dark:text-white mb-2 truncate", task.status === 'done' && "line-through text-slate-400 dark:text-gray-600")}>
                                                {task.title}
                                            </h4>
                                            
                                            <div className="flex items-center gap-3 mt-3">
                                                {task.due_date && (
                                                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-gray-500 bg-slate-50 dark:bg-white/5 px-2 py-1 rounded-md border border-slate-100 dark:border-white/5">
                                                        <CalendarIcon size={12} />
                                                        {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </div>
                                                )}
                                                {task.priority !== 'none' && (
                                                    <div className={cn(
                                                        "flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md border",
                                                        task.priority === 'urgent' ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20" :
                                                        task.priority === 'high' ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-500/20" :
                                                        "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20"
                                                    )}>
                                                        <Flag size={12} />
                                                        {task.priority}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-md transition-all text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-white">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        
                        <button 
                            onClick={() => handleAddTask(column.value)}
                            className="flex items-center gap-2 w-full p-3 text-sm text-slate-400 dark:text-gray-500 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-slate-100 dark:hover:border-white/10 mt-auto"
                        >
                            <Plus size={16} />
                            New Task
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
