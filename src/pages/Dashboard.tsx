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
import { JobDetails } from '@/components/JobDetails';
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
  Linkedin,
  Bell
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { TrendingNews } from '@/components/TrendingNews';
import { ActionsAlerts } from '@/components/ActionsAlerts';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function Dashboard() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'exploration' | 'job-details' | 'roadmap'>('dashboard');
  const [selectedJobData, setSelectedJobData] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);
  const [actionsCount, setActionsCount] = useState(0);

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


  const clearSearchAndReturnToDashboard = () => {
    setCurrentView('dashboard');
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleJobSelect = (job: any) => {
    // Create job data with analysis similar to JobExploration
    const jobData = {
      job: job,
      analysis: {
        introduction: `${job.title} is a role in ${job.field} that involves creating and maintaining software solutions. This position requires strong technical skills and problem-solving abilities.`,
        future: `The demand for ${job.title} roles is expected to grow significantly in the coming years, with increasing opportunities in various industries.`,
        growthData: [
          { year: '2020', demand: 85, salary: 65 },
          { year: '2021', demand: 88, salary: 68 },
          { year: '2022', demand: 92, salary: 72 },
          { year: '2023', demand: 95, salary: 75 },
          { year: '2024', demand: 98, salary: 78 }
        ],
        salaryInsights: {
          entry: '$50,000 - $65,000',
          mid: '$65,000 - $85,000',
          senior: '$85,000 - $120,000',
          factors: ['Location', 'Company Size', 'Tech Stack', 'Experience']
        },
        compatibility: job.compatibility,
        academicSkills: ['JavaScript', 'React', 'Data Structures', 'Git', 'Problem Solving'],
        softSkills: ['Communication', 'Time Management', 'Teamwork', 'Attention to Detail']
      }
    };
    
    setSelectedJobData(jobData);
    setCurrentView('job-details');
  };

  const handleCareerPathSelect = (path: any) => {
    // Create job data for the career path
    const job = {
      id: path.title.toLowerCase().replace(/\s+/g, '-'),
      title: path.title,
      field: 'Technology',
      compatibility: 85
    };
    
    const jobData = {
      job: job,
      analysis: {
        introduction: `${path.title} is a highly sought-after role in the technology industry. This position offers excellent growth opportunities and competitive compensation.`,
        future: `The demand for ${path.title} roles is expected to grow significantly in the coming years, with increasing opportunities in various industries.`,
        growthData: [
          { year: '2020', demand: 85, salary: 65 },
          { year: '2021', demand: 88, salary: 68 },
          { year: '2022', demand: 92, salary: 72 },
          { year: '2023', demand: 95, salary: 75 },
          { year: '2024', demand: 98, salary: 78 }
        ],
        salaryInsights: {
          entry: path.salary.split(' - ')[0] || '$50,000',
          mid: path.salary || '$75,000 - $100,000',
          senior: path.salary.split(' - ')[1] || '$120,000',
          factors: ['Location', 'Company Size', 'Tech Stack', 'Experience']
        },
        compatibility: 85,
        academicSkills: path.skills || ['JavaScript', 'React', 'Data Structures', 'Git', 'Problem Solving'],
        softSkills: ['Communication', 'Time Management', 'Teamwork', 'Attention to Detail']
      }
    };
    
    setSelectedJobData(jobData);
    setCurrentView('job-details');
  };

  const handleGenerateRoadmap = (jobData: any) => {
    setSelectedJobData(jobData);
    setCurrentView('roadmap');
  };

  const handleGenerateTodoList = async (roadmapData: any) => {
    try {
      const { job, roadmapItems, graduationDate, freeTimeSchedule } = roadmapData;
      
      // First, save the roadmap to get the roadmap ID
      const { data: savedRoadmap, error: roadmapError } = await supabase
        .from('saved_roadmaps')
        .insert({
          user_id: user?.id,
          title: `AI-Generated ${job.title} Roadmap`,
          description: `Personalized learning path to become a ${job.title}, generated based on your profile and current job market trends.`,
          career_goal: job.title,
          roadmap_items: roadmapItems,
          is_ai_generated: true,
        })
        .select()
        .single();

      if (roadmapError) throw roadmapError;

      // Create a todo group for this roadmap
      const { data: todoGroup, error: groupError } = await supabase
        .from('todo_groups')
        .insert({
          user_id: user?.id,
          roadmap_id: savedRoadmap.id,
          name: `${job.title} Learning Path`,
          description: `Tasks for becoming a ${job.title}`,
          color: '#3B82F6'
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Create detailed todos linked to the todo group
      const todos = roadmapItems.flatMap((item: any) => [
        {
          user_id: user?.id,
          todo_group_id: todoGroup.id,
          title: `Start: ${item.title}`,
          description: item.description,
          due_date: item.deadline,
          priority: 'high'
        },
        {
          user_id: user?.id,
          todo_group_id: todoGroup.id,
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
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
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

  if (currentView === 'job-details' && selectedJobData) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="max-w-6xl mx-auto">
            <JobDetails 
              job={selectedJobData.job}
              analysis={selectedJobData.analysis}
              onBack={clearSearchAndReturnToDashboard}
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
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="max-w-6xl mx-auto">
            <RoadmapGenerator 
              jobData={selectedJobData}
              onBack={() => setCurrentView('job-details')}
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
                SO
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

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-24 max-w-[1400px]">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          {/* Search Jobs / Add Goals - moved to top */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Search and add job goals
              </CardTitle>
              <CardDescription>Find roles and save them to your goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Search jobs or fields..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchJobs()}
                  className="text-sm sm:text-base"
                />
                <Button onClick={handleSearchJobs} className="w-full sm:w-auto">Search</Button>
              </div>
              {searchResults.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm text-muted-foreground mb-3">
                    Found {searchResults.length} job{searchResults.length !== 1 ? 's' : ''} matching your search
                  </div>
                  <div className="space-y-2">
                    {searchResults.map((job) => (
                      <div key={job.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-2 sm:gap-0 hover:shadow-md hover:border-primary/50 transition-all duration-200 cursor-pointer bg-gradient-to-r hover:from-primary/5 hover:to-transparent" onClick={() => handleJobSelect(job)}>
                        <div>
                          <div className="font-medium text-sm">{job.title}</div>
                          <div className="text-xs text-muted-foreground">{job.field}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{job.compatibility}% Match</Badge>
                          <div className="text-xs text-primary font-medium">Click to view details →</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions & Alerts and Personalized News - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Actions & Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Actions & Alerts
                  <Badge variant="secondary" className="ml-auto">
                    {actionsCount} pending
                  </Badge>
                </CardTitle>
                <CardDescription>Your personalized actions and important updates</CardDescription>
              </CardHeader>
              <CardContent>
                <ActionsAlerts onActionsCountChange={setActionsCount} />
              </CardContent>
            </Card>

            {/* Personalized News */}
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
          </div>


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
                      onClick={() => handleCareerPathSelect(path)}
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
                <Button variant="outline" className="w-full justify-start" onClick={() => setCurrentView('exploration')}>
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