
import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Task } from '@/lib/storage';
import { TaskCard } from './TaskCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  showCompleted?: boolean;
}

export function TaskList({ tasks, showCompleted = false }: TaskListProps) {
  const { categories } = useApp();
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('dueDate');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [intensityFilter, setIntensityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Calculate filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        // Text search
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesTitle = task.title.toLowerCase().includes(query);
          const matchesDesc = task.description?.toLowerCase().includes(query) || false;
          if (!matchesTitle && !matchesDesc) return false;
        }
        
        // Priority filter
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
        
        // Intensity filter
        if (intensityFilter !== 'all' && task.intensity !== intensityFilter) return false;
        
        // Category filter
        if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
        
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
            
          default:
            return 0;
        }
      });
  }, [tasks, searchQuery, sortBy, priorityFilter, intensityFilter, categoryFilter]);

  // Handle applying filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setPriorityFilter('all');
    setIntensityFilter('all');
    setCategoryFilter('all');
  };

  return (
    <div className="space-y-6">
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
          
          {/* Clear filters button (only show if filters are applied) */}
          {(searchQuery || priorityFilter !== 'all' || intensityFilter !== 'all' || categoryFilter !== 'all') && (
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
            <TaskCard key={task.id} task={task} showCompleted={showCompleted} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Filter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No tasks found</h3>
          <p className="text-muted-foreground">
            {searchQuery || priorityFilter !== 'all' || intensityFilter !== 'all' || categoryFilter !== 'all' 
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
