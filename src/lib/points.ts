
// Points system for gamification

import { Task } from './storage';

// Points awarded for each task intensity
const POINTS = {
  small: 5,
  medium: 10,
  big: 20,
  giant: 40,
  optional: 2
};

// XP threshold for leveling up
const POINTS_PER_LEVEL = 100;

/**
 * Calculate points for a completed task
 */
export function getTaskPoints(task: Task): number {
  return POINTS[task.intensity];
}

/**
 * Calculate level based on total points
 */
export function calculateLevel(points: number): number {
  return Math.max(1, Math.floor(points / POINTS_PER_LEVEL) + 1);
}

/**
 * Calculate XP progress within current level (0-100)
 */
export function calculateLevelProgress(points: number): number {
  const level = calculateLevel(points);
  const levelStartPoints = (level - 1) * POINTS_PER_LEVEL;
  const pointsInLevel = points - levelStartPoints;
  
  return Math.min(100, Math.floor((pointsInLevel / POINTS_PER_LEVEL) * 100));
}

/**
 * Calculate remaining XP needed for next level
 */
export function calculateRemainingXP(points: number): number {
  const level = calculateLevel(points);
  const nextLevelPoints = level * POINTS_PER_LEVEL;
  
  return nextLevelPoints - points;
}

/**
 * Check if user has a streak today
 */
export function hasCompletedTaskToday(lastCompletionDate?: string): boolean {
  if (!lastCompletionDate) return false;
  
  const today = new Date().toISOString().split('T')[0];
  return lastCompletionDate.split('T')[0] === today;
}

/**
 * Check if streak is maintained
 */
export function isStreakMaintained(lastCompletionDate?: string): boolean {
  if (!lastCompletionDate) return false;
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastCompletion = new Date(lastCompletionDate);
  const lastCompletionDay = new Date(
    lastCompletion.getFullYear(),
    lastCompletion.getMonth(),
    lastCompletion.getDate()
  );
  
  const yesterdayDate = new Date(
    yesterday.getFullYear(), 
    yesterday.getMonth(), 
    yesterday.getDate()
  );
  
  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  
  return (
    lastCompletionDay.getTime() === todayDate.getTime() ||
    lastCompletionDay.getTime() === yesterdayDate.getTime()
  );
}

/**
 * Calculate points earned today
 */
export function calculatePointsToday(completedTasks: Task[]): number {
  const today = new Date().toISOString().split('T')[0];
  
  return completedTasks
    .filter(task => task.completedAt && task.completedAt.split('T')[0] === today)
    .reduce((sum, task) => sum + getTaskPoints(task), 0);
}
