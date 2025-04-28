
import { AppLayout } from '@/components/layout/AppLayout';
import { CalendarView } from '@/components/calendar/CalendarView';

export default function CalendarPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <CalendarView />
      </div>
    </AppLayout>
  );
}
