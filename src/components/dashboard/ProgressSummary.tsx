
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { calculateLevelProgress, calculatePointsToday } from '@/lib/points';
import { Flame } from 'lucide-react';

export function ProgressSummary() {
  const { progress, completedTasks } = useApp();
  
  const levelProgress = calculateLevelProgress(progress.points);
  const pointsToday = calculatePointsToday(completedTasks);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Progress Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level and XP */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Current Level</span>
            <span className="text-sm text-muted-foreground">Level {progress.level}</span>
          </div>
          <Progress value={levelProgress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progress.points} XP Total</span>
            <span>{levelProgress}% to Level {progress.level + 1}</span>
          </div>
        </div>
        
        {/* Streak info */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Current Streak</p>
            <p className="text-xs text-muted-foreground">Days in a row</p>
          </div>
          <div className="flex items-center">
            <Flame className="w-5 h-5 text-priority-high mr-1" />
            <span className="text-xl font-bold">{progress.streak}</span>
          </div>
        </div>
        
        {/* Points earned today */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Points Today</p>
            <p className="text-xs text-muted-foreground">From completed tasks</p>
          </div>
          <span className="text-xl font-bold">+{pointsToday}</span>
        </div>
      </CardContent>
    </Card>
  );
}
