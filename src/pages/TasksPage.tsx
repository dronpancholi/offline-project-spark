
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { TaskList } from '@/components/tasks/TaskList';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function TasksPage() {
  const { tasks, completedTasks } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse query params to determine active tab
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam === 'completed' ? 'completed' : 'active');
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/tasks${value === 'completed' ? '?tab=completed' : ''}`);
  };
  
  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Button onClick={() => navigate('/tasks/add')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="active" className="flex-1">
            Active Tasks ({tasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">
            Completed ({completedTasks.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <TaskList tasks={tasks} />
        </TabsContent>
        
        <TabsContent value="completed">
          <TaskList tasks={completedTasks} showCompleted />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
