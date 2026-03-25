import { TaskBoard } from '@/features/tasks/TaskBoard';

export default function TasksPage() {
    return (
        <div className="flex flex-col h-full bg-[#fcfcfc]">
            <header className="px-8 py-6 border-b border-slate-100 bg-white">
                <h1 className="text-2xl font-bold text-slate-800">Workspace Tasks</h1>
                <p className="text-sm text-slate-400 mt-1">Manage your team's workflow across all pages</p>
            </header>
            <div className="flex-1 overflow-auto">
                <TaskBoard />
            </div>
        </div>
    );
}
