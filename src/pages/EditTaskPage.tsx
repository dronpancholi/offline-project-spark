
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { TaskForm } from '@/components/tasks/TaskForm';
import { useApp } from '@/contexts/AppContext';
import { Task } from '@/lib/storage';

export default function EditTaskPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const { tasks, completedTasks } = useApp();
  const navigate = useNavigate();
  
  const [task, setTask] = useState<Task | undefined>(undefined);
  
  useEffect(() => {
    if (taskId) {
      // Look for the task in both active and completed tasks
      const foundTask = [...tasks, ...completedTasks].find(t => t.id === taskId);
      
      if (foundTask) {
        setTask(foundTask);
      } else {
        // Task not found, redirect to tasks page
        navigate('/tasks');
      }
    }
  }, [taskId, tasks, completedTasks, navigate]);
  
  if (!task) {
    return (
      <AppLayout>
        <div className="text-center py-12">Loading...</div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-6">Edit Task</h1>
      <TaskForm existingTask={task} />
    </AppLayout>
  );
}
