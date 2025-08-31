import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
  Calendar,
  Lightbulb,
  BookOpen,
  Users,
  Award,
  Clock,
  CheckCircle,
  ArrowRight,
  Play,
  Star,
  HelpCircle,
  Zap,
  Rocket,
  Briefcase,
  GraduationCap,
  Github,
  Linkedin
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

      navigate('/todolist');
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

  const quickTips = [
    {
      icon: Lightbulb,
      title: "Complete Your Profile",
      description: "Connect your LinkedIn and GitHub for better recommendations",
      action: "Update Profile",
      link: "/settings"
    },
    {
      icon: BookOpen,
      title: "Explore Career Paths",
      description: "Discover new opportunities that match your skills",
      action: "Explore Now",
      link: "#"
    },
    {
      icon: TrendingUp,
      title: "Track Your Progress",
      description: "Monitor your learning journey and celebrate milestones",
      action: "View Progress",
      link: "/todolist"
    }
  ];

  const recentActivities = [
    {
      type: "course_completed",
      title: "React Fundamentals",
      platform: "Udemy",
      date: "2 days ago",
      icon: CheckCircle,
      color: "text-green-500"
    },
    {
      type: "skill_updated",
      title: "JavaScript Level Up",
      platform: "Self Assessment",
      date: "1 week ago",
      icon: TrendingUp,
      color: "text-blue-500"
    },
    {
      type: "goal_set",
      title: "New Career Goal",
      platform: "CareerPath",
      date: "2 weeks ago",
      icon: Target,
      color: "text-purple-500"
    }
  ];

  const popularCareerPaths = [
    {
      title: "Full Stack Developer",
      demand: "High",
      salary: "$85K - $120K",
      skills: ["JavaScript", "React", "Node.js", "Database"],
      icon: "💻"
    },
    {
      title: "Data Scientist",
      demand: "Very High",
      salary: "$90K - $130K",
      skills: ["Python", "Machine Learning", "Statistics", "SQL"],
      icon: "📊"
    },
    {
      title: "UX/UI Designer",
      demand: "High",
      salary: "$70K - $100K",
      skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
      icon: "🎨"
    }
  ];

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

          {/* Welcome Banner for New Users */}
          {(!profile || !profile.onboarding_completed) && (
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 p-3 rounded-full">
                    <Rocket className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">Welcome to CareerPath! 🚀</h3>
                    <p className="text-muted-foreground mb-4">
                      Let's get you started on your career journey. Complete your profile setup to unlock personalized recommendations.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => navigate('/settings')}>
                        Complete Profile
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleExploreCareer}>
                        Explore Careers
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <QuickActions 
            onExploreCareer={handleExploreCareer}
            onViewTodos={() => navigate('/todolist')}
            progress={{
              overall: progress.length > 0 ? Math.round(progress.reduce((acc, p) => acc + p.current_level, 0) / progress.length) : 0,
              completed: progress.filter(p => p.current_level >= p.target_level).length,
              remaining: progress.filter(p => p.current_level < p.target_level).length,
              upcomingTasks: []
            }}
          />

          {/* Quick Tips Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickTips.map((tip, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <tip.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{tip.title}</h4>
                      <p className="text-xs text-muted-foreground mb-3">{tip.description}</p>
                      <Button variant="outline" size="sm" onClick={() => navigate(tip.link)}>
                        {tip.action}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Popular Career Paths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Popular Career Paths
              </CardTitle>
              <CardDescription>Explore trending career opportunities and their requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {popularCareerPaths.map((path, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-2xl">{path.icon}</div>
                      <div>
                        <h4 className="font-semibold text-sm">{path.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={path.demand === 'Very High' ? 'destructive' : 'default'} className="text-xs">
                            {path.demand} Demand
                          </Badge>
                          <span className="text-xs text-muted-foreground">{path.salary}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-primary">Key Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {path.skills.map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={handleExploreCareer}
                    >
                      Explore Path
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Job Storage */}
          <JobStorage 
            onSelectJob={(jobData) => {
              setSelectedJobData(jobData);
              setCurrentView('roadmap');
            }}
            onGenerateRoadmap={handleGenerateRoadmap}
          />

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest achievements and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className={`p-2 rounded-full bg-muted`}>
                        <activity.icon className={`h-4 w-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{activity.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {activity.platform} • {activity.date}
                        </div>
                      </div>
                    </div>
                  ))}
                  {recentActivities.length === 0 && (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground text-sm">No recent activity</p>
                      <p className="text-xs text-muted-foreground">Start exploring careers to see your progress</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
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
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Users className="h-4 w-4" />
                  Network with Professionals
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Play className="h-4 w-4" />
                  Watch Career Tips
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Your Progress
              </CardTitle>
              <CardDescription>Track your skill development and learning milestones</CardDescription>
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
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No progress tracked yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Connect your accounts and start learning to see your progress
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button size="sm" onClick={() => navigate('/settings')}>
                        Connect Accounts
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleExploreCareer}>
                        Explore Careers
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Help & Resources */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <HelpCircle className="h-5 w-5" />
                Need Help?
              </CardTitle>
              <CardDescription className="text-blue-700">
                Get started with these helpful resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <Play className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm mb-1">Video Tutorials</h4>
                  <p className="text-xs text-blue-600 mb-2">Learn how to use CareerPath</p>
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-300">
                    Watch Now
                  </Button>
                </div>
                <div className="text-center p-4">
                  <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm mb-1">Help Center</h4>
                  <p className="text-xs text-blue-600 mb-2">Find answers to common questions</p>
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-300">
                    Browse Articles
                  </Button>
                </div>
                <div className="text-center p-4">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm mb-1">Community</h4>
                  <p className="text-xs text-blue-600 mb-2">Connect with other professionals</p>
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-300">
                    Join Forum
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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