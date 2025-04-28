
import { AppLayout } from '@/components/layout/AppLayout';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AddTaskPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Add New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskForm />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
