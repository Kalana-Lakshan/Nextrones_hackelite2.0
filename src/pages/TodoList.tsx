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
  Sparkles,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  FileText,
  Activity,
  TrendingDown,
  Minus
} from 'lucide-react';
import { AppNav, AppNavInset } from '@/components/AppNav';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function TodoList() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState<any[]>([]);
  const [todoGroups, setTodoGroups] = useState<any[]>([]);
  const [savedRoadmaps, setSavedRoadmaps] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>({
    dailyCompletions: [],
    weeklyTrend: [],
    productivityScore: 0,
    streakDays: 0,
    totalCompleted: 0,
    averageCompletionTime: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });
  const [expandedLists, setExpandedLists] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    loadTodoData();
  }, [session, navigate]);

  const loadTodoData = async () => {
    try {
      // Load todos with their groups
      const { data: todosData } = await supabase
        .from('todos')
        .select(`
          *,
          todo_groups (
            id,
            name,
            description,
            color,
            roadmap_id
          )
        `)
        .eq('user_id', user?.id)
        .order('due_date', { ascending: true });
      
      if (todosData) {
        setTodos(todosData);
        calculateAnalytics(todosData);
      }

      // Load todo groups
      const { data: groupsData } = await supabase
        .from('todo_groups')
        .select(`
          *,
          saved_roadmaps (
            id,
            title,
            career_goal
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (groupsData) setTodoGroups(groupsData);

      // Load saved roadmaps for reference
      const { data: roadmapsData } = await supabase
        .from('saved_roadmaps')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (roadmapsData) setSavedRoadmaps(roadmapsData);

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

  const calculateAnalytics = (todosData: any[]) => {
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    // Calculate daily completions for last 7 days
    const dailyCompletions = last7Days.map(date => {
      const completedOnDate = todosData.filter(todo => 
        todo.completed && 
        todo.updated_at && 
        todo.updated_at.split('T')[0] === date
      ).length;
      return {
        date,
        completed: completedOnDate,
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
      };
    });

    // Calculate weekly trend (completions per week)
    const weeklyTrend = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7) - 6);
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - (i * 7));
      
      const weekCompletions = todosData.filter(todo => 
        todo.completed && 
        todo.updated_at && 
        new Date(todo.updated_at) >= weekStart && 
        new Date(todo.updated_at) <= weekEnd
      ).length;
      
      weeklyTrend.push({
        week: `Week ${4 - i}`,
        completed: weekCompletions
      });
    }

    // Calculate productivity metrics
    const totalCompleted = todosData.filter(todo => todo.completed).length;
    const totalTodos = todosData.length;
    const productivityScore = totalTodos > 0 ? Math.round((totalCompleted / totalTodos) * 100) : 0;

    // Calculate streak (consecutive days with completions)
    let streakDays = 0;
    for (let i = 0; i < last30Days.length; i++) {
      const date = last30Days[i];
      const hasCompletion = todosData.some(todo => 
        todo.completed && 
        todo.updated_at && 
        todo.updated_at.split('T')[0] === date
      );
      if (hasCompletion) {
        streakDays++;
      } else {
        break;
      }
    }

    // Calculate average completion time (simplified)
    const completedTodos = todosData.filter(todo => todo.completed);
    const averageCompletionTime = completedTodos.length > 0 ? 
      Math.round(completedTodos.reduce((acc, todo) => {
        const created = new Date(todo.created_at);
        const updated = new Date(todo.updated_at);
        return acc + (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24); // days
      }, 0) / completedTodos.length) : 0;

    setAnalyticsData({
      dailyCompletions,
      weeklyTrend,
      productivityScore,
      streakDays,
      totalCompleted,
      averageCompletionTime
    });
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

  const handleSearch = () => {
    setIsSearching(true);
    // The search is already handled by the getFilteredTodos function
    // This function just provides visual feedback
    setTimeout(() => setIsSearching(false), 500);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  const toggleListExpansion = (listId: string) => {
    const newExpanded = new Set(expandedLists);
    if (newExpanded.has(listId)) {
      newExpanded.delete(listId);
    } else {
      newExpanded.add(listId);
    }
    setExpandedLists(newExpanded);
  };

  // Group todos by their todo groups
  const groupedTodos = todoGroups.map(group => {
    const groupTodos = todos.filter(todo => todo.todo_group_id === group.id);
    const completedTasks = groupTodos.filter(todo => todo.completed).length;
    
    return {
      ...group,
      totalTasks: groupTodos.length,
      completedTasks,
      tasks: groupTodos
    };
  });

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

  const getProductivityInsight = () => {
    const { productivityScore, streakDays, totalCompleted } = analyticsData;
    
    if (totalCompleted === 0) {
      return {
        title: "Start Your Learning Journey",
        subtitle: "Complete your first task to see your progress analytics",
        icon: <Target className="h-6 w-6 text-blue-500" />,
        color: "text-blue-600"
      };
    }
    
    if (streakDays >= 7) {
      return {
        title: `${streakDays} Day Streak! 🔥`,
        subtitle: `You've completed ${totalCompleted} tasks with ${productivityScore}% productivity`,
        icon: <Trophy className="h-6 w-6 text-yellow-500" />,
        color: "text-yellow-600"
      };
    }
    
    if (productivityScore >= 80) {
      return {
        title: "High Productivity! ⚡",
        subtitle: `${productivityScore}% completion rate - you're on fire!`,
        icon: <Zap className="h-6 w-6 text-green-500" />,
        color: "text-green-600"
      };
    }
    
    return {
      title: "Keep Building Momentum",
      subtitle: `${productivityScore}% completion rate - every step counts!`,
      icon: <TrendingUp className="h-6 w-6 text-purple-500" />,
      color: "text-purple-600"
    };
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
    <SidebarProvider>
      <AppNav />
      <AppNavInset className="bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm sm:text-base">
                SO
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">To-Do List</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Track your learning progress and deadlines</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate('/dashboard')} className="w-full sm:w-auto">
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-[1400px]">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          {/* Motivational Banner */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-3 rounded-full">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  {(() => {
                    const insight = getProductivityInsight();
                    return (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          {insight.icon}
                          <h3 className={`font-semibold text-lg ${insight.color}`}>{insight.title}</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">{insight.subtitle}</p>
                      </>
                    );
                  })()}
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

          {/* Analytics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Productivity Score */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Productivity Score</p>
                    <p className="text-2xl font-bold">{analyticsData.productivityScore}%</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <Progress value={analyticsData.productivityScore} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Streak Days */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                    <p className="text-2xl font-bold">{analyticsData.streakDays} days</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Trophy className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analyticsData.streakDays >= 7 ? "On fire! 🔥" : "Keep it up!"}
                </p>
              </CardContent>
            </Card>

            {/* Total Completed */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tasks Completed</p>
                    <p className="text-2xl font-bold">{analyticsData.totalCompleted}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analyticsData.totalCompleted > 0 ? "Great progress!" : "Start completing tasks"}
                </p>
              </CardContent>
            </Card>

            {/* Average Completion Time */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg. Completion</p>
                    <p className="text-2xl font-bold">{analyticsData.averageCompletionTime}d</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analyticsData.averageCompletionTime > 0 ? "Per task" : "No data yet"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Daily Progress (Last 7 Days)
              </CardTitle>
              <CardDescription>Your task completion trend over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-end justify-between h-32 gap-2">
                  {analyticsData.dailyCompletions.map((day, index) => {
                    const maxHeight = Math.max(...analyticsData.dailyCompletions.map(d => d.completed));
                    const height = maxHeight > 0 ? (day.completed / maxHeight) * 100 : 0;
                    return (
                      <div key={day.date} className="flex flex-col items-center flex-1">
                        <div className="flex flex-col items-center justify-end h-full w-full">
                          <div 
                            className="bg-primary rounded-t-sm w-full transition-all duration-300 hover:bg-primary/80"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-2 text-center">
                          <div className="font-medium">{day.day}</div>
                          <div className="text-primary font-bold">{day.completed}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>Tasks completed per day</span>
                  <span>{Math.max(...analyticsData.dailyCompletions.map(d => d.completed))}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Weekly Trend
              </CardTitle>
              <CardDescription>Your productivity over the past 4 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-end justify-between h-32 gap-4">
                  {analyticsData.weeklyTrend.map((week, index) => {
                    const maxHeight = Math.max(...analyticsData.weeklyTrend.map(w => w.completed));
                    const height = maxHeight > 0 ? (week.completed / maxHeight) * 100 : 0;
                    const isIncreasing = index > 0 && week.completed > analyticsData.weeklyTrend[index - 1].completed;
                    const isDecreasing = index > 0 && week.completed < analyticsData.weeklyTrend[index - 1].completed;
                    
                    return (
                      <div key={week.week} className="flex flex-col items-center flex-1">
                        <div className="flex flex-col items-center justify-end h-full w-full">
                          <div 
                            className={`rounded-t-sm w-full transition-all duration-300 hover:opacity-80 ${
                              isIncreasing ? 'bg-green-500' : 
                              isDecreasing ? 'bg-red-500' : 
                              'bg-primary'
                            }`}
                            style={{ height: `${height}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-2 text-center">
                          <div className="font-medium">{week.week}</div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold">{week.completed}</span>
                            {isIncreasing && <TrendingUp className="h-3 w-3 text-green-500" />}
                            {isDecreasing && <TrendingDown className="h-3 w-3 text-red-500" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>Tasks completed per week</span>
                  <span>{Math.max(...analyticsData.weeklyTrend.map(w => w.completed))}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search and Filter Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  )}
                </div>
                <Button 
                  onClick={handleSearch}
                  variant="outline"
                  className="gap-2"
                  disabled={isSearching}
                >
                  <Search className={`h-4 w-4 ${isSearching ? 'animate-spin' : ''}`} />
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filterStatus === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('all')}
                    className="text-xs sm:text-sm"
                  >
                    All ({todos.length})
                  </Button>
                  <Button
                    variant={filterStatus === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('pending')}
                    className="text-xs sm:text-sm"
                  >
                    Pending ({todos.filter(t => !t.completed).length})
                  </Button>
                  <Button
                    variant={filterStatus === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('completed')}
                    className="text-xs sm:text-sm"
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

          {/* Generated To-Do Lists */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Generated To-Do Lists
              </CardTitle>
              <CardDescription>Your personalized learning roadmaps and task lists</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groupedTodos.map((list) => {
                  const isExpanded = expandedLists.has(list.id);
                  const progress = Math.round((list.completedTasks / list.totalTasks) * 100);
                  
                  return (
                    <div key={list.id} className="border rounded-lg overflow-hidden">
                      <div 
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleListExpansion(list.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            )}
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-primary" />
                              <div>
                                <h3 className="font-semibold text-lg">{list.name}</h3>
                                <p className="text-sm text-muted-foreground">{list.description}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {list.completedTasks}/{list.totalTasks} tasks
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {progress}% complete
                              </div>
                            </div>
                            <div className="w-16">
                              <Progress value={progress} className="h-2" />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="border-t bg-gray-50/50 p-4">
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm text-muted-foreground mb-3">
                              Tasks in this roadmap:
                            </h4>
                            {list.tasks.map((task) => (
                              <div 
                                key={task.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border ${
                                  task.completed 
                                    ? 'bg-green-50 border-green-200' 
                                    : 'bg-white border-gray-200'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {task.completed ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <span className={`text-sm ${
                                    task.completed ? 'line-through text-muted-foreground' : ''
                                  }`}>
                                    {task.title}
                                  </span>
                                </div>
                                <div className="ml-auto">
                                  <Badge 
                                    variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {task.priority}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
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

            </div>
          </div>
        </div>
      </div>
      </AppNavInset>
    </SidebarProvider>
  );
}