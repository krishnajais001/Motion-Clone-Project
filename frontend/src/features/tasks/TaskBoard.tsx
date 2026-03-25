import React, { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Calendar as CalendarIcon, Flag, CheckCircle2, Circle } from 'lucide-react';
import { TaskService } from '../../lib/services/task.service';
import type { Task, TaskStatus } from '../../lib/services/task.service';
import { cn } from '../../lib/utils';

const COLUMNS: { label: string; value: TaskStatus; color: string }[] = [
    { label: 'To Do', value: 'todo', color: 'bg-slate-200/50' },
    { label: 'In Progress', value: 'in-progress', color: 'bg-blue-100/50' },
    { label: 'Done', value: 'done', color: 'bg-emerald-100/50' },
    { label: 'Blocked', value: 'blocked', color: 'bg-rose-100/50' },
];

export const TaskBoard: React.FC<{ pageId?: string }> = ({ pageId }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const data = await TaskService.getAll({ page_id: pageId });
                setTasks(data);
            } catch (err) {
                console.error('Failed to fetch tasks:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, [pageId]);

    const handleAddTask = async (status: TaskStatus) => {
        const title = window.prompt('Task title:');
        if (!title) return;

        try {
            const newTask = await TaskService.create({ title, status, page_id: pageId });
            setTasks([...tasks, newTask]);
        } catch (err) {
            console.error('Failed to create task:', err);
        }
    };

    const handleUpdateStatus = async (id: string, status: TaskStatus) => {
        try {
            const updatedTask = await TaskService.update(id, { status });
            setTasks(tasks.map(t => t.id === id ? updatedTask : t));
        } catch (err) {
            console.error('Failed to update task:', err);
        }
    };

    if (loading) return <div className="p-8 text-slate-400">Loading tasks...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 overflow-x-auto">
            {COLUMNS.map((column) => (
                <div key={column.value} className="flex flex-col min-w-[300px]">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <div className="flex items-center gap-2">
                            <span className={cn("inline-block w-2.5 h-2.5 rounded-full", column.color.replace('/50', ''))}></span>
                            <h3 className="font-semibold text-slate-700">{column.label}</h3>
                            <span className="text-sm text-slate-400 font-medium">
                                {tasks.filter(t => t.status === column.value).length}
                            </span>
                        </div>
                        <button 
                            onClick={() => handleAddTask(column.value)}
                            className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-400"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    <div className="flex flex-col gap-3 min-h-[500px] border-2 border-dashed border-slate-100 rounded-xl p-2 transition-colors hover:border-slate-200">
                        {tasks
                            .filter((t) => t.status === column.value)
                            .map((task) => (
                                <div 
                                    key={task.id}
                                    className="group bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing hover:border-indigo-200"
                                >
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => handleUpdateStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
                                            className="mt-0.5 text-slate-300 hover:text-indigo-500 transition-colors"
                                        >
                                            {task.status === 'done' ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Circle size={18} />}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={cn("text-sm font-medium text-slate-800 mb-2 truncate", task.status === 'done' && "line-through text-slate-400")}>
                                                {task.title}
                                            </h4>
                                            
                                            <div className="flex items-center gap-3 mt-3">
                                                {task.due_date && (
                                                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                        <CalendarIcon size={12} />
                                                        {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </div>
                                                )}
                                                {task.priority !== 'none' && (
                                                    <div className={cn(
                                                        "flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md border",
                                                        task.priority === 'urgent' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                        task.priority === 'high' ? "bg-orange-50 text-orange-600 border-orange-100" :
                                                        "bg-indigo-50 text-indigo-600 border-indigo-100"
                                                    )}>
                                                        <Flag size={12} />
                                                        {task.priority}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded-md transition-all text-slate-400">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        
                        <button 
                            onClick={() => handleAddTask(column.value)}
                            className="flex items-center gap-2 w-full p-3 text-sm text-slate-400 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100 mt-auto"
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
