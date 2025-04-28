
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
import { Check, Pencil, Trash2, MoreHorizontal, X, Clock } from 'lucide-react';
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
  
  // Format start date if available
  const formattedStartDate = task.startDate
    ? format(new Date(task.startDate), 'MMM d, yyyy')
    : '';
    
  // Check if task is overdue
  const isOverdue = task.dueDate && !task.completed && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));

  // Get status color
  const getStatusColor = () => {
    if (task.completed) return "bg-green-500";
    if (task.status === 'in-progress') return "bg-blue-500";
    if (task.status === 'overdue' || isOverdue) return "bg-red-500";
    if (task.status === 'missed') return "bg-amber-500";
    return "bg-gray-400"; // default for scheduled
  };

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
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", getStatusColor())} />
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {task.title}
            </CardTitle>
          </div>
          
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
        
        {/* Start date/time if available */}
        {task.startDate && (
          <CardDescription className="flex items-center mt-1">
            <Clock className="h-3 w-3 mr-1" />
            <span>Starts: {formattedStartDate}</span>
            {task.startTime && <span className="ml-1">at {task.startTime}</span>}
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
          
          {task.repeat && task.repeat !== 'none' && (
            <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30">
              {task.repeat.charAt(0).toUpperCase() + task.repeat.slice(1)}
            </Badge>
          )}
          
          {/* Show tags if available */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 w-full">
              {task.tags.slice(0, 3).map(tag => (
                <span 
                  key={tag} 
                  className="text-xs bg-secondary/50 px-1.5 py-0.5 rounded text-secondary-foreground"
                >
                  #{tag}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="text-xs bg-secondary/30 px-1.5 py-0.5 rounded text-secondary-foreground">
                  +{task.tags.length - 3} more
                </span>
              )}
            </div>
          )}
          
          {/* Show checklist summary if available */}
          {task.checklist && task.checklist.length > 0 && (
            <div className="w-full mt-2 text-xs text-muted-foreground">
              {task.checklist.filter(item => item.completed).length} of {task.checklist.length} items completed
            </div>
          )}
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
