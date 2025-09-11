import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { deepSeekService } from '@/services/deepseekService';
import { useToast } from '@/hooks/use-toast';

interface ActionAlert {
  id: string;
  user_id: string;
  type: 'action' | 'alert' | 'reminder' | 'achievement' | 'recommendation';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action_text?: string;
  action_url?: string;
  category: string;
  status: 'pending' | 'completed' | 'dismissed' | 'expired';
  metadata: Record<string, any>;
  expires_at?: string;
  completed_at?: string;
  dismissed_at?: string;
  created_at: string;
  updated_at: string;
}

interface SkillInsight {
  id: string;
  user_id: string;
  insight_type: 'skill_gap' | 'learning_recommendation' | 'career_opportunity' | 'progress_milestone' | 'market_trend';
  title: string;
  description: string;
  confidence_score: number;
  source_data: Record<string, any>;
  is_actionable: boolean;
  generated_by: string;
  created_at: string;
  expires_at?: string;
}

interface UserProfile {
  skills: string[];
  interests: string[];
  experience_level: string;
  goals: string[];
}

export const useActionsAlerts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [actions, setActions] = useState<ActionAlert[]>([]);
  const [insights, setInsights] = useState<SkillInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  // Fetch actions and alerts
  const fetchActions = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_actions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActions(data || []);
    } catch (error: any) {
      console.error('Error fetching actions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load actions and alerts',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  // Fetch skill insights
  const fetchInsights = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_skill_insights')
      .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInsights(data || []);
    } catch (error: any) {
      console.error('Error fetching insights:', error);
    }
  }, [user]);

  // Get user profile data for AI analysis
  const getUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!user) return null;

    try {
      // First try to get the profile with all fields
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('skills, interests, experience_level, goals, full_name, current_job_title, target_job_title')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.log('Error fetching full profile, trying with basic fields:', error);
        
        // If that fails, try with just the basic fields that definitely exist
        const { data: basicProfile, error: basicError } = await supabase
          .from('profiles')
          .select('skills, full_name')
          .eq('user_id', user.id)
          .single();

        if (basicError) {
          console.error('Error fetching basic profile:', basicError);
          return null;
        }

        // Return profile with default values for missing fields
        return {
          skills: basicProfile?.skills || [],
          interests: [],
          experience_level: 'beginner',
          goals: []
        };
      }

      if (!profile) {
        console.log('No profile found, creating default profile...');
        // Create a basic profile if none exists
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            full_name: user.user_metadata?.full_name || 'User',
            skills: [],
            interests: [],
            experience_level: 'beginner',
            goals: []
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          return null;
        }

        return {
          skills: newProfile.skills || [],
          interests: newProfile.interests || [],
          experience_level: newProfile.experience_level || 'beginner',
          goals: newProfile.goals || []
        };
      }

      return {
        skills: profile.skills || [],
        interests: profile.interests || [],
        experience_level: profile.experience_level || 'beginner',
        goals: profile.goals || []
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, [user]);

  // Get recent learning activity
  const getRecentActivity = useCallback(async () => {
    if (!user) return [];

    try {
      const { data } = await supabase
        .from('user_learning_activity')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      return data || [];
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }, [user]);

  // Generate AI insights
  const generateAIInsights = useCallback(async () => {
    if (!user || aiAnalyzing) return;

    setAiAnalyzing(true);
    try {
      const profile = await getUserProfile();
      const recentActivity = await getRecentActivity();

      if (!profile) {
        toast({
          title: 'Profile Setup Required',
          description: 'Setting up your profile to enable AI analysis...',
        });
        return;
      }

      // Check if profile has enough data for meaningful analysis
      const hasMinimalData = profile.skills.length > 0 || profile.interests.length > 0 || profile.goals.length > 0;
      
      if (!hasMinimalData) {
        // Instead of showing an error, create some basic actions for new users
        const basicActions = [
          {
            user_id: user.id,
            type: 'action',
            priority: 'high',
            title: 'Complete Your Profile',
            description: 'Add your skills, interests, and goals to get personalized recommendations',
            action_text: 'Complete Profile',
            category: 'Profile Setup',
            status: 'pending',
            metadata: { generated_by: 'system' },
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            user_id: user.id,
            type: 'recommendation',
            priority: 'medium',
            title: 'Explore Popular Skills',
            description: 'Check out trending skills in web development, data science, and AI',
            action_text: 'Explore Skills',
            category: 'Learning',
            status: 'pending',
            metadata: { generated_by: 'system' },
            expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];

        const { error: actionsError } = await supabase
          .from('user_actions')
          .insert(basicActions);

        if (actionsError) {
          console.error('Error creating basic actions:', actionsError);
        }

        await fetchActions();
        
        toast({
          title: 'Welcome to Skillora!',
          description: 'We\'ve added some starter actions. Complete your profile for personalized insights.',
        });
        return;
      }

      // Generate skill insights using DeepSeek
      const skillInsights = await deepSeekService.analyzeUserSkills(profile, recentActivity);
      
      // Save insights to database
      if (skillInsights.length > 0) {
        const insightsToInsert = skillInsights.map(insight => ({
          user_id: user.id,
          insight_type: insight.type,
          title: insight.title,
          description: insight.description,
          confidence_score: insight.confidence_score,
          source_data: { generated_by: 'deepseek_ai', profile, recent_activity: recentActivity },
          is_actionable: insight.actionable,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        }));

        const { error: insightsError } = await supabase
          .from('user_skill_insights')
          .insert(insightsToInsert);

        if (insightsError) throw insightsError;
      }

      // Generate personalized actions
      const personalizedActions = await deepSeekService.generatePersonalizedActions(profile, actions);
      
      // Save actions to database
      if (personalizedActions.length > 0) {
        const actionsToInsert = personalizedActions.map(action => ({
          user_id: user.id,
          type: action.type,
          priority: action.priority,
          title: action.title,
          description: action.description,
          action_text: action.action_text,
          action_url: action.action_url,
          category: action.category,
          status: 'pending',
          metadata: { generated_by: 'deepseek_ai' },
          expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days
        }));

        const { error: actionsError } = await supabase
          .from('user_actions')
          .insert(actionsToInsert);

        if (actionsError) throw actionsError;
      }

      // Refresh data
      await fetchActions();
      await fetchInsights();

      toast({
        title: 'AI Analysis Complete',
        description: 'New personalized insights and actions have been generated',
      });

    } catch (error: any) {
      console.error('Error generating AI insights:', error);
      toast({
        title: 'AI Analysis Failed',
        description: error.message || 'Failed to generate insights. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAiAnalyzing(false);
    }
  }, [user, aiAnalyzing, getUserProfile, getRecentActivity, actions, fetchActions, fetchInsights, toast]);

  // Complete an action
  const completeAction = useCallback(async (actionId: string) => {
    try {
      const { error } = await supabase
        .from('user_actions')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', actionId);

      if (error) throw error;

      setActions(prev => 
        prev.map(action => 
          action.id === actionId 
            ? { ...action, status: 'completed', completed_at: new Date().toISOString() }
            : action
        )
      );

      toast({
        title: 'Action Completed',
        description: 'Great job! Action marked as completed.',
      });
    } catch (error: any) {
      console.error('Error completing action:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete action',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Dismiss an action
  const dismissAction = useCallback(async (actionId: string) => {
    try {
      const { error } = await supabase
        .from('user_actions')
        .update({ 
          status: 'dismissed',
          dismissed_at: new Date().toISOString()
        })
        .eq('id', actionId);

      if (error) throw error;

      setActions(prev => prev.filter(action => action.id !== actionId));

      toast({
        title: 'Action Dismissed',
        description: 'Action has been removed from your list.',
      });
    } catch (error: any) {
      console.error('Error dismissing action:', error);
      toast({
        title: 'Error',
        description: 'Failed to dismiss action',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Record learning activity
  const recordActivity = useCallback(async (activity: {
    activity_type: string;
    platform?: string;
    skill_name?: string;
    course_name?: string;
    progress_percentage?: number;
    time_spent_minutes?: number;
    metadata?: Record<string, any>;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_learning_activity')
        .insert({
          user_id: user.id,
          ...activity
        });

      if (error) throw error;

      // Trigger AI analysis after recording activity
      setTimeout(() => {
        generateAIInsights();
      }, 2000);

    } catch (error: any) {
      console.error('Error recording activity:', error);
    }
  }, [user, generateAIInsights]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to actions changes
    const actionsSubscription = supabase
      .channel('user_actions_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_actions',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('Actions change received:', payload);
          fetchActions();
        }
      )
      .subscribe();

    // Subscribe to insights changes
    const insightsSubscription = supabase
      .channel('user_insights_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_skill_insights',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('Insights change received:', payload);
          fetchInsights();
        }
      )
      .subscribe();

    return () => {
      actionsSubscription.unsubscribe();
      insightsSubscription.unsubscribe();
    };
  }, [user, fetchActions, fetchInsights]);

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchActions();
      fetchInsights();
      setLoading(false);
    }
  }, [user, fetchActions, fetchInsights]);

  // Auto-generate insights on first load
  useEffect(() => {
    if (user && actions.length === 0 && !aiAnalyzing) {
      generateAIInsights();
    }
  }, [user, actions.length, aiAnalyzing, generateAIInsights]);

  const pendingActions = actions.filter(action => action.status === 'pending');
  const completedActions = actions.filter(action => action.status === 'completed');

  return {
    actions,
    insights,
    pendingActions,
    completedActions,
    loading,
    aiAnalyzing,
    completeAction,
    dismissAction,
    recordActivity,
    generateAIInsights,
    refreshData: () => {
      fetchActions();
      fetchInsights();
    }
  };
};
