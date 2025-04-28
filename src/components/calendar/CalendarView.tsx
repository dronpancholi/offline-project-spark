
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TaskCard } from '../tasks/TaskCard';
import { format, isSameDay, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth } from 'date-fns';
import { Link } from 'react-router-dom';
import { Plus, CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DayContentProps } from 'react-day-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Task } from '@/lib/storage';

type CalendarView = 'month' | 'week' | 'day';

export function CalendarView() {
  const { tasks } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));
  
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

  // Get completion status for a specific day
  const getCompletionStatus = (day: Date, tasksForDay: Task[]) => {
    if (tasksForDay.length === 0) return null;
    
    const completedTasks = tasksForDay.filter(task => task.completed);
    const allCompleted = completedTasks.length === tasksForDay.length;
    const someCompleted = completedTasks.length > 0;
    
    if (allCompleted) return 'completed';
    if (someCompleted) return 'partial';
    return 'pending';
  };

  // Render calendar day content with task indicator
  const renderDay = (date: Date) => {
    const dayTasks = getTasksForDay(date);
    const totalTasks = dayTasks.length;
    
    if (totalTasks === 0) return null;
    
    const completionStatus = getCompletionStatus(date, dayTasks);
    
    // Determine status color
    let bgColor = 'bg-priority-high'; // Red - all tasks pending
    if (completionStatus === 'completed') bgColor = 'bg-green-500'; // Green - all completed
    else if (completionStatus === 'partial') bgColor = 'bg-priority-medium'; // Yellow - partially completed

    return (
      <div className="flex flex-col items-center">
        {/* Dot indicator */}
        <div className={cn("w-1.5 h-1.5 rounded-full mt-1", bgColor)} />
        
        {/* Task count */}
        <span className="text-[0.6rem] mt-0.5">{totalTasks}</span>
      </div>
    );
  };
  
  // Navigate to previous/next week
  const navigateToPreviousWeek = () => {
    const prevWeek = new Date(weekStart);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setWeekStart(prevWeek);
  };
  
  const navigateToNextWeek = () => {
    const nextWeek = new Date(weekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setWeekStart(nextWeek);
  };
  
  // Generate days for the current week view
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(weekStart)
  });

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  // Handle drop on a day
  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
      // Logic to update task date will be implemented in AppContext
      console.log(`Moving task ${taskId} to ${format(date, 'yyyy-MM-dd')}`);
      // updateTaskDueDate(taskId, date.toISOString()) - would be implemented in AppContext
    }
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      {/* Calendar View Selector */}
      <div className="flex justify-between items-center">
        <Tabs value={view} onValueChange={(v) => setView(v as CalendarView)} className="w-auto">
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="day">Day</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Link to="/tasks/add">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        </Link>
      </div>
      
      <Tabs value={view} className="w-full">
        {/* Month View */}
        <TabsContent value="month" className="mt-0">
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
                    DayContent: (props: DayContentProps) => (
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
                  <Link to={`/tasks/add?date=${selectedDate?.toISOString()}`}>
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
        </TabsContent>
        
        {/* Week View */}
        <TabsContent value="week" className="mt-0">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <Button variant="outline" size="sm" onClick={navigateToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <h3 className="font-medium">
                {format(weekStart, 'MMM d')} - {format(endOfWeek(weekStart), 'MMM d, yyyy')}
              </h3>
              
              <Button variant="outline" size="sm" onClick={navigateToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {/* Day Headers */}
              {weekDays.map(day => (
                <div 
                  key={day.toString()} 
                  className={cn(
                    "text-center p-2 rounded-t-md font-medium",
                    isSameDay(day, new Date()) && "bg-primary/10"
                  )}
                >
                  <div className="text-xs text-muted-foreground">{format(day, 'EEE')}</div>
                  <div className="text-sm">{format(day, 'd')}</div>
                </div>
              ))}
              
              {/* Day Content */}
              {weekDays.map(day => {
                const dayTasks = getTasksForDay(day);
                const completionStatus = getCompletionStatus(day, dayTasks);
                
                return (
                  <div 
                    key={`content-${day.toString()}`}
                    className={cn(
                      "border rounded-b-md p-2 min-h-[150px] max-h-[400px] overflow-y-auto",
                      isSameDay(day, new Date()) && "bg-primary/5 border-primary/30",
                      !isSameMonth(day, selectedDate || new Date()) && "bg-muted/30 text-muted-foreground"
                    )}
                    onClick={() => setSelectedDate(day)}
                    onDrop={(e) => handleDrop(e, day)}
                    onDragOver={handleDragOver}
                  >
                    {dayTasks.length > 0 ? (
                      <div className="space-y-2">
                        {dayTasks.map(task => (
                          <div 
                            key={task.id}
                            className={cn(
                              "p-2 rounded-md text-xs cursor-pointer",
                              task.colorTag ? "border-l-4" : "border-l-2",
                              task.colorTag ? { borderLeftColor: task.colorTag } : { borderLeftColor: "#9B87F5" },
                              task.completed ? "bg-green-100 dark:bg-green-900/30" : "bg-card"
                            )}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                          >
                            <div className="font-medium line-clamp-1">{task.title}</div>
                            {task.dueTime && (
                              <div className="text-[10px] text-muted-foreground mt-1">{task.dueTime}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                        No tasks
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>
        
        {/* Day View */}
        <TabsContent value="day" className="mt-0">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const prevDay = new Date(selectedDate || new Date());
                  prevDay.setDate(prevDay.getDate() - 1);
                  setSelectedDate(prevDay);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <h3 className="font-medium">{formattedDate}</h3>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const nextDay = new Date(selectedDate || new Date());
                  nextDay.setDate(nextDay.getDate() + 1);
                  setSelectedDate(nextDay);
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {/* Time slots - simplified version */}
              {Array.from({ length: 24 }).map((_, i) => {
                const hour = i;
                const hourTasks = tasksForSelectedDate.filter(task => {
                  if (!task.dueTime) return false;
                  const taskHour = parseInt(task.dueTime.split(':')[0]);
                  return taskHour === hour;
                });
                
                return (
                  <div key={hour} className="flex gap-2">
                    <div className="w-16 text-right text-sm text-muted-foreground py-2">
                      {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                    </div>
                    <div className="flex-1 border-t border-dashed pt-2 min-h-[60px] relative">
                      {hourTasks.length > 0 ? (
                        hourTasks.map(task => (
                          <div 
                            key={task.id}
                            className={cn(
                              "p-2 mb-1 rounded-md text-xs",
                              task.colorTag ? "border-l-4" : "border-l-2",
                              task.colorTag ? { borderLeftColor: task.colorTag } : { borderLeftColor: "#9B87F5" },
                              task.completed ? "bg-green-100 dark:bg-green-900/30" : "bg-card"
                            )}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                          >
                            <div className="font-medium">{task.title}</div>
                            {task.dueTime && (
                              <div className="text-[10px] text-muted-foreground mt-1">
                                Due at {task.dueTime}
                              </div>
                            )}
                          </div>
                        ))
                      ) : null}
                    </div>
                  </div>
                );
              })}
              
              {/* If no tasks for the day */}
              {tasksForSelectedDate.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tasks scheduled for this day</p>
                  <Link to={`/tasks/add?date=${selectedDate?.toISOString()}`}>
                    <Button size="sm" variant="outline" className="mt-4">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Task
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
