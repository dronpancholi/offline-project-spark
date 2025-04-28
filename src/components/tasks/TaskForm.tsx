
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Task } from '@/lib/storage';

interface TaskFormProps {
  existingTask?: Task;
}

export function TaskForm({ existingTask }: TaskFormProps) {
  const navigate = useNavigate();
  const { addTask, updateTask, categories } = useApp();
  
  const [formData, setFormData] = useState<Omit<Task, 'id' | 'createdAt' | 'completed' | 'completedAt'>>({
    title: existingTask?.title || '',
    description: existingTask?.description || '',
    dueDate: existingTask?.dueDate,
    dueTime: existingTask?.dueTime,
    priority: existingTask?.priority || 'medium',
    intensity: existingTask?.intensity || 'medium',
    category: existingTask?.category || 'work',
    colorTag: existingTask?.colorTag,
    reminder: existingTask?.reminder
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    formData.dueDate ? new Date(formData.dueDate) : undefined
  );

  // Colors for color tag selection
  const colorOptions = [
    '#FF5A5A', // Red
    '#FFBD59', // Orange
    '#FFDF5A', // Yellow
    '#5AFF5A', // Green
    '#59B0FF', // Blue
    '#9B87f5', // Purple
    '#FF5AE8', // Pink
    '#5AFFFF', // Cyan
  ];

  const validateForm = () => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (existingTask) {
        updateTask({
          ...existingTask,
          ...formData
        });
      } else {
        addTask(formData);
      }
      navigate('/tasks');
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setFormData(prev => ({
        ...prev,
        dueDate: date.toISOString()
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        dueDate: undefined
      }));
    }
  };

  return (
    <Card className="animate-fade-in">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{existingTask ? 'Edit Task' : 'Create New Task'}</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Task Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title"
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          {/* Priority & Intensity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority}
                onValueChange={value => setFormData(prev => ({ 
                  ...prev, 
                  priority: value as 'high' | 'medium' | 'low'
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="intensity">Task Intensity</Label>
              <Select 
                value={formData.intensity}
                onValueChange={value => setFormData(prev => ({ 
                  ...prev, 
                  intensity: value as 'small' | 'medium' | 'big' | 'giant' | 'optional'
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select intensity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (+5 points)</SelectItem>
                  <SelectItem value="medium">Medium (+10 points)</SelectItem>
                  <SelectItem value="big">Big (+20 points)</SelectItem>
                  <SelectItem value="giant">Giant (+40 points)</SelectItem>
                  <SelectItem value="optional">Optional (+2 points)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Select date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueTime">Due Time</Label>
              <Input
                id="dueTime"
                type="time"
                value={formData.dueTime || ''}
                onChange={e => setFormData(prev => ({ ...prev, dueTime: e.target.value }))}
              />
            </div>
          </div>

          {/* Category & Color Tag */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category}
                onValueChange={value => setFormData(prev => ({ 
                  ...prev, 
                  category: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Color Tag</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {colorOptions.map((color, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-8 rounded-full cursor-pointer transform transition-transform",
                      formData.colorTag === color ? "ring-2 ring-primary scale-110" : "hover:scale-105"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData(prev => ({ ...prev, colorTag: color }))}
                  />
                ))}
                
                {/* Clear color option */}
                {formData.colorTag && (
                  <div
                    className="h-8 rounded-full cursor-pointer border border-dashed border-muted-foreground flex items-center justify-center"
                    onClick={() => setFormData(prev => ({ ...prev, colorTag: undefined }))}
                  >
                    <span className="text-xs text-muted-foreground">Clear</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reminder */}
          <div className="space-y-2">
            <Label htmlFor="reminder">Reminder</Label>
            <Select 
              value={formData.reminder || ""}
              onValueChange={value => setFormData(prev => ({ 
                ...prev, 
                reminder: value || undefined
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Set a reminder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No reminder</SelectItem>
                <SelectItem value="5">5 minutes before</SelectItem>
                <SelectItem value="15">15 minutes before</SelectItem>
                <SelectItem value="30">30 minutes before</SelectItem>
                <SelectItem value="60">1 hour before</SelectItem>
                <SelectItem value="1440">1 day before</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => navigate('/tasks')}>
            Cancel
          </Button>
          <Button type="submit">
            {existingTask ? 'Update Task' : 'Create Task'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
