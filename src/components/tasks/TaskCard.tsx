
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, isPast, isToday } from 'date-fns';
import { Check, Pencil, Trash2, MoreHorizontal, X } from 'lucide-react';
import { Task } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  showCompleted?: boolean;
}

export function TaskCard({ task, showCompleted = false }: TaskCardProps) {
  const { completeTask, uncompleteTask, deleteTask, categories } = useApp();
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Find category name
  const category = categories.find(c => c.id === task.category);
  const categoryName = category?.name || 'Other';
  
  // Format due date
  const formattedDate = task.dueDate 
    ? format(new Date(task.dueDate), 'MMM d, yyyy')
    : '';
  
  // Check if task is overdue
  const isOverdue = task.dueDate && !task.completed && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));

  // Handle task completion
  const handleCompleteTask = () => {
    setIsCompleting(true);
    setTimeout(() => {
      completeTask(task.id);
      setIsCompleting(false);
    }, 300);
  };
  
  return (
    <Card 
      className={cn(
        "task-card transition-all duration-300 overflow-hidden",
        isCompleting && "animate-task-complete opacity-50",
        task.completed && "opacity-80",
        isOverdue && "border-destructive"
      )}
      style={{ 
        borderLeftWidth: task.colorTag ? '4px' : undefined,
        borderLeftColor: task.colorTag || undefined 
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {task.title}
          </CardTitle>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/tasks/edit/${task.id}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {task.completed ? (
                <DropdownMenuItem onClick={() => uncompleteTask(task.id)}>
                  <X className="mr-2 h-4 w-4" />
                  Mark as Incomplete
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleCompleteTask}>
                  <Check className="mr-2 h-4 w-4" />
                  Mark as Complete
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => deleteTask(task.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Due date with optional warning for overdue tasks */}
        {task.dueDate && (
          <CardDescription
            className={cn(
              "flex items-center",
              isOverdue && "text-destructive"
            )}
          >
            <span>{formattedDate}</span>
            {task.dueTime && <span className="ml-1">at {task.dueTime}</span>}
            {isOverdue && <span className="ml-2 font-medium">(Overdue)</span>}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent>
        {task.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className={`priority-${task.priority}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </Badge>
          
          <Badge variant="outline" className={`intensity-${task.intensity}`}>
            {task.intensity.charAt(0).toUpperCase() + task.intensity.slice(1)}
          </Badge>
          
          <Badge variant="outline" className={`category-${task.category}`}>
            {categoryName}
          </Badge>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        {!showCompleted ? (
          <Button 
            onClick={handleCompleteTask} 
            className="w-full gap-2"
            size="sm"
          >
            <Check className="h-4 w-4" />
            Complete
          </Button>
        ) : (
          <div className="w-full text-xs text-muted-foreground">
            Completed: {task.completedAt && format(new Date(task.completedAt), 'MMM d, yyyy')}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
