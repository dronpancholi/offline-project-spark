
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  ProfileData, 
  Task, 
  ChecklistItem,
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
  clearAllData,
  exportAllData,
  importAllData
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
  // Loading state
  isLoading: boolean;
  
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
  
  // Checklist items
  addChecklistItem: (taskId: string, text: string) => void;
  updateChecklistItem: (taskId: string, item: ChecklistItem) => void;
  removeChecklistItem: (taskId: string, itemId: string) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  
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
  exportData: () => Promise<string>;
  importData: (jsonData: string) => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
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

  // Load data from IndexedDB on initial mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load all data in parallel for better performance
        const [
          onboardingStatus,
          profileData,
          tasksData,
          completedTasksData,
          progressData,
          settingsData,
          categoriesData
        ] = await Promise.all([
          hasCompletedOnboarding(),
          getProfile(),
          getTasks(),
          getCompletedTasks(),
          getProgress(),
          getSettings(),
          getCategories()
        ]);
        
        setIsOnboarded(onboardingStatus);
        setProfile(profileData);
        setTasks(tasksData);
        setCompletedTasks(completedTasksData);
        setProgress(progressData);
        setSettings(settingsData);
        setCategories(categoriesData);
        
        console.log('All data loaded successfully');
      } catch (error) {
        console.error('Failed to load app data', error);
        uiToast({
          title: "Error loading data",
          description: "Something went wrong while loading your data. Some features might not work correctly.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [uiToast]);

  // Set dark mode from settings
  useEffect(() => {
    if (settings.theme === 'dark' || (settings.theme === 'auto' && 
        window.matchMedia('(prefers-color-scheme: dark)').matches) || 
        settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode, settings.theme]);

  // Mark app as onboarded
  const markAsOnboarded = async () => {
    setIsOnboarded(true);
    await completeOnboarding();
  };

  // Save user profile
  const saveUserProfile = async (newProfile: ProfileData) => {
    setProfile(newProfile);
    await saveProfile(newProfile);
    toast('Profile saved');
  };

  // Add a new task
  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      completed: false
    };

    setTasks(prevTasks => {
      const updatedTasks = [...prevTasks, newTask];
      saveTasks(updatedTasks).catch(err => console.error('Failed to save tasks', err));
      return updatedTasks;
    });

    toast('Task added');
  };

  // Update an existing task
  const updateTask = async (updatedTask: Task) => {
    setTasks(prevTasks => {
      const newTasks = prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      );
      saveTasks(newTasks).catch(err => console.error('Failed to save tasks', err));
      return newTasks;
    });
    
    toast('Task updated');
  };

  // Delete a task
  const deleteTask = async (taskId: string) => {
    const taskToDelete = tasks.find(task => task.id === taskId) || 
                      completedTasks.find(task => task.id === taskId);
    if (!taskToDelete) return;

    // Remove from whichever list it belongs to
    if (taskToDelete.completed) {
      setCompletedTasks(prevTasks => {
        const filteredTasks = prevTasks.filter(task => task.id !== taskId);
        saveCompletedTasks(filteredTasks).catch(err => console.error('Failed to save completed tasks', err));
        return filteredTasks;
      });
    } else {
      setTasks(prevTasks => {
        const filteredTasks = prevTasks.filter(task => task.id !== taskId);
        saveTasks(filteredTasks).catch(err => console.error('Failed to save tasks', err));
        return filteredTasks;
      });
    }
    
    // Show toast with undo option
    toast('Task deleted', {
      action: {
        label: 'Undo',
        onClick: () => {
          // Restore the task
          if (taskToDelete.completed) {
            setCompletedTasks(prevTasks => {
              const updatedTasks = [...prevTasks, taskToDelete];
              saveCompletedTasks(updatedTasks).catch(err => console.error('Failed to save completed tasks', err));
              return updatedTasks;
            });
          } else {
            setTasks(prevTasks => {
              const updatedTasks = [...prevTasks, taskToDelete];
              saveTasks(updatedTasks).catch(err => console.error('Failed to save tasks', err));
              return updatedTasks;
            });
          }
          toast('Task restored');
        }
      }
    });
  };

  // Complete a task
  const completeTask = async (taskId: string) => {
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
      saveTasks(updatedTasks).catch(err => console.error('Failed to save tasks', err));
      return updatedTasks;
    });

    // Add to completed tasks
    setCompletedTasks(prevCompleted => {
      const updatedCompleted = [...prevCompleted, completedTask];
      saveCompletedTasks(updatedCompleted).catch(err => console.error('Failed to save completed tasks', err));
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
      
      saveProgress(updatedProgress).catch(err => console.error('Failed to save progress', err));
      return updatedProgress;
    });

    // Show success notification
    toast(`Task completed (+${points} points)`);
  };

  // Uncomplete a task (move from completed back to active)
  const uncompleteTask = async (taskId: string) => {
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
      saveCompletedTasks(updatedCompleted).catch(err => console.error('Failed to save completed tasks', err));
      return updatedCompleted;
    });

    // Add back to active tasks
    setTasks(prevTasks => {
      const updatedTasks = [...prevTasks, uncompleteTask];
      saveTasks(updatedTasks).catch(err => console.error('Failed to save tasks', err));
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
      
      saveProgress(updatedProgress).catch(err => console.error('Failed to save progress', err));
      return updatedProgress;
    });

    toast('Task moved back to active');
  };

  // Checklist items management
  const addChecklistItem = async (taskId: string, text: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text,
      completed: false
    };
    
    const updatedTask: Task = {
      ...task,
      checklist: [...(task.checklist || []), newItem]
    };
    
    await updateTask(updatedTask);
    toast('Checklist item added');
  };
  
  const updateChecklistItem = async (taskId: string, item: ChecklistItem) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.checklist) return;
    
    const updatedChecklist = task.checklist.map(
      existing => existing.id === item.id ? item : existing
    );
    
    const updatedTask: Task = {
      ...task,
      checklist: updatedChecklist
    };
    
    await updateTask(updatedTask);
  };
  
  const removeChecklistItem = async (taskId: string, itemId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.checklist) return;
    
    const updatedChecklist = task.checklist.filter(item => item.id !== itemId);
    
    const updatedTask: Task = {
      ...task,
      checklist: updatedChecklist
    };
    
    await updateTask(updatedTask);
    toast('Checklist item removed');
  };
  
  const toggleChecklistItem = async (taskId: string, itemId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.checklist) return;
    
    const updatedChecklist = task.checklist.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    
    const updatedTask: Task = {
      ...task,
      checklist: updatedChecklist
    };
    
    await updateTask(updatedTask);
  };

  // Update settings
  const updateSettings = async (newSettings: Settings) => {
    setSettings(newSettings);
    await saveSettings(newSettings);
    toast('Settings updated');
  };

  // Add a new category
  const addCategory = async (categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: crypto.randomUUID(),
    };

    setCategories(prevCategories => {
      const updatedCategories = [...prevCategories, newCategory];
      saveCategories(updatedCategories).catch(err => console.error('Failed to save categories', err));
      return updatedCategories;
    });

    toast('Category added');
  };

  // Update a category
  const updateCategory = async (updatedCategory: Category) => {
    setCategories(prevCategories => {
      const newCategories = prevCategories.map(category => 
        category.id === updatedCategory.id ? updatedCategory : category
      );
      saveCategories(newCategories).catch(err => console.error('Failed to save categories', err));
      return newCategories;
    });
    
    toast('Category updated');
  };

  // Delete a category
  const deleteCategory = async (categoryId: string) => {
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
      saveCategories(filteredCategories).catch(err => console.error('Failed to save categories', err));
      return filteredCategories;
    });
    
    toast('Category deleted');
  };

  // Reset all data
  const resetAllData = async () => {
    setIsLoading(true);
    
    try {
      await clearAllData();
      
      // Reset states
      setIsOnboarded(false);
      setProfile(null);
      setTasks([]);
      setCompletedTasks([]);
      setProgress({ points: 0, level: 1, streak: 0 });
      setSettings({ darkMode: false, enableReminders: true });
      
      // Reset categories to default
      const defaultCategories = await getCategories();
      setCategories(defaultCategories);
      
      toast('All data has been reset');
    } catch (error) {
      console.error('Failed to reset data', error);
      uiToast({
        title: "Error resetting data",
        description: "There was an error resetting your data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Export data
  const exportData = async (): Promise<string> => {
    try {
      return await exportAllData();
    } catch (error) {
      console.error('Failed to export data', error);
      uiToast({
        title: "Export Failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  // Import data
  const importData = async (jsonData: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      await importAllData(jsonData);
      
      // Reload all data
      const [
        onboardingStatus,
        profileData,
        tasksData,
        completedTasksData,
        progressData,
        settingsData,
        categoriesData
      ] = await Promise.all([
        hasCompletedOnboarding(),
        getProfile(),
        getTasks(),
        getCompletedTasks(),
        getProgress(),
        getSettings(),
        getCategories()
      ]);
      
      setIsOnboarded(onboardingStatus);
      setProfile(profileData);
      setTasks(tasksData);
      setCompletedTasks(completedTasksData);
      setProgress(progressData);
      setSettings(settingsData);
      setCategories(categoriesData);
      
      toast('Data imported successfully');
    } catch (error) {
      console.error('Failed to import data', error);
      uiToast({
        title: "Import Failed",
        description: "There was an error importing your data. The file might be corrupted.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        // Loading state
        isLoading,
        
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
        
        // Checklist items
        addChecklistItem,
        updateChecklistItem,
        removeChecklistItem,
        toggleChecklistItem,
        
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
        resetAllData,
        exportData,
        importData
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
