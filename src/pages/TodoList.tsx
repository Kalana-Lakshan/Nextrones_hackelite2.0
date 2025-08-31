import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  Circle, 
  Calendar,
  BarChart3,
  Target,
  Clock,
  ListTodo,
  Plus,
  Filter,
  Search,
  Trophy,
  Star,
  TrendingUp,
  Lightbulb,
  Zap,
  Award,
  Play,
  BookOpen,
  Users,
  HelpCircle,
  ArrowRight,
  CheckSquare,
  Square,
  AlertTriangle,
  CalendarDays,
  Timer,
  Sparkles
} from 'lucide-react';

export default function TodoList() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState<any[]>([]);
  const [roadmapItems, setRoadmapItems] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });

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
      
      toast({
        title: completed ? "Task marked as incomplete" : "Task completed! 🎉",
        description: completed ? "You can still work on this task" : "Great job! Keep up the momentum!",
      });
    } catch (error: any) {
      toast({
        title: "Error updating todo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addNewTask = async () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Task title required",
        description: "Please enter a title for your task",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('todos')
        .insert({
          user_id: user?.id,
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          due_date: newTask.dueDate || null,
          completed: false
        });

      if (error) throw error;
      
      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
      setShowAddTask(false);
      loadTodoData();
      
      toast({
        title: "Task added successfully!",
        description: "Your new task has been added to your list",
      });
    } catch (error: any) {
      toast({
        title: "Error adding task",
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

  const getFilteredTodos = () => {
    let filtered = todos;
    
    // Filter by status
    if (filterStatus === 'completed') {
      filtered = filtered.filter(todo => todo.completed);
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter(todo => !todo.completed);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(todo => 
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getMotivationalMessage = () => {
    const progress = calculateProgress();
    if (progress === 0) return "Ready to start your journey? Let's begin! 🚀";
    if (progress < 25) return "Great start! Every step counts towards your goals! 💪";
    if (progress < 50) return "You're making excellent progress! Keep going! 🌟";
    if (progress < 75) return "You're more than halfway there! Amazing work! 🎯";
    if (progress < 100) return "Almost there! You're doing fantastic! 🏆";
    return "Congratulations! You've completed all your tasks! 🎉";
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <AlertTriangle className="h-4 w-4 text-green-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
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
  const filteredTodos = getFilteredTodos();
  const completedToday = todos.filter(todo => 
    todo.completed && 
    new Date(todo.updated_at || todo.created_at).toDateString() === new Date().toDateString()
  ).length;

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
                <h1 className="text-xl font-bold text-foreground">To-Do List</h1>
                <p className="text-sm text-muted-foreground">Track your learning progress and deadlines</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Motivational Banner */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-3 rounded-full">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{getMotivationalMessage()}</h3>
                  <p className="text-muted-foreground text-sm">
                    {completedToday > 0 ? `You've completed ${completedToday} task${completedToday > 1 ? 's' : ''} today!` : "Ready to tackle your next challenge?"}
                  </p>
                </div>
                {progress === 100 && (
                  <div className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    <span className="text-sm font-semibold text-yellow-600">All Done!</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Search and Filter Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterStatus === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('all')}
                  >
                    All ({todos.length})
                  </Button>
                  <Button
                    variant={filterStatus === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('pending')}
                  >
                    Pending ({todos.filter(t => !t.completed).length})
                  </Button>
                  <Button
                    variant={filterStatus === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('completed')}
                  >
                    Completed ({todos.filter(t => t.completed).length})
                  </Button>
                </div>
                <Button onClick={() => setShowAddTask(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              </div>
            </CardContent>
          </Card>

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
                  {progress > 0 && (
                    <div className="text-center pt-2">
                      <Badge variant="outline" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        {progress >= 100 ? 'All tasks completed!' : `${progress}% to goal`}
                      </Badge>
                    </div>
                  )}
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

              {/* Quick Tips */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Lightbulb className="h-5 w-5" />
                    Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Break large tasks into smaller, manageable steps</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Timer className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>Set realistic deadlines to avoid overwhelm</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-purple-500 mt-0.5" />
                    <span>Celebrate small wins to stay motivated</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Todo List */}
            <div className="lg:col-span-2 space-y-6">
              {/* Add Task Form */}
              {showAddTask && (
                <Card className="border-primary/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Add New Task</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Task Title *</label>
                      <Input
                        placeholder="Enter task title..."
                        value={newTask.title}
                        onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Input
                        placeholder="Enter task description..."
                        value={newTask.description}
                        onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Priority</label>
                        <select
                          value={newTask.priority}
                          onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Due Date</label>
                        <Input
                          type="date"
                          value={newTask.dueDate}
                          onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={addNewTask}>Add Task</Button>
                      <Button variant="outline" onClick={() => setShowAddTask(false)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ListTodo className="h-5 w-5" />
                    Your Tasks ({filteredTodos.length})
                  </CardTitle>
                  <CardDescription>Complete these activities to reach your career goals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredTodos.length > 0 ? (
                      filteredTodos.map((todo) => (
                        <div 
                          key={todo.id} 
                          className={`p-4 rounded-lg border transition-all duration-200 ${
                            todo.completed 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-card hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button 
                              onClick={() => toggleTodo(todo.id, todo.completed)}
                              className="mt-1 hover:scale-110 transition-transform"
                            >
                              {todo.completed ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                              )}
                            </button>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <h4 className={`font-medium ${
                                  todo.completed ? 'line-through text-muted-foreground' : ''
                                }`}>
                                  {todo.title}
                                </h4>
                                <div className="flex items-center gap-2">
                                  {todo.priority && (
                                    <div className="flex items-center gap-1">
                                      {getPriorityIcon(todo.priority)}
                                      <Badge 
                                        variant={todo.priority === 'high' ? 'destructive' : todo.priority === 'medium' ? 'default' : 'secondary'}
                                        className="text-xs"
                                      >
                                        {todo.priority}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {todo.description && (
                                <p className={`text-sm ${
                                  todo.completed ? 'text-muted-foreground' : 'text-muted-foreground'
                                }`}>
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
                        <h3 className="text-lg font-medium text-muted-foreground mb-2">
                          {searchQuery || filterStatus !== 'all' ? 'No tasks found' : 'No tasks yet'}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {searchQuery || filterStatus !== 'all' 
                            ? 'Try adjusting your search or filters'
                            : 'Complete your profile setup and select a career path to generate your personalized roadmap.'
                          }
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
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Learning Roadmap
                    </CardTitle>
                    <CardDescription>Your personalized learning path</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {roadmapItems.map((item) => (
                        <div 
                          key={item.id} 
                          className={`p-3 rounded-lg border ${
                            item.completed ? 'bg-green-50 border-green-200' : 'bg-muted/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              item.completed ? 'bg-green-500' : 'bg-muted-foreground'
                            }`} />
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