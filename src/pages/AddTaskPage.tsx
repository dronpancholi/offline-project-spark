
import { AppLayout } from '@/components/layout/AppLayout';
import { TaskForm } from '@/components/tasks/TaskForm';

export default function AddTaskPage() {
  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-6">Add New Task</h1>
      <TaskForm />
    </AppLayout>
  );
}
