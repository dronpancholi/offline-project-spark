
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
import { CalendarIcon, Plus, TrashIcon, Check } from 'lucide-react';
import { Task, ChecklistItem } from '@/lib/storage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

interface TaskFormProps {
  existingTask?: Task;
}

export function TaskForm({ existingTask }: TaskFormProps) {
  const navigate = useNavigate();
  const { addTask, updateTask, categories, addChecklistItem, removeChecklistItem, toggleChecklistItem } = useApp();
  
  const [formData, setFormData] = useState<Omit<Task, 'id' | 'createdAt' | 'completed' | 'completedAt'>>({
    title: existingTask?.title || '',
    description: existingTask?.description || '',
    dueDate: existingTask?.dueDate,
    dueTime: existingTask?.dueTime,
    priority: existingTask?.priority || 'medium',
    intensity: existingTask?.intensity || 'medium',
    category: existingTask?.category || 'work',
    colorTag: existingTask?.colorTag,
    reminder: existingTask?.reminder,
    checklist: existingTask?.checklist || [],
    notes: existingTask?.notes || '',
    repeat: existingTask?.repeat || 'none',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    formData.dueDate ? new Date(formData.dueDate) : undefined
  );
  
  // For checklist
  const [newChecklistItem, setNewChecklistItem] = useState('');

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
  
  // Handle adding a checklist item
  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim() && existingTask) {
      addChecklistItem(existingTask.id, newChecklistItem.trim());
      setNewChecklistItem('');
    } else if (newChecklistItem.trim()) {
      const newItem: ChecklistItem = {
        id: crypto.randomUUID(),
        text: newChecklistItem.trim(),
        completed: false
      };
      
      setFormData(prev => ({
        ...prev,
        checklist: [...(prev.checklist || []), newItem]
      }));
      
      setNewChecklistItem('');
    }
  };
  
  // Handle removing a checklist item
  const handleRemoveChecklistItem = (itemId: string) => {
    if (existingTask) {
      removeChecklistItem(existingTask.id, itemId);
    } else {
      setFormData(prev => ({
        ...prev,
        checklist: (prev.checklist || []).filter(item => item.id !== itemId)
      }));
    }
  };
  
  // Handle toggling a checklist item
  const handleToggleChecklistItem = (itemId: string) => {
    if (existingTask) {
      toggleChecklistItem(existingTask.id, itemId);
    } else {
      setFormData(prev => ({
        ...prev,
        checklist: (prev.checklist || []).map(item => 
          item.id === itemId ? { ...item, completed: !item.completed } : item
        )
      }));
    }
  };

  return (
    <Card className="animate-fade-in">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{existingTask ? 'Edit Task' : 'Create New Task'}</CardTitle>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="checklist">Checklist</TabsTrigger>
            </TabsList>
            
            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
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
            </TabsContent>
            
            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
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

              {/* Repeat Pattern */}
              <div className="space-y-2">
                <Label htmlFor="repeat">Repeat Pattern</Label>
                <Select 
                  value={formData.repeat || 'none'}
                  onValueChange={value => setFormData(prev => ({ 
                    ...prev, 
                    repeat: value as 'none' | 'daily' | 'weekly' | 'monthly'
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select repeat pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Don't repeat</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
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
              
              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any additional notes or information"
                  rows={4}
                />
              </div>
            </TabsContent>
            
            {/* Checklist Tab */}
            <TabsContent value="checklist" className="space-y-6">
              <div className="space-y-4">
                <Label>Task Checklist</Label>
                
                {/* Add checklist item */}
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Add a checklist item"
                    value={newChecklistItem}
                    onChange={e => setNewChecklistItem(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddChecklistItem();
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddChecklistItem}
                    disabled={!newChecklistItem.trim()}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Checklist items */}
                {formData.checklist && formData.checklist.length > 0 ? (
                  <div className="space-y-2 mt-4">
                    {formData.checklist.map((item, index) => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant={item.completed ? "default" : "outline"}
                            size="sm"
                            className="w-6 h-6 p-0 rounded-full"
                            onClick={() => handleToggleChecklistItem(item.id)}
                          >
                            {item.completed && <Check className="h-3 w-3" />}
                          </Button>
                          <span className={cn(
                            item.completed && "line-through text-muted-foreground"
                          )}>
                            {item.text}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveChecklistItem(item.id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground bg-secondary/20 rounded-lg">
                    <p>No checklist items added yet</p>
                    <p className="text-sm">Add items to break down this task into smaller steps</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
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
