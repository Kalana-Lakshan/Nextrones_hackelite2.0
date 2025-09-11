import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://pbhqmggvhfzqdpghqlyr.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiaHFtZ2d2aGZ6cWRwZ2hxbHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NTcyNjUsImV4cCI6MjA3MTMzMzI2NX0.5yCksICgNOGMCPHKPvAO7GB97Jir3i-e4WuZryAiAqU";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types based on your schema
export interface GitHubUser {
  id?: string;
  user_id?: string;
  github_id: number;
  username: string;
  avatar_url?: string;
  bio?: string;
  public_repos?: number;
  followers?: number;
  following?: number;
  html_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GitHubRepository {
  id?: string;
  github_user_id?: string;
  repo_id: number;
  name: string;
  full_name: string;
  description?: string;
  html_url?: string;
  stargazers_count?: number;
  forks_count?: number;
  language?: string;
  languages?: Record<string, number>;
  topics?: string[];
  is_fork?: boolean;
  created_at?: string;
  updated_at?: string;
  pushed_at?: string;
  last_synced?: string;
}

export interface GitHubContribution {
  id?: string;
  github_user_id?: string;
  repo_id: number;
  commit_count?: number;
  additions?: number;
  deletions?: number;
  contribution_period?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserKnowledgeProfile {
  id?: string;
  user_id?: string;
  skills?: string[];
  interests?: string[];
  career_goals?: string[];
  experience_level?: string;
  preferred_locations?: string[];
  salary_expectations?: Record<string, any>;
  work_preferences?: Record<string, any>;
  learning_goals?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface UserLearningProgress {
  id?: string;
  user_id?: string;
  skill_name: string;
  skill_id?: string;
  proficiency_level?: string;
  learning_status?: string;
  learning_resources?: Record<string, any>;
  progress_notes?: string;
  created_at?: string;
  updated_at?: string;
}