import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  Circle, 
  Calendar,
  BarChart3,
  Target,
  Clock,
  ListTodo
} from 'lucide-react';

export default function TodoList() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState<any[]>([]);
  const [roadmapItems, setRoadmapItems] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    loadTodoData();
  }, [session, navigate]);

  const loadTodoData = async () => {
    try {
      // Load todos
      const { data: todosData } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user?.id)
        .order('due_date', { ascending: true });
      
      if (todosData) setTodos(todosData);

      // Load roadmap items
      const { data: roadmapData } = await supabase
        .from('roadmap_items')
        .select('*')
        .eq('user_id', user?.id)
        .order('order_index', { ascending: true });
      
      if (roadmapData) setRoadmapItems(roadmapData);

      // Load selected job (mock for now)
      setSelectedJob({
        title: "Software Developer",
        company: "Tech Corp",
        compatibility: 85
      });

    } catch (error: any) {
      toast({
        title: "Error loading todo data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTodo = async (todoId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !completed })
        .eq('id', todoId);

      if (error) throw error;
      loadTodoData();
    } catch (error: any) {
      toast({
        title: "Error updating todo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const calculateProgress = () => {
    if (todos.length === 0) return 0;
    const completed = todos.filter(todo => todo.completed).length;
    return Math.round((completed / todos.length) * 100);
  };

  const getUpcomingDeadlines = () => {
    const today = new Date();
    const upcoming = todos
      .filter(todo => !todo.completed && todo.due_date)
      .filter(todo => {
        const dueDate = new Date(todo.due_date);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0;
      })
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    
    return upcoming;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading your todos...</p>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();
  const upcomingDeadlines = getUpcomingDeadlines();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">To-Do List</h1>
            <p className="text-muted-foreground">Track your learning progress and deadlines</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Progress Overview */}
            <div className="lg:col-span-1 space-y-6">
              {/* Selected Job */}
              {selectedJob && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Current Goal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold">{selectedJob.title}</h3>
                        <p className="text-sm text-muted-foreground">{selectedJob.company}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Compatibility</span>
                        <Badge variant="secondary">{selectedJob.compatibility}%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Progress Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Overall Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completion</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{todos.filter(t => t.completed).length}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-500">{todos.filter(t => !t.completed).length}</div>
                      <div className="text-xs text-muted-foreground">Remaining</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Deadlines */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Upcoming Deadlines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingDeadlines.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingDeadlines.slice(0, 3).map((todo) => (
                        <div key={todo.id} className="flex items-center justify-between text-sm">
                          <span className="truncate">{todo.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {new Date(todo.due_date).toLocaleDateString()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Todo List */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ListTodo className="h-5 w-5" />
                    Your Tasks
                  </CardTitle>
                  <CardDescription>Complete these activities to reach your career goals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {todos.length > 0 ? (
                      todos.map((todo) => (
                        <div 
                          key={todo.id} 
                          className={`p-4 rounded-lg border ${todo.completed ? 'bg-green-50 border-green-200' : 'bg-card'}`}
                        >
                          <div className="flex items-start gap-3">
                            <button 
                              onClick={() => toggleTodo(todo.id, todo.completed)}
                              className="mt-1"
                            >
                              {todo.completed ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <Circle className="h-5 w-5 text-muted-foreground" />
                              )}
                            </button>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <h4 className={`font-medium ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {todo.title}
                                </h4>
                                {todo.priority && (
                                  <Badge 
                                    variant={todo.priority === 'high' ? 'destructive' : todo.priority === 'medium' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {todo.priority}
                                  </Badge>
                                )}
                              </div>
                              {todo.description && (
                                <p className={`text-sm ${todo.completed ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                                  {todo.description}
                                </p>
                              )}
                              {todo.due_date && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  Due: {new Date(todo.due_date).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <ListTodo className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground mb-2">No tasks yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Complete your profile setup and select a career path to generate your personalized roadmap.
                        </p>
                        <Button onClick={() => navigate('/dashboard')}>
                          Go to Dashboard
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Roadmap Items */}
              {roadmapItems.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Roadmap</CardTitle>
                    <CardDescription>Your personalized learning path</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {roadmapItems.map((item) => (
                        <div 
                          key={item.id} 
                          className={`p-3 rounded-lg border ${item.completed ? 'bg-green-50 border-green-200' : 'bg-muted/50'}`}
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
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}