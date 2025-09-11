import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SavedRoadmap {
  id: string;
  user_id: string;
  title: string;
  description: string;
  career_goal: string;
  roadmap_items: any[];
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export const useSavedRoadmaps = () => {
  const { user } = useAuth();
  const [savedRoadmaps, setSavedRoadmaps] = useState<SavedRoadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch saved roadmaps
  const fetchSavedRoadmaps = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('saved_roadmaps')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setSavedRoadmaps(data || []);
    } catch (err) {
      console.error('Error fetching saved roadmaps:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch saved roadmaps');
    } finally {
      setLoading(false);
    }
  };

  // Save a new roadmap
  const saveRoadmap = async (roadmapData: {
    title: string;
    description: string;
    career_goal: string;
    roadmap_items: any[];
    is_ai_generated?: boolean;
  }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase
        .from('saved_roadmaps')
        .insert({
          user_id: user.id,
          title: roadmapData.title,
          description: roadmapData.description,
          career_goal: roadmapData.career_goal,
          roadmap_items: roadmapData.roadmap_items,
          is_ai_generated: roadmapData.is_ai_generated || false,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Refresh the list
      await fetchSavedRoadmaps();
      return data;
    } catch (err) {
      console.error('Error saving roadmap:', err);
      throw err;
    }
  };

  // Delete a roadmap
  const deleteRoadmap = async (roadmapId: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { error } = await supabase
        .from('saved_roadmaps')
        .delete()
        .eq('id', roadmapId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Refresh the list
      await fetchSavedRoadmaps();
    } catch (err) {
      console.error('Error deleting roadmap:', err);
      throw err;
    }
  };

  // Update a roadmap
  const updateRoadmap = async (roadmapId: string, updates: Partial<SavedRoadmap>) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase
        .from('saved_roadmaps')
        .update(updates)
        .eq('id', roadmapId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Refresh the list
      await fetchSavedRoadmaps();
      return data;
    } catch (err) {
      console.error('Error updating roadmap:', err);
      throw err;
    }
  };

  // Fetch roadmaps on mount and when user changes
  useEffect(() => {
    fetchSavedRoadmaps();
  }, [user]);

  return {
    savedRoadmaps,
    loading,
    error,
    fetchSavedRoadmaps,
    saveRoadmap,
    deleteRoadmap,
    updateRoadmap,
  };
};
