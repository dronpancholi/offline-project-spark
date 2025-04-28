
// Storage utility for local data persistence using IndexedDB

// Define key types for storage
const STORAGE_KEYS = {
  PROFILE: 'first-projects-profile',
  TASKS: 'first-projects-tasks',
  COMPLETED_TASKS: 'first-projects-completed-tasks',
  PROGRESS: 'first-projects-progress',
  CATEGORIES: 'first-projects-categories',
  SETTINGS: 'first-projects-settings',
  ONBOARDED: 'first-projects-onboarded'
};

// IndexedDB Configuration
const DB_NAME = 'FirstProjectsDB';
const DB_VERSION = 1;
const STORES = {
  PROFILE: 'profile',
  TASKS: 'tasks',
  COMPLETED_TASKS: 'completedTasks',
  PROGRESS: 'progress',
  CATEGORIES: 'categories',
  SETTINGS: 'settings',
  FLAGS: 'flags' // For onboarded flag and other app state flags
};

// Open the database connection
async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('Error opening IndexedDB', request.error);
      reject(request.error);
      
      // Fallback to localStorage if IndexedDB fails
      console.warn('Falling back to localStorage');
    };
    
    request.onsuccess = (event) => {
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.PROFILE)) {
        db.createObjectStore(STORES.PROFILE, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.TASKS)) {
        db.createObjectStore(STORES.TASKS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.COMPLETED_TASKS)) {
        db.createObjectStore(STORES.COMPLETED_TASKS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.PROGRESS)) {
        db.createObjectStore(STORES.PROGRESS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.CATEGORIES)) {
        db.createObjectStore(STORES.CATEGORIES, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.FLAGS)) {
        db.createObjectStore(STORES.FLAGS, { keyPath: 'id' });
      }
      
      console.log('Database setup complete');
    };
  });
}

// Generic function to get data from IndexedDB
async function getFromDB<T>(store: string, key: string, defaultValue: T): Promise<T> {
  try {
    const db = await openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(store, 'readonly');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.get(key);
      
      request.onerror = (event) => {
        console.error(`Error getting ${key} from ${store}`, request.error);
        resolve(defaultValue);
      };
      
      request.onsuccess = (event) => {
        if (request.result) {
          resolve(request.result.data);
        } else {
          resolve(defaultValue);
        }
      };
    });
  } catch (error) {
    console.error(`Error accessing IndexedDB for ${store}/${key}`, error);
    return getItemFromLocalStorage<T>(key, defaultValue);
  }
}

// Generic function to set data in IndexedDB
async function setToDB(store: string, key: string, value: any): Promise<void> {
  try {
    const db = await openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(store, 'readwrite');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.put({ id: key, data: value });
      
      request.onerror = (event) => {
        console.error(`Error setting ${key} in ${store}`, request.error);
        // Fallback to localStorage
        setItemToLocalStorage(key, value);
        resolve();
      };
      
      request.onsuccess = (event) => {
        resolve();
      };
    });
  } catch (error) {
    console.error(`Error accessing IndexedDB for ${store}/${key}`, error);
    // Fallback to localStorage
    setItemToLocalStorage(key, value);
  }
}

// Fallback functions for localStorage
function getItemFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting item from localStorage: ${key}`, error);
    return defaultValue;
  }
}

function setItemToLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item in localStorage: ${key}`, error);
  }
}

// Check if user has completed onboarding
export async function hasCompletedOnboarding(): Promise<boolean> {
  return await getFromDB(STORES.FLAGS, STORAGE_KEYS.ONBOARDED, false);
}

// Mark onboarding as completed
export async function completeOnboarding(): Promise<void> {
  await setToDB(STORES.FLAGS, STORAGE_KEYS.ONBOARDED, true);
}

// Profile data storage
export interface ProfileData {
  fullName: string;
  username?: string;
  profilePicture?: string;
  bio?: string;
}

export async function getProfile(): Promise<ProfileData | null> {
  return await getFromDB<ProfileData | null>(STORES.PROFILE, STORAGE_KEYS.PROFILE, null);
}

export async function saveProfile(profile: ProfileData): Promise<void> {
  await setToDB(STORES.PROFILE, STORAGE_KEYS.PROFILE, profile);
}

// Task data storage with extended fields
export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  priority: 'high' | 'medium' | 'low';
  intensity: 'small' | 'medium' | 'big' | 'giant' | 'optional';
  category: string;
  colorTag?: string;
  reminder?: string;
  checklist?: ChecklistItem[];
  notes?: string;
  repeat?: 'daily' | 'weekly' | 'monthly' | 'none';
  createdAt: string;
  completed: boolean;
  completedAt?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export async function getTasks(): Promise<Task[]> {
  return await getFromDB<Task[]>(STORES.TASKS, STORAGE_KEYS.TASKS, []);
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  await setToDB(STORES.TASKS, STORAGE_KEYS.TASKS, tasks);
}

export async function getCompletedTasks(): Promise<Task[]> {
  return await getFromDB<Task[]>(STORES.COMPLETED_TASKS, STORAGE_KEYS.COMPLETED_TASKS, []);
}

export async function saveCompletedTasks(tasks: Task[]): Promise<void> {
  await setToDB(STORES.COMPLETED_TASKS, STORAGE_KEYS.COMPLETED_TASKS, tasks);
}

// Progress tracking
export interface ProgressData {
  points: number;
  level: number;
  streak: number;
  lastTaskCompletionDate?: string;
}

export async function getProgress(): Promise<ProgressData> {
  return await getFromDB<ProgressData>(STORES.PROGRESS, STORAGE_KEYS.PROGRESS, {
    points: 0,
    level: 1,
    streak: 0
  });
}

export async function saveProgress(progress: ProgressData): Promise<void> {
  await setToDB(STORES.PROGRESS, STORAGE_KEYS.PROGRESS, progress);
}

// Settings
export interface Settings {
  darkMode: boolean;
  enableReminders: boolean;
  theme?: 'light' | 'dark' | 'auto';
  notificationTimes?: number[]; // Minutes before due date [5, 30, 60, 1440]
}

export async function getSettings(): Promise<Settings> {
  return await getFromDB<Settings>(STORES.SETTINGS, STORAGE_KEYS.SETTINGS, {
    darkMode: false,
    enableReminders: true,
    theme: 'light',
    notificationTimes: [5, 30, 60, 1440]
  });
}

export async function saveSettings(settings: Settings): Promise<void> {
  await setToDB(STORES.SETTINGS, STORAGE_KEYS.SETTINGS, settings);
}

// Custom categories
export interface Category {
  id: string;
  name: string;
  color?: string;
}

export async function getCategories(): Promise<Category[]> {
  return await getFromDB<Category[]>(STORES.CATEGORIES, STORAGE_KEYS.CATEGORIES, [
    { id: 'work', name: 'Work', color: '#4A6FA5' },
    { id: 'study', name: 'Study', color: '#6B4E71' },
    { id: 'fitness', name: 'Fitness', color: '#47A8BD' },
    { id: 'personal', name: 'Personal', color: '#9B87F5' },
    { id: 'finance', name: 'Finance', color: '#5FAD56' },
    { id: 'health', name: 'Health', color: '#F06543' },
    { id: 'shopping', name: 'Shopping', color: '#F2B134' },
    { id: 'other', name: 'Other', color: '#7D7D7D' }
  ]);
}

export async function saveCategories(categories: Category[]): Promise<void> {
  await setToDB(STORES.CATEGORIES, STORAGE_KEYS.CATEGORIES, categories);
}

// Clear all data
export async function clearAllData(): Promise<void> {
  try {
    const db = await openDB();
    
    // Clear all stores
    const stores = [
      STORES.PROFILE,
      STORES.TASKS,
      STORES.COMPLETED_TASKS,
      STORES.PROGRESS,
      STORES.CATEGORIES,
      STORES.SETTINGS,
      STORES.FLAGS
    ];
    
    for (const store of stores) {
      const transaction = db.transaction(store, 'readwrite');
      const objectStore = transaction.objectStore(store);
      objectStore.clear();
    }
    
    // Also clear localStorage as a backup
    localStorage.clear();
    
  } catch (error) {
    console.error('Error clearing database', error);
    // Fallback to clearing localStorage
    localStorage.clear();
  }
}

// Export all data (for backup)
export async function exportAllData(): Promise<string> {
  try {
    const profile = await getProfile();
    const tasks = await getTasks();
    const completedTasks = await getCompletedTasks();
    const progress = await getProgress();
    const categories = await getCategories();
    const settings = await getSettings();
    const onboarded = await hasCompletedOnboarding();
    
    const exportData = {
      profile,
      tasks,
      completedTasks,
      progress,
      categories,
      settings,
      onboarded
    };
    
    return JSON.stringify(exportData);
  } catch (error) {
    console.error('Error exporting data', error);
    throw new Error('Failed to export data');
  }
}

// Import data from backup
export async function importAllData(jsonData: string): Promise<void> {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.profile) await saveProfile(data.profile);
    if (data.tasks) await saveTasks(data.tasks);
    if (data.completedTasks) await saveCompletedTasks(data.completedTasks);
    if (data.progress) await saveProgress(data.progress);
    if (data.categories) await saveCategories(data.categories);
    if (data.settings) await saveSettings(data.settings);
    if (data.onboarded) await completeOnboarding();
    
  } catch (error) {
    console.error('Error importing data', error);
    throw new Error('Failed to import data. The file might be corrupted.');
  }
}
