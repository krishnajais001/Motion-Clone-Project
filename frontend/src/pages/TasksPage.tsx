import { TaskBoard } from '@/features/tasks/TaskBoard';
import ProjectFooter from '@/components/ProjectFooter';

export default function TasksPage() {
    return (
        <div className="flex flex-col h-full bg-[#fcfcfc] dark:bg-background transition-colors duration-300">
            <header className="px-8 py-6 border-b border-slate-100 dark:border-white/10 bg-white dark:bg-transparent">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Workspace Tasks</h1>
                <p className="text-sm text-slate-400 dark:text-gray-400 mt-1">Manage your team's workflow across all pages</p>
            </header>
            <div className="flex-1 overflow-auto">
                <TaskBoard />
            </div>
            <ProjectFooter />
        </div>
    );
}
