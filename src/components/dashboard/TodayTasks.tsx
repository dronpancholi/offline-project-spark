
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TaskCard } from '../tasks/TaskCard';
import { Link } from 'react-router-dom';
import { isToday, isPast, parseISO } from 'date-fns';
import { Plus, CheckCircle } from 'lucide-react';

export function TodayTasks() {
  const { tasks } = useApp();
  
  // Filter tasks for today only
  const todayTasks = tasks.filter(task => 
    task.dueDate && isToday(parseISO(task.dueDate))
  );

  // Get overdue tasks (past due date and not completed)
  const overdueTasks = tasks.filter(task => 
    task.dueDate && !isToday(parseISO(task.dueDate)) && isPast(parseISO(task.dueDate))
  );

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Today's Tasks</CardTitle>
        <Link to="/tasks/add">
          <Button size="sm" className="h-8 gap-1">
            <Plus className="h-4 w-4" />
            <span>Add</span>
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {todayTasks.length > 0 ? (
          <div className="grid gap-3 max-h-[350px] overflow-y-auto pr-1">
            {todayTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <h3 className="font-medium">No tasks for today</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add a task to get started
            </p>
            <Link to="/tasks/add">
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Add Task
              </Button>
            </Link>
          </div>
        )}

        {/* Overdue tasks section */}
        {overdueTasks.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-destructive mb-3">
              Overdue Tasks ({overdueTasks.length})
            </h3>
            <div className="grid gap-3 max-h-[200px] overflow-y-auto pr-1">
              {overdueTasks.slice(0, 3).map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
              
              {overdueTasks.length > 3 && (
                <Link to="/tasks" className="text-center text-sm text-muted-foreground hover:underline">
                  View all {overdueTasks.length} overdue tasks
                </Link>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
