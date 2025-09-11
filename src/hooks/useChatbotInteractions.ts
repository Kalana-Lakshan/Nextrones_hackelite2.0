import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/integrations/supabase/types';

type ChatbotInteraction = Tables<'chatbot_interactions'>;

export const useChatbotInteractions = () => {
  const { user } = useAuth();

  const logInteraction = async (
    messageType: 'user' | 'assistant',
    messageContent: string,
    metadata?: {
      extractedSkills?: any;
      jobData?: any;
      skillAnalysis?: any;
      responseMetadata?: any;
    }
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('chatbot_interactions')
        .insert({
          user_id: user.id,
          message_type: messageType,
          message_content: messageContent,
          extracted_skills: metadata?.extractedSkills || null,
          job_data: metadata?.jobData || null,
          skill_analysis: metadata?.skillAnalysis || null,
          response_metadata: metadata?.responseMetadata || null,
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error logging chatbot interaction:', err);
      return null;
    }
  };

  const getRecentInteractions = async (limit: number = 10) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('chatbot_interactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error('Error fetching recent interactions:', err);
      return [];
    }
  };

  return {
    logInteraction,
    getRecentInteractions,
  };
};

