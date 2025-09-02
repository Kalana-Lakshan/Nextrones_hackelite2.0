import { useEffect, useMemo, useState } from 'react';
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
import { AppNav, AppNavInset } from '@/components/AppNav';
import { SidebarProvider } from '@/components/ui/sidebar';
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
import { Input } from '@/components/ui/input';
import { TrendingNews } from '@/components/TrendingNews';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);

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

  // Simple local job catalog for search (can be replaced with API)
  const jobCatalog = useMemo(() => ([
    { id: 'fe', title: 'Frontend Developer', company: 'Various', field: 'Software Development', compatibility: 90 },
    { id: 'ds', title: 'Data Scientist', company: 'Various', field: 'Data Science', compatibility: 88 },
    { id: 'fs', title: 'Full Stack Developer', company: 'Various', field: 'Software Development', compatibility: 85 },
    { id: 'pm', title: 'Product Manager', company: 'Various', field: 'Product', compatibility: 80 },
  ]), []);

  const handleSearchJobs = () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) { setSearchResults([]); return; }
    setSearchResults(
      jobCatalog.filter(j => j.title.toLowerCase().includes(q) || j.field.toLowerCase().includes(q))
    );
  };

  const handleAddGoal = (job: any) => {
    const analysis = {
      compatibility: job.compatibility,
      academicSkills: ['JavaScript', 'React', 'Data Structures', 'Git'],
      softSkills: ['Problem Solving', 'Communication', 'Time Management']
    };
    if (typeof (window as any).saveJobToStorage === 'function') {
      (window as any).saveJobToStorage({ job, analysis });
      toast({ title: 'Goal added', description: `${job.title} saved to your goals.` });
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
    <SidebarProvider>
      <AppNav />
      <AppNavInset className="bg-gradient-subtle">
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

      <div className="container mx-auto px-6 py-8 pb-24 max-w-[1400px]">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Personalized News at top */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Personalized News
              </CardTitle>
              <CardDescription>News tailored to your interests</CardDescription>
            </CardHeader>
            <CardContent>
              <TrendingNews />
            </CardContent>
          </Card>

          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Explore career opportunities and track your progress</p>
          </div>

          {/* Search Jobs / Add Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Search and add job goals
              </CardTitle>
              <CardDescription>Find roles and save them to your goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-3">
                <Input
                  placeholder="Search jobs or fields..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchJobs()}
                />
                <Button onClick={handleSearchJobs}>Search</Button>
              </div>
              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  {searchResults.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{job.title}</div>
                        <div className="text-xs text-muted-foreground">{job.field}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{job.compatibility}% Match</Badge>
                        <Button size="sm" onClick={() => handleAddGoal(job)}>Add goal</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Removed welcome banner, quick actions, and quick tips as requested */}

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

          {/* Removed Saved Roadmaps section from Dashboard as requested */}

          {/* Removed recent activity and quick actions as requested */}

          {/* Removed progress overview as requested */}

          {/* Removed Help & Resources section as requested */}
        </div>
      </div>

      {/* Onboarding Flow */}
      <OnboardingFlow 
        isOpen={showOnboarding} 
        onComplete={handleOnboardingComplete}
      />

      {/* Personalized sliding panel */}
      <Sheet open={isPersonalizeOpen} onOpenChange={setIsPersonalizeOpen}>
        <SheetTrigger asChild>
          <button
            className="fixed bottom-24 right-4 md:right-8 z-40 rounded-full bg-primary text-primary-foreground shadow-lg px-4 py-3 text-sm"
          >
            Personalize
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Personalized insights</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profile snapshot</CardTitle>
                <CardDescription>Quick view of your current status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Name</span><span className="font-medium">{profile?.full_name || user?.email}</span></div>
                  <div className="flex justify-between"><span>Saved goals</span><span className="font-medium">Check Saved Roadmaps</span></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Suggested next steps</CardTitle>
                <CardDescription>Based on your recent activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={handleExploreCareer}>
                  Explore a new role
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/todolist')}>
                  Review your tasks
                </Button>
              </CardContent>
            </Card>
          </div>
        </SheetContent>
      </Sheet>
      </AppNavInset>
    </SidebarProvider>
  );
}