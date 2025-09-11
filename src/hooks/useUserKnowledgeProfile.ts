import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/integrations/supabase/types';

type UserKnowledgeProfile = Tables<'user_knowledge_profiles'>;
type Profile = Tables<'profiles'>;

export const useUserKnowledgeProfile = () => {
  const { user } = useAuth();
  const [knowledgeProfile, setKnowledgeProfile] = useState<UserKnowledgeProfile | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user knowledge profile
        const { data: knowledgeData, error: knowledgeError } = await supabase
          .from('user_knowledge_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (knowledgeError && knowledgeError.code !== 'PGRST116') {
          console.error('Error fetching knowledge profile:', knowledgeError);
        }

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
        }

        setKnowledgeProfile(knowledgeData);
        setProfile(profileData);
      } catch (err) {
        console.error('Error in fetchUserData:', err);
        setError('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const createKnowledgeProfile = async (profileData: Partial<UserKnowledgeProfile>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_knowledge_profiles')
        .insert({
          user_id: user.id,
          ...profileData,
        })
        .select()
        .single();

      if (error) throw error;

      setKnowledgeProfile(data);
      return data;
    } catch (err) {
      console.error('Error creating knowledge profile:', err);
      setError('Failed to create knowledge profile');
      return null;
    }
  };

  const updateKnowledgeProfile = async (updates: Partial<UserKnowledgeProfile>) => {
    if (!user || !knowledgeProfile) return null;

    try {
      const { data, error } = await supabase
        .from('user_knowledge_profiles')
        .update(updates)
        .eq('id', knowledgeProfile.id)
        .select()
        .single();

      if (error) throw error;

      setKnowledgeProfile(data);
      return data;
    } catch (err) {
      console.error('Error updating knowledge profile:', err);
      setError('Failed to update knowledge profile');
      return null;
    }
  };

  return {
    knowledgeProfile,
    profile,
    loading,
    error,
    createKnowledgeProfile,
    updateKnowledgeProfile,
  };
};

