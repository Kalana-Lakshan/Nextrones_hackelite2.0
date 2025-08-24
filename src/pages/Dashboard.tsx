import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { JobExploration } from '@/components/JobExploration';
import { RoadmapGenerator } from '@/components/RoadmapGenerator';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { JobStorage } from '@/components/JobStorage';
import { QuickActions } from '@/components/QuickActions';
import { 
  Upload, 
  Target,
  Map,
  LogOut,
  Sparkles,
  TrendingUp,
  Calendar
} from 'lucide-react';

export default function Dashboard() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'exploration' | 'roadmap'>('dashboard');
  const [selectedJobData, setSelectedJobData] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [session, navigate]);

  useEffect(() => {
    // Check if user needs onboarding
    if (profile && !profile.onboarding_completed) {
      setShowOnboarding(true);
    }
  }, [profile]);

  const loadDashboardData = async () => {
    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (profileData) setProfile(profileData);

      // Load progress
      const { data: progressData } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user?.id);
      
      if (progressData) setProgress(progressData);

    } catch (error: any) {
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExploreCareer = () => {
    setCurrentView('exploration');
  };

  const handleGenerateRoadmap = (jobData: any) => {
    setSelectedJobData(jobData);
    setCurrentView('roadmap');
  };

  const handleGenerateTodoList = async (roadmapData: any) => {
    try {
      const { job, roadmapItems, graduationDate, freeTimeSchedule } = roadmapData;
      
      // Create roadmap items in database
      const roadmapItemsToInsert = roadmapItems.map((item: any) => ({
        user_id: user?.id,
        title: item.title,
        description: item.description,
        category: item.category,
        platform: item.platform,
        estimated_weeks: Math.ceil(item.estimatedHours / 10), // Rough estimate
        order_index: item.id
      }));

      const { error: roadmapError } = await supabase
        .from('roadmap_items')
        .insert(roadmapItemsToInsert);

      if (roadmapError) throw roadmapError;

      // Create detailed todos
      const todos = roadmapItems.flatMap((item: any) => [
        {
          user_id: user?.id,
          title: `Start: ${item.title}`,
          description: item.description,
          due_date: item.deadline,
          priority: 'high'
        },
        {
          user_id: user?.id,
          title: `Complete: ${item.title}`,
          description: `Finish all requirements for ${item.title}`,
          due_date: item.deadline,
          priority: 'medium'
        }
      ]);

      const { error: todosError } = await supabase
        .from('todos')
        .insert(todos);

      if (todosError) throw todosError;

      toast({
        title: "To-Do List Generated!",
        description: "Your personalized learning plan has been created. Check the To-Do List tab.",
      });

      navigate('/todo-list');
    } catch (error: any) {
      toast({
        title: "Error generating todo list",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    navigate('/settings');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Render different views based on current state
  if (currentView === 'exploration') {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Tab Navigation */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-6">
          <nav className="flex space-x-8">
            <button 
              onClick={() => navigate('/')}
              className="py-4 px-1 border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="py-4 px-1 border-b-2 border-primary text-primary font-medium"
            >
              Dashboard
            </button>
            <button 
              onClick={() => navigate('/todolist')}
              className="py-4 px-1 border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors"
            >
              To-Do List
            </button>
            <button 
              onClick={() => navigate('/settings')}
              className="py-4 px-1 border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors"
            >
              Settings
            </button>
          </nav>
        </div>
      </div>
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <JobExploration 
              onBack={() => setCurrentView('dashboard')}
              onGenerateRoadmap={handleGenerateRoadmap}
            />
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'roadmap' && selectedJobData) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <RoadmapGenerator 
              jobData={selectedJobData}
              onBack={() => setCurrentView('exploration')}
              onGenerateTodoList={handleGenerateTodoList}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
                CP
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">How's your day going, {profile?.full_name || user?.email?.split('@')[0]}? 👋</h1>
                <p className="text-sm text-muted-foreground">What would you like to accomplish today?</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Explore career opportunities and track your progress</p>
          </div>

          {/* Quick Actions */}
          <QuickActions 
            onExploreCareer={handleExploreCareer}
            onViewTodos={() => navigate('/todo-list')}
            progress={{
              overall: progress.length > 0 ? Math.round(progress.reduce((acc, p) => acc + p.current_level, 0) / progress.length) : 0,
              completed: progress.filter(p => p.current_level >= p.target_level).length,
              remaining: progress.filter(p => p.current_level < p.target_level).length,
              upcomingTasks: []
            }}
          />

          {/* Job Storage */}
          <JobStorage 
            onSelectJob={(jobData) => {
              setSelectedJobData(jobData);
              setCurrentView('roadmap');
            }}
            onGenerateRoadmap={handleGenerateRoadmap}
          />

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Progress</CardTitle>
                <CardDescription>Your latest achievements and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progress.slice(0, 3).map((skill) => (
                    <div key={skill.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{skill.skill_name}</span>
                        <span className="text-sm text-muted-foreground">{skill.current_level}%</span>
                      </div>
                      <Progress value={skill.current_level} className="h-2" />
                    </div>
                  ))}
                  {progress.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-8">
                      No progress tracked yet. Connect your accounts to get started!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks to boost your career</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Updated Resume
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Target className="h-4 w-4" />
                  Set New Career Goal
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Map className="h-4 w-4" />
                  Generate Learning Plan
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Onboarding Flow */}
      <OnboardingFlow 
        isOpen={showOnboarding} 
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}