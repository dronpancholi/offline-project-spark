
import { AppLayout } from '@/components/layout/AppLayout';
import { TodayTasks } from '@/components/dashboard/TodayTasks';
import { ProgressSummary } from '@/components/dashboard/ProgressSummary';
import { TaskList } from '@/components/tasks/TaskList';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  const { tasks, completedTasks } = useApp();
  
  // Get recently completed tasks (last 5)
  const recentCompletedTasks = [...completedTasks]
    .sort((a, b) => 
      new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
    )
    .slice(0, 3);
  
  return (
    <AppLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="md:col-span-2 space-y-6">
          {/* Today's tasks section */}
          <TodayTasks />
          
          {/* Recent completed tasks */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Recent Completed</h2>
              <Link to="/tasks?tab=completed">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            
            {recentCompletedTasks.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {recentCompletedTasks.map(task => (
                  <div key={task.id} className="opacity-80">
                    {/* Use the TaskCard component with showCompleted prop */}
                    <TaskList tasks={recentCompletedTasks} showCompleted />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-card rounded-lg border">
                <p className="text-muted-foreground mb-4">No completed tasks yet</p>
                <Link to="/tasks/add">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Task
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Side column */}
        <div className="space-y-6">
          <ProgressSummary />

          {/* Quick add task card */}
          <div className="bg-card p-6 rounded-lg border text-center">
            <h3 className="font-medium mb-3">Ready to be productive?</h3>
            <Link to="/tasks/add">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Task
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
