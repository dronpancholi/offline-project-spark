
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { calculateLevelProgress, calculateRemainingXP, calculatePointsToday } from '@/lib/points';
import { format } from 'date-fns';
import { Flame } from 'lucide-react';

export default function ProgressPage() {
  const { progress, completedTasks } = useApp();
  
  const levelProgress = calculateLevelProgress(progress.points);
  const remainingXP = calculateRemainingXP(progress.points);
  const pointsToday = calculatePointsToday(completedTasks);
  
  // Calculate points by intensity
  const pointsByIntensity = {
    small: completedTasks.filter(t => t.intensity === 'small').length * 5,
    medium: completedTasks.filter(t => t.intensity === 'medium').length * 10,
    big: completedTasks.filter(t => t.intensity === 'big').length * 20,
    giant: completedTasks.filter(t => t.intensity === 'giant').length * 40,
    optional: completedTasks.filter(t => t.intensity === 'optional').length * 2
  };
  
  // Get recent completed tasks for history
  const recentCompletedTasks = [...completedTasks]
    .sort((a, b) => 
      new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
    )
    .slice(0, 10);
  
  return (
    <AppLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold">Progress Tracking</h1>
        
        {/* Main stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Level card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-3">{progress.level}</div>
                <Progress value={levelProgress} className="h-3 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {remainingXP} XP needed for level {progress.level + 1}
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Streak card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daily Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-5xl font-bold text-priority-high mb-3 flex items-center justify-center">
                  <Flame className="w-10 h-10 mr-1" />
                  {progress.streak} days
                </div>
                <p className="text-sm text-muted-foreground">
                  {progress.streak === 0 
                    ? "Complete a task today to start your streak!"
                    : progress.streak === 1
                    ? "Keep going! Complete a task tomorrow to maintain your streak."
                    : `You've been productive for ${progress.streak} days in a row!`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Total points card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-5xl font-bold mb-3">{progress.points} XP</div>
                <p className="text-sm text-muted-foreground">
                  {pointsToday > 0 
                    ? `${pointsToday} points earned today`
                    : "Complete tasks to earn more points!"
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Points breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Points Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-intensity-small/20 p-4 rounded-lg text-center">
                <h3 className="font-medium">Small Tasks</h3>
                <p className="text-2xl font-bold mt-2">
                  {pointsByIntensity.small} XP
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {completedTasks.filter(t => t.intensity === 'small').length} tasks × 5 points
                </p>
              </div>
              
              <div className="bg-intensity-medium/20 p-4 rounded-lg text-center">
                <h3 className="font-medium">Medium Tasks</h3>
                <p className="text-2xl font-bold mt-2">
                  {pointsByIntensity.medium} XP
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {completedTasks.filter(t => t.intensity === 'medium').length} tasks × 10 points
                </p>
              </div>
              
              <div className="bg-intensity-big/20 p-4 rounded-lg text-center">
                <h3 className="font-medium">Big Tasks</h3>
                <p className="text-2xl font-bold mt-2">
                  {pointsByIntensity.big} XP
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {completedTasks.filter(t => t.intensity === 'big').length} tasks × 20 points
                </p>
              </div>
              
              <div className="bg-intensity-giant/20 p-4 rounded-lg text-center">
                <h3 className="font-medium">Giant Tasks</h3>
                <p className="text-2xl font-bold mt-2">
                  {pointsByIntensity.giant} XP
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {completedTasks.filter(t => t.intensity === 'giant').length} tasks × 40 points
                </p>
              </div>
              
              <div className="bg-intensity-optional/20 p-4 rounded-lg text-center">
                <h3 className="font-medium">Optional Tasks</h3>
                <p className="text-2xl font-bold mt-2">
                  {pointsByIntensity.optional} XP
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {completedTasks.filter(t => t.intensity === 'optional').length} tasks × 2 points
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent completion history */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Completions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCompletedTasks.length > 0 ? (
              <div className="space-y-3">
                {recentCompletedTasks.map(task => (
                  <div key={task.id} className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.completedAt && format(new Date(task.completedAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">+{task.intensity === 'small' ? 5 : task.intensity === 'medium' ? 10 : task.intensity === 'big' ? 20 : task.intensity === 'giant' ? 40 : 2} XP</p>
                      <p className="text-xs">{task.intensity} task</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No completed tasks yet. Complete tasks to see your history.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
