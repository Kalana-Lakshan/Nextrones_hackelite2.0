import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/integrations/supabase/types';

export interface SavedChat {
  id: string;
  user_id: string;
  title: string;
  messages: any[];
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useSavedChats = () => {
  const { user } = useAuth();
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved chats from Supabase
  const loadSavedChats = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('saved_chats')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      setSavedChats(data || []);
    } catch (err) {
      console.error('Error loading saved chats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load saved chats');
    } finally {
      setLoading(false);
    }
  };

  // Save a new chat to Supabase
  const saveChat = async (title: string, messages: Message[]): Promise<string | null> => {
    if (!user) return null;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('saved_chats')
        .insert({
          user_id: user.id,
          title,
          messages: messages as any
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Add to local state
      setSavedChats(prev => [data, ...prev]);
      return data.id;
    } catch (err) {
      console.error('Error saving chat:', err);
      setError(err instanceof Error ? err.message : 'Failed to save chat');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing chat
  const updateChat = async (chatId: string, title: string, messages: Message[]): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('saved_chats')
        .update({
          title,
          messages: messages as any
        })
        .eq('id', chatId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Update local state
      setSavedChats(prev => 
        prev.map(chat => 
          chat.id === chatId 
            ? { ...chat, title, messages: messages as any, updated_at: new Date().toISOString() }
            : chat
        )
      );

      return true;
    } catch (err) {
      console.error('Error updating chat:', err);
      setError(err instanceof Error ? err.message : 'Failed to update chat');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete a chat from Supabase
  const deleteChat = async (chatId: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('saved_chats')
        .delete()
        .eq('id', chatId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Remove from local state
      setSavedChats(prev => prev.filter(chat => chat.id !== chatId));
      return true;
    } catch (err) {
      console.error('Error deleting chat:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete chat');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load saved chats when user changes
  useEffect(() => {
    if (user) {
      loadSavedChats();
    } else {
      setSavedChats([]);
    }
  }, [user]);

  return {
    savedChats,
    loading,
    error,
    loadSavedChats,
    saveChat,
    updateChat,
    deleteChat
  };
};

