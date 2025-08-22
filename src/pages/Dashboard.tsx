import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  Circle, 
  Plus, 
  Upload, 
  Github, 
  Linkedin, 
  BookOpen, 
  LogOut,
  User,
  Target,
  Map,
  ListTodo
} from 'lucide-react';

export default function Dashboard() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [todos, setTodos] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [roadmap, setRoadmap] = useState<any[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [newSkill, setNewSkill] = useState('');

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

      // Load todos
      const { data: todosData } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (todosData) setTodos(todosData);

      // Load progress
      const { data: progressData } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user?.id);
      
      if (progressData) setProgress(progressData);

      // Load roadmap
      const { data: roadmapData } = await supabase
        .from('roadmap_items')
        .select('*')
        .eq('user_id', user?.id)
        .order('order_index', { ascending: true });
      
      if (roadmapData) setRoadmap(roadmapData);
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

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    
    try {
      const { error } = await supabase
        .from('todos')
        .insert([{
          user_id: user?.id,
          title: newTodo,
          completed: false
        }]);

      if (error) throw error;
      
      setNewTodo('');
      loadDashboardData();
      toast({
        title: "Todo added",
        description: "Your todo has been added successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error adding todo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleTodo = async (todoId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !completed })
        .eq('id', todoId);

      if (error) throw error;
      loadDashboardData();
    } catch (error: any) {
      toast({
        title: "Error updating todo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addSkill = async () => {
    if (!newSkill.trim()) return;
    
    try {
      const { error } = await supabase
        .from('progress')
        .insert([{
          user_id: user?.id,
          skill_name: newSkill,
          current_level: 0,
          target_level: 100,
          category: 'general'
        }]);

      if (error) throw error;
      
      setNewSkill('');
      loadDashboardData();
      toast({
        title: "Skill added",
        description: "Your skill has been added to tracking.",
      });
    } catch (error: any) {
      toast({
        title: "Error adding skill",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const connectAccount = async (platform: 'linkedin' | 'github' | 'coursera', url: string) => {
    try {
      const updateData: any = {};
      updateData[`${platform}_connected`] = true;
      updateData[`${platform}_url`] = url;

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      loadDashboardData();
      toast({
        title: "Account connected",
        description: `Your ${platform} account has been connected successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error connecting account",
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
                <h1 className="text-xl font-bold text-foreground">Welcome back, {profile?.full_name || user?.email}</h1>
                <p className="text-sm text-muted-foreground">Continue your career journey</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Todos and Quick Actions */}
          <div className="space-y-6">
            {/* Todo List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListTodo className="h-5 w-5" />
                  Todo List
                </CardTitle>
                <CardDescription>Track your daily tasks and goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a new todo..."
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                  />
                  <Button onClick={addTodo} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {todos.map((todo) => (
                    <div 
                      key={todo.id} 
                      className="flex items-center gap-2 p-2 rounded-lg border bg-muted/50"
                    >
                      <button onClick={() => toggleTodo(todo.id, todo.completed)}>
                        {todo.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                      <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {todo.title}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Account Connections */}
            <Card>
              <CardHeader>
                <CardTitle>Account Connections</CardTitle>
                <CardDescription>Connect your professional accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ConnectionButton
                  icon={<Linkedin className="h-4 w-4" />}
                  label="LinkedIn"
                  connected={profile?.linkedin_connected}
                  onConnect={(url) => connectAccount('linkedin', url)}
                />
                <ConnectionButton
                  icon={<Github className="h-4 w-4" />}
                  label="GitHub"
                  connected={profile?.github_connected}
                  onConnect={(url) => connectAccount('github', url)}
                />
                <ConnectionButton
                  icon={<BookOpen className="h-4 w-4" />}
                  label="Coursera"
                  connected={profile?.coursera_connected}
                  onConnect={(url) => connectAccount('coursera', url)}
                />
              </CardContent>
            </Card>

            {/* Upload Curriculum */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Curriculum
                </CardTitle>
                <CardDescription>Upload your curriculum as PDF</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full gap-2">
                  <Upload className="h-4 w-4" />
                  Choose PDF File
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Progress */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Current Progress
                </CardTitle>
                <CardDescription>Track your skill development</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill to track..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button onClick={addSkill} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  {progress.map((skill) => (
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
                      No skills tracked yet. Add one above to get started!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Roadmap */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  Learning Roadmap
                </CardTitle>
                <CardDescription>Your personalized career path</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {roadmap.map((item) => (
                  <div 
                    key={item.id} 
                    className={`p-4 rounded-lg border ${item.completed ? 'bg-green-50 border-green-200' : 'bg-muted/50'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${item.completed ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                        {item.platform && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {item.platform}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {roadmap.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground text-sm mb-4">
                      No roadmap items yet. Connect your accounts and upload your curriculum to generate a personalized roadmap!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Connection Button Component
function ConnectionButton({ 
  icon, 
  label, 
  connected, 
  onConnect 
}: { 
  icon: React.ReactNode; 
  label: string; 
  connected: boolean; 
  onConnect: (url: string) => void;
}) {
  const [url, setUrl] = useState('');

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      {connected ? (
        <Badge variant="secondary">Connected</Badge>
      ) : (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">Connect</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect {label}</DialogTitle>
              <DialogDescription>
                Enter your {label} profile URL to connect your account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="url">Profile URL</Label>
                <Input
                  id="url"
                  placeholder={`Enter your ${label} profile URL`}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <Button 
                onClick={() => {
                  onConnect(url);
                  setUrl('');
                }} 
                className="w-full"
                disabled={!url.trim()}
              >
                Connect Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}