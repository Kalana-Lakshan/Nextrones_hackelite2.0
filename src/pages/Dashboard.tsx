import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Target,
  Map,
  LogOut
} from 'lucide-react';

export default function Dashboard() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [session, navigate]);

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

          {/* Career Exploration Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Field-wise Exploration
                </CardTitle>
                <CardDescription>Explore opportunities by industry and field</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Explore Fields</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Job-wise Exploration
                </CardTitle>
                <CardDescription>Browse specific job roles and requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Browse Jobs</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Higher Studies
                </CardTitle>
                <CardDescription>Explore master's and PhD pathways</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Explore Studies</Button>
              </CardContent>
            </Card>
          </div>

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
    </div>
  );
}