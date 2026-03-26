import { CalendarView } from '@/features/calendar/CalendarView';

export default function CalendarPage() {
    return (
        <div className="flex flex-col h-full bg-[#fcfcfc] dark:bg-background p-8 transition-colors duration-300">
            <CalendarView />
        </div>
    );
}
