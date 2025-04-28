
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TaskCard } from '../tasks/TaskCard';
import { format, isSameDay, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { Plus, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CalendarView() {
  const { tasks } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Get tasks for the selected date
  const tasksForSelectedDate = selectedDate 
    ? tasks.filter(task => task.dueDate && isSameDay(parseISO(task.dueDate), selectedDate))
    : [];

  // Format selected date
  const formattedDate = selectedDate 
    ? format(selectedDate, 'EEEE, MMMM d, yyyy')
    : '';

  // Function to get task count for a specific day
  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => task.dueDate && isSameDay(parseISO(task.dueDate), day));
  };

  // Render calendar day content with task indicator
  const renderDay = (date: Date) => {
    const dayTasks = getTasksForDay(date);
    const totalTasks = dayTasks.length;
    
    if (totalTasks === 0) return null;
    
    const allComplete = totalTasks > 0 && dayTasks.every(task => task.completed);
    const someComplete = totalTasks > 0 && dayTasks.some(task => task.completed);
    
    // Determine status color
    let bgColor = 'bg-priority-high'; // Red - all tasks pending
    if (allComplete) bgColor = 'bg-green-500'; // Green - all completed
    else if (someComplete) bgColor = 'bg-priority-medium'; // Yellow - partially completed

    return (
      <div className="flex flex-col items-center">
        {/* Dot indicator */}
        <div className={cn("w-1.5 h-1.5 rounded-full mt-1", bgColor)} />
        
        {/* Task count */}
        <span className="text-[0.6rem] mt-0.5">{totalTasks}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar */}
        <div className="lg:w-1/2">
          <Card className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md"
              components={{
                DayContent: (props) => (
                  <>
                    <div>{format(props.date, 'd')}</div>
                    {renderDay(props.date)}
                  </>
                ),
              }}
            />
          </Card>
        </div>
        
        {/* Tasks for selected date */}
        <div className="lg:w-1/2">
          <Card className="h-full">
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <h3 className="font-medium">{formattedDate}</h3>
              </div>
              <Link to="/tasks/add">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Task
                </Button>
              </Link>
            </div>
            
            <div className="p-4 max-h-[500px] overflow-y-auto space-y-4">
              {tasksForSelectedDate.length > 0 ? (
                tasksForSelectedDate.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tasks scheduled for this day</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
