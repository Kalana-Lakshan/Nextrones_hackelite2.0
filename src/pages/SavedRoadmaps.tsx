import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppNav, AppNavInset } from '@/components/AppNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JobExploration } from '@/components/JobExploration';
import { RoadmapGenerator } from '@/components/RoadmapGenerator';
import { useSavedRoadmaps } from '@/hooks/useSavedRoadmaps';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Rocket, 
  Target, 
  TrendingUp, 
  Map, 
  ArrowRight, 
  Star, 
  Zap,
  Bot,
  Calendar,
  Clock,
  Trash2,
  Eye
} from 'lucide-react';

export default function SavedRoadmaps() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<'explore' | 'exploration' | 'roadmap'>('explore');
  const [selectedJobData, setSelectedJobData] = useState<any>(null);
  const { savedRoadmaps, loading, deleteRoadmap, saveRoadmap, fetchSavedRoadmaps } = useSavedRoadmaps();

  const handleStartExploring = () => {
    setCurrentView('exploration');
  };

  const handleBackToExplore = () => {
    setCurrentView('explore');
  };

  const handleBackToExploration = () => {
    setCurrentView('exploration');
  };

  const handleGenerateRoadmap = (jobData: any) => {
    setSelectedJobData(jobData);
    setCurrentView('roadmap');
  };

  const handleRoadmapGenerated = async (roadmapData: any) => {
    try {
      const { job, roadmapItems } = roadmapData;
      
      // Save the roadmap using the hook
      const savedRoadmap = await saveRoadmap({
        title: `AI-Generated ${job.title} Roadmap`,
        description: `Personalized learning path to become a ${job.title}, generated based on your profile and current job market trends.`,
        career_goal: job.title,
        roadmap_items: roadmapItems,
        is_ai_generated: true,
      });

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
        title: "Roadmap & Todo List Created!",
        description: "Your AI-generated roadmap and todo list have been created successfully.",
      });

      // Go back to explore view
      setCurrentView('explore');
    } catch (error: any) {
      toast({
        title: "Error saving roadmap",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteRoadmap = async (roadmapId: string) => {
    try {
      await deleteRoadmap(roadmapId);
    } catch (error) {
      console.error('Error deleting roadmap:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // If user is in exploration mode, show JobExploration component
  if (currentView === 'exploration') {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="max-w-6xl mx-auto">
            <JobExploration 
              onBack={handleBackToExplore}
              onGenerateRoadmap={handleGenerateRoadmap}
            />
          </div>
        </div>
      </div>
    );
  }

  // If user is in roadmap generation mode, show RoadmapGenerator component
  if (currentView === 'roadmap' && selectedJobData) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="max-w-6xl mx-auto">
            <RoadmapGenerator 
              jobData={selectedJobData}
              onBack={handleBackToExploration}
              onGenerateTodoList={handleRoadmapGenerated}
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
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-[1400px]">
          <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
            {/* AI-Generated Roadmaps Section - Show first if roadmaps exist */}
            {savedRoadmaps.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    Your Saved Roadmaps
                  </CardTitle>
                  <CardDescription>Your personalized learning pathways created by AI</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {savedRoadmaps.map((roadmap) => (
                      <div key={roadmap.id} className="p-4 border rounded-lg bg-white/50 backdrop-blur-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-lg">{roadmap.title}</h4>
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Bot className="h-3 w-3" />
                                AI Generated
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mb-2">{roadmap.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                {roadmap.career_goal}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(roadmap.created_at)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {roadmap.roadmap_items.length} steps
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate('/dashboard')}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteRoadmap(roadmap.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Show exploration section only when no roadmaps exist */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  Start Exploring
                </CardTitle>
                <CardDescription>Discover career opportunities and find your perfect path</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      Ready to explore your career options?
                    </h3>
                    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                      Discover job opportunities, analyze career paths, and find the perfect role that matches your skills and interests.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 p-3 sm:p-4 bg-white/30 backdrop-blur-sm rounded-xl border border-white/20">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium">Find your ideal career path</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 sm:p-4 bg-white/30 backdrop-blur-sm rounded-xl border border-white/20">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium">Analyze market trends and opportunities</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 sm:p-4 bg-white/30 backdrop-blur-sm rounded-xl border border-white/20">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Map className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium">Create personalized learning roadmaps</span>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Button 
                      onClick={handleStartExploring}
                      size="lg"
                      className="gap-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Rocket className="h-5 w-5" />
                      Start Career Exploration
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    
                    {/* Floating elements */}
                    <div className="absolute -top-4 -right-4 w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                      <Star className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div className="absolute -bottom-4 -left-4 w-8 h-8 sm:w-10 sm:h-10 bg-accent/10 rounded-full flex items-center justify-center animate-bounce">
                      <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
                    </div>
                  </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add New Roadmap Section - Always show */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  Create New Roadmap
                </CardTitle>
                <CardDescription>Generate a new personalized learning roadmap</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Button 
                    onClick={handleStartExploring}
                    size="lg"
                    variant="outline"
                    className="gap-3"
                  >
                    <Rocket className="h-5 w-5" />
                    Explore Career Options
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppNavInset>
    </SidebarProvider>
  );
}


