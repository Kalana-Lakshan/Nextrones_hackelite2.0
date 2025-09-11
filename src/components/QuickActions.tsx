import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Target, 
  BookOpen, 
  Clock,
  ArrowRight,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

interface QuickActionsProps {
  onExploreCareer: () => void;
  onViewTodos: () => void;
  progress: any;
}

export const QuickActions = ({ onExploreCareer, onViewTodos, progress }: QuickActionsProps) => {
  const getNextDeadline = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toLocaleDateString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Career Exploration Quick Access */}
      <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Explore Careers
          </CardTitle>
          <CardDescription>Find your perfect career match</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Field-wise exploration</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Job-wise browsing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm">Higher studies paths</span>
            </div>
            <Button onClick={onExploreCareer} className="w-full mt-4" size="sm">
              Start Exploring <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Progress Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Progress Overview
          </CardTitle>
          <CardDescription>Your learning journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{progress?.overall || 0}%</span>
              </div>
              <Progress value={progress?.overall || 0} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">{progress?.completed || 0}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-500">{progress?.remaining || 0}</div>
                <div className="text-xs text-muted-foreground">Remaining</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Tasks
          </CardTitle>
          <CardDescription>What's next on your agenda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {progress?.upcomingTasks?.length > 0 ? (
              progress.upcomingTasks.slice(0, 3).map((task: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{task.title}</div>
                    <div className="text-xs text-muted-foreground">Due: {task.dueDate}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No upcoming tasks</p>
                <p className="text-xs text-muted-foreground">Complete profile setup to get started</p>
              </div>
            )}
            <Button onClick={onViewTodos} variant="outline" className="w-full mt-4" size="sm">
              View All Tasks <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};