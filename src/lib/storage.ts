
// Storage utility for local data persistence

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

// Generic function to get data from localStorage
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting item from localStorage: ${key}`, error);
    return defaultValue;
  }
}

// Generic function to set data in localStorage
function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item in localStorage: ${key}`, error);
  }
}

// Check if user has completed onboarding
export function hasCompletedOnboarding(): boolean {
  return getItem(STORAGE_KEYS.ONBOARDED, false);
}

// Mark onboarding as completed
export function completeOnboarding(): void {
  setItem(STORAGE_KEYS.ONBOARDED, true);
}

// Profile data storage
export interface ProfileData {
  fullName: string;
  username?: string;
  profilePicture?: string;
  bio?: string;
}

export function getProfile(): ProfileData | null {
  return getItem<ProfileData | null>(STORAGE_KEYS.PROFILE, null);
}

export function saveProfile(profile: ProfileData): void {
  setItem(STORAGE_KEYS.PROFILE, profile);
}

// Task data storage
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
  createdAt: string;
  completed: boolean;
  completedAt?: string;
}

export function getTasks(): Task[] {
  return getItem<Task[]>(STORAGE_KEYS.TASKS, []);
}

export function saveTasks(tasks: Task[]): void {
  setItem(STORAGE_KEYS.TASKS, tasks);
}

export function getCompletedTasks(): Task[] {
  return getItem<Task[]>(STORAGE_KEYS.COMPLETED_TASKS, []);
}

export function saveCompletedTasks(tasks: Task[]): void {
  setItem(STORAGE_KEYS.COMPLETED_TASKS, tasks);
}

// Progress tracking
export interface ProgressData {
  points: number;
  level: number;
  streak: number;
  lastTaskCompletionDate?: string;
}

export function getProgress(): ProgressData {
  return getItem<ProgressData>(STORAGE_KEYS.PROGRESS, {
    points: 0,
    level: 1,
    streak: 0
  });
}

export function saveProgress(progress: ProgressData): void {
  setItem(STORAGE_KEYS.PROGRESS, progress);
}

// Settings
export interface Settings {
  darkMode: boolean;
  enableReminders: boolean;
}

export function getSettings(): Settings {
  return getItem<Settings>(STORAGE_KEYS.SETTINGS, {
    darkMode: false,
    enableReminders: true
  });
}

export function saveSettings(settings: Settings): void {
  setItem(STORAGE_KEYS.SETTINGS, settings);
}

// Custom categories
export interface Category {
  id: string;
  name: string;
  color?: string;
}

export function getCategories(): Category[] {
  return getItem<Category[]>(STORAGE_KEYS.CATEGORIES, [
    { id: 'work', name: 'Work' },
    { id: 'study', name: 'Study' },
    { id: 'fitness', name: 'Fitness' },
    { id: 'personal', name: 'Personal' },
    { id: 'finance', name: 'Finance' },
    { id: 'health', name: 'Health' },
    { id: 'shopping', name: 'Shopping' },
    { id: 'other', name: 'Other' }
  ]);
}

export function saveCategories(categories: Category[]): void {
  setItem(STORAGE_KEYS.CATEGORIES, categories);
}

// Clear all data
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
  localStorage.removeItem(STORAGE_KEYS.TASKS);
  localStorage.removeItem(STORAGE_KEYS.COMPLETED_TASKS);
  localStorage.removeItem(STORAGE_KEYS.PROGRESS);
  localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
}
