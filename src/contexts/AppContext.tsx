
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  ProfileData, 
  Task, 
  ProgressData, 
  Settings, 
  Category,
  getProfile, 
  saveProfile,
  getTasks, 
  saveTasks,
  getCompletedTasks,
  saveCompletedTasks,
  getProgress, 
  saveProgress,
  getSettings, 
  saveSettings,
  getCategories,
  saveCategories,
  hasCompletedOnboarding, 
  completeOnboarding,
  clearAllData
} from '@/lib/storage';
import { toast } from 'sonner';
import { useToast } from '@/components/ui/use-toast';
import { 
  getTaskPoints, 
  isStreakMaintained, 
  hasCompletedTaskToday,
  calculatePointsToday
} from '@/lib/points';

interface AppContextProps {
  // App state
  isOnboarded: boolean;
  markAsOnboarded: () => void;
  
  // Profile
  profile: ProfileData | null;
  saveUserProfile: (profile: ProfileData) => void;
  
  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  completeTask: (taskId: string) => void;
  uncompleteTask: (taskId: string) => void;
  
  // Completed tasks
  completedTasks: Task[];
  
  // Progress
  progress: ProgressData;
  
  // Settings
  settings: Settings;
  updateSettings: (newSettings: Settings) => void;
  
  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  
  // Data management
  resetAllData: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // App state
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [progress, setProgress] = useState<ProgressData>({ points: 0, level: 1, streak: 0 });
  const [settings, setSettings] = useState<Settings>({ darkMode: false, enableReminders: true });
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Toast notification
  const { toast: uiToast } = useToast();

  // Load data from localStorage on initial mount
  useEffect(() => {
    setIsOnboarded(hasCompletedOnboarding());
    setProfile(getProfile());
    setTasks(getTasks());
    setCompletedTasks(getCompletedTasks());
    setProgress(getProgress());
    setSettings(getSettings());
    setCategories(getCategories());
  }, []);

  // Set dark mode from settings
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Mark app as onboarded
  const markAsOnboarded = () => {
    setIsOnboarded(true);
    completeOnboarding();
  };

  // Save user profile
  const saveUserProfile = (newProfile: ProfileData) => {
    setProfile(newProfile);
    saveProfile(newProfile);
    toast('Profile saved');
  };

  // Add a new task
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      completed: false
    };

    setTasks(prevTasks => {
      const updatedTasks = [...prevTasks, newTask];
      saveTasks(updatedTasks);
      return updatedTasks;
    });

    toast('Task added');
  };

  // Update an existing task
  const updateTask = (updatedTask: Task) => {
    setTasks(prevTasks => {
      const newTasks = prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      );
      saveTasks(newTasks);
      return newTasks;
    });
    
    toast('Task updated');
  };

  // Delete a task
  const deleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(task => task.id === taskId);
    if (!taskToDelete) return;

    setTasks(prevTasks => {
      const filteredTasks = prevTasks.filter(task => task.id !== taskId);
      saveTasks(filteredTasks);
      return filteredTasks;
    });
    
    // Show toast with undo option
    toast('Task deleted', {
      action: {
        label: 'Undo',
        onClick: () => {
          // Restore the task
          setTasks(prevTasks => {
            const updatedTasks = [...prevTasks, taskToDelete];
            saveTasks(updatedTasks);
            return updatedTasks;
          });
          toast('Task restored');
        }
      }
    });
  };

  // Complete a task
  const completeTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Update task as completed
    const completedTask: Task = {
      ...task,
      completed: true,
      completedAt: new Date().toISOString()
    };

    // Remove from active tasks list
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.filter(task => task.id !== taskId);
      saveTasks(updatedTasks);
      return updatedTasks;
    });

    // Add to completed tasks
    setCompletedTasks(prevCompleted => {
      const updatedCompleted = [...prevCompleted, completedTask];
      saveCompletedTasks(updatedCompleted);
      return updatedCompleted;
    });

    // Update progress
    const points = getTaskPoints(task);
    const today = new Date().toISOString();
    
    setProgress(prevProgress => {
      const newPoints = prevProgress.points + points;
      
      // Calculate streak
      let newStreak = prevProgress.streak;
      
      if (!hasCompletedTaskToday(prevProgress.lastTaskCompletionDate)) {
        if (isStreakMaintained(prevProgress.lastTaskCompletionDate)) {
          // Streak continues
          newStreak += 1;
        } else {
          // Streak broken - reset to 1
          newStreak = 1;
        }
      }
      
      const updatedProgress = {
        ...prevProgress,
        points: newPoints,
        streak: newStreak,
        lastTaskCompletionDate: today
      };
      
      saveProgress(updatedProgress);
      return updatedProgress;
    });

    // Show success notification
    toast(`Task completed (+${points} points)`);
  };

  // Uncomplete a task (move from completed back to active)
  const uncompleteTask = (taskId: string) => {
    const task = completedTasks.find(t => t.id === taskId);
    if (!task) return;

    // Update task as not completed
    const uncompleteTask: Task = {
      ...task,
      completed: false,
      completedAt: undefined
    };

    // Remove from completed tasks
    setCompletedTasks(prevCompleted => {
      const updatedCompleted = prevCompleted.filter(task => task.id !== taskId);
      saveCompletedTasks(updatedCompleted);
      return updatedCompleted;
    });

    // Add back to active tasks
    setTasks(prevTasks => {
      const updatedTasks = [...prevTasks, uncompleteTask];
      saveTasks(updatedTasks);
      return updatedTasks;
    });

    // Update progress (subtract points)
    const points = getTaskPoints(task);
    
    setProgress(prevProgress => {
      // Subtract points, but ensure we don't go below 0
      const newPoints = Math.max(0, prevProgress.points - points);
      
      // Note: We don't adjust the streak here
      
      const updatedProgress = {
        ...prevProgress,
        points: newPoints,
      };
      
      saveProgress(updatedProgress);
      return updatedProgress;
    });

    toast('Task moved back to active');
  };

  // Update settings
  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    toast('Settings updated');
  };

  // Add a new category
  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: crypto.randomUUID(),
    };

    setCategories(prevCategories => {
      const updatedCategories = [...prevCategories, newCategory];
      saveCategories(updatedCategories);
      return updatedCategories;
    });

    toast('Category added');
  };

  // Update a category
  const updateCategory = (updatedCategory: Category) => {
    setCategories(prevCategories => {
      const newCategories = prevCategories.map(category => 
        category.id === updatedCategory.id ? updatedCategory : category
      );
      saveCategories(newCategories);
      return newCategories;
    });
    
    toast('Category updated');
  };

  // Delete a category
  const deleteCategory = (categoryId: string) => {
    // Check if this category is being used by any tasks
    const tasksUsingCategory = [...tasks, ...completedTasks].filter(
      task => task.category === categoryId
    );
    
    if (tasksUsingCategory.length > 0) {
      uiToast({
        title: "Cannot delete category",
        description: "This category is being used by tasks. Please reassign those tasks first.",
        variant: "destructive"
      });
      return;
    }
    
    setCategories(prevCategories => {
      const filteredCategories = prevCategories.filter(category => category.id !== categoryId);
      saveCategories(filteredCategories);
      return filteredCategories;
    });
    
    toast('Category deleted');
  };

  // Reset all data
  const resetAllData = () => {
    setIsOnboarded(false);
    setProfile(null);
    setTasks([]);
    setCompletedTasks([]);
    setProgress({ points: 0, level: 1, streak: 0 });
    setSettings({ darkMode: false, enableReminders: true });
    setCategories(getCategories()); // Reset to default categories
    
    clearAllData();
    toast('All data has been reset');
  };

  return (
    <AppContext.Provider
      value={{
        // App state
        isOnboarded,
        markAsOnboarded,
        
        // Profile
        profile,
        saveUserProfile,
        
        // Tasks
        tasks,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
        uncompleteTask,
        
        // Completed tasks
        completedTasks,
        
        // Progress
        progress,
        
        // Settings
        settings,
        updateSettings,
        
        // Categories
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        
        // Data management
        resetAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
