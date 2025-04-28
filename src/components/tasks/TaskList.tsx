
import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Task } from '@/lib/storage';
import { TaskCard } from './TaskCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Search, Filter, Trash2, CheckSquare, ArrowRightCircle } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface TaskListProps {
  tasks: Task[];
  showCompleted?: boolean;
}

export function TaskList({ tasks, showCompleted = false }: TaskListProps) {
  const { categories, bulkDeleteTasks, bulkCompleteTasks, bulkChangePriority, bulkChangeCategory } = useApp();
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('dueDate');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [intensityFilter, setIntensityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Selection state
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  
  // Dialog states
  const [bulkCategoryDialogOpen, setBulkCategoryDialogOpen] = useState(false);
  const [bulkPriorityDialogOpen, setBulkPriorityDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<'high' | 'medium' | 'low'>('medium');
  
  // Calculate filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        // Text search
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesTitle = task.title.toLowerCase().includes(query);
          const matchesDesc = (task.description?.toLowerCase() || '').includes(query);
          const matchesTags = task.tags?.some(tag => tag.toLowerCase().includes(query)) || false;
          if (!matchesTitle && !matchesDesc && !matchesTags) return false;
        }
        
        // Priority filter
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
        
        // Intensity filter
        if (intensityFilter !== 'all' && task.intensity !== intensityFilter) return false;
        
        // Category filter
        if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
        
        // Status filter
        if (statusFilter !== 'all' && task.status !== statusFilter) return false;
        
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'dueDate':
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            
          case 'priority':
            const priorityValues = { high: 0, medium: 1, low: 2 };
            return priorityValues[a.priority] - priorityValues[b.priority];
            
          case 'intensity':
            const intensityValues = { giant: 0, big: 1, medium: 2, small: 3, optional: 4 };
            return intensityValues[a.intensity] - intensityValues[b.intensity];
            
          case 'title':
            return a.title.localeCompare(b.title);
            
          case 'status':
            const statusValues = { 'in-progress': 0, 'scheduled': 1, 'overdue': 2, 'missed': 3, 'completed': 4 };
            return (statusValues[a.status || 'scheduled'] || 1) - (statusValues[b.status || 'scheduled'] || 1);
            
          default:
            return 0;
        }
      });
  }, [tasks, searchQuery, sortBy, priorityFilter, intensityFilter, categoryFilter, statusFilter]);

  // Handle applying filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setPriorityFilter('all');
    setIntensityFilter('all');
    setCategoryFilter('all');
    setStatusFilter('all');
  };
  
  // Handle task selection
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds(current => {
      if (current.includes(taskId)) {
        return current.filter(id => id !== taskId);
      } else {
        return [...current, taskId];
      }
    });
  };
  
  // Toggle select mode
  const toggleSelectMode = () => {
    setSelectMode(prev => !prev);
    setSelectedTaskIds([]);
  };
  
  // Select all visible tasks
  const selectAllTasks = () => {
    setSelectedTaskIds(filteredTasks.map(task => task.id));
  };
  
  // Deselect all tasks
  const deselectAllTasks = () => {
    setSelectedTaskIds([]);
  };
  
  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedTaskIds.length === 0) return;
    
    // Show confirmation toast
    toast('Delete selected tasks?', {
      action: {
        label: 'Delete',
        onClick: () => {
          bulkDeleteTasks(selectedTaskIds);
          setSelectedTaskIds([]);
          setSelectMode(false);
        }
      }
    });
  };
  
  // Handle bulk complete
  const handleBulkComplete = () => {
    if (selectedTaskIds.length === 0) return;
    
    bulkCompleteTasks(selectedTaskIds);
    setSelectedTaskIds([]);
    setSelectMode(false);
  };
  
  // Handle bulk category change
  const handleBulkCategoryChange = () => {
    if (selectedTaskIds.length === 0 || !selectedCategory) return;
    
    bulkChangeCategory(selectedTaskIds, selectedCategory);
    setBulkCategoryDialogOpen(false);
    setSelectedTaskIds([]);
    setSelectMode(false);
  };
  
  // Handle bulk priority change
  const handleBulkPriorityChange = () => {
    if (selectedTaskIds.length === 0) return;
    
    bulkChangePriority(selectedTaskIds, selectedPriority);
    setBulkPriorityDialogOpen(false);
    setSelectedTaskIds([]);
    setSelectMode(false);
  };

  return (
    <div className="space-y-6">
      {/* Control bar */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {showCompleted ? 'Completed Tasks' : 'Tasks'}
          {filteredTasks.length > 0 && <span className="ml-2 text-sm text-muted-foreground">({filteredTasks.length})</span>}
        </h2>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant={selectMode ? "default" : "outline"} 
            size="sm"
            onClick={toggleSelectMode}
          >
            {selectMode ? 'Cancel Selection' : 'Select Tasks'}
          </Button>
        </div>
      </div>
      
      {/* Selection controls - only visible when in select mode */}
      {selectMode && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex justify-between items-center">
              <span>
                Selected: {selectedTaskIds.length} {selectedTaskIds.length === 1 ? 'task' : 'tasks'}
              </span>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={selectAllTasks}>
                  Select All
                </Button>
                <Button size="sm" variant="outline" onClick={deselectAllTasks}>
                  Deselect All
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3">
            <div className="flex flex-wrap gap-2">
              {!showCompleted && (
                <Button size="sm" onClick={handleBulkComplete} disabled={selectedTaskIds.length === 0}>
                  <CheckSquare className="mr-1 h-4 w-4" />
                  Complete
                </Button>
              )}
              
              <Button size="sm" variant="destructive" onClick={handleBulkDelete} disabled={selectedTaskIds.length === 0}>
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
              </Button>
              
              <Dialog open={bulkCategoryDialogOpen} onOpenChange={setBulkCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" disabled={selectedTaskIds.length === 0}>
                    <ArrowRightCircle className="mr-1 h-4 w-4" />
                    Change Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Category</DialogTitle>
                    <DialogDescription>
                      Select a new category for {selectedTaskIds.length} {selectedTaskIds.length === 1 ? 'task' : 'tasks'}.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
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
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setBulkCategoryDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleBulkCategoryChange} disabled={!selectedCategory}>Apply</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog open={bulkPriorityDialogOpen} onOpenChange={setBulkPriorityDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" disabled={selectedTaskIds.length === 0}>
                    <ArrowRightCircle className="mr-1 h-4 w-4" />
                    Change Priority
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Priority</DialogTitle>
                    <DialogDescription>
                      Select a new priority for {selectedTaskIds.length} {selectedTaskIds.length === 1 ? 'task' : 'tasks'}.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select 
                        value={selectedPriority}
                        onValueChange={(value) => setSelectedPriority(value as 'high' | 'medium' | 'low')}
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
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setBulkPriorityDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleBulkPriorityChange}>Apply</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Filters section */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {/* Filter bar */}
        <div className="flex flex-wrap gap-2">
          {/* Sort options */}
          <div className="w-full sm:w-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">Sort by Due Date</SelectItem>
                <SelectItem value="priority">Sort by Priority</SelectItem>
                <SelectItem value="intensity">Sort by Intensity</SelectItem>
                <SelectItem value="title">Sort by Title</SelectItem>
                <SelectItem value="status">Sort by Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Priority filter */}
          <div className="w-full sm:w-auto">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Intensity filter */}
          <div className="w-full sm:w-auto">
            <Select value={intensityFilter} onValueChange={setIntensityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by intensity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Intensities</SelectItem>
                <SelectItem value="giant">Giant Tasks</SelectItem>
                <SelectItem value="big">Big Tasks</SelectItem>
                <SelectItem value="medium">Medium Tasks</SelectItem>
                <SelectItem value="small">Small Tasks</SelectItem>
                <SelectItem value="optional">Optional Tasks</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Category filter */}
          <div className="w-full sm:w-auto">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Status filter */}
          <div className="w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="missed">Missed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Clear filters button (only show if filters are applied) */}
          {(searchQuery || priorityFilter !== 'all' || intensityFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all') && (
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>
      
      {/* Tasks list */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="relative">
              {selectMode && (
                <div className="absolute top-2 left-2 z-10 bg-background/80 p-1 rounded-md">
                  <Checkbox
                    checked={selectedTaskIds.includes(task.id)}
                    onCheckedChange={() => toggleTaskSelection(task.id)}
                  />
                </div>
              )}
              <TaskCard task={task} showCompleted={showCompleted} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Filter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No tasks found</h3>
          <p className="text-muted-foreground">
            {searchQuery || priorityFilter !== 'all' || intensityFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your filters to see more tasks'
              : showCompleted 
                ? 'No completed tasks yet. Complete some tasks to see them here.'
                : 'No tasks yet. Create a task to get started.'}
          </p>
        </div>
      )}
    </div>
  );
}
