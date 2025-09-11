import { supabase } from './supabaseClient';

export class DatabaseUtils {
  // Clean up old sync data (optional utility)
  static async cleanupOldSyncData(daysOld: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      // Clean up old chatbot interactions
      const { error: chatbotError } = await supabase
        .from('chatbot_interactions')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (chatbotError) {
        console.error('Error cleaning chatbot interactions:', chatbotError);
      }

      // Clean up old search data
      const { error: searchError } = await supabase
        .from('chatbot_searches')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (searchError) {
        console.error('Error cleaning search data:', searchError);
      }

      console.log(`Cleaned up data older than ${daysOld} days`);
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  // Get user statistics
  static async getUserStats(userId: string): Promise<{
    totalSkills: number;
    totalRepositories: number;
    totalCommits: number;
    experienceLevel: string;
    topSkills: string[];
    recentActivity: any[];
  }> {
    try {
      // Get skills count
      const { data: profile } = await supabase
        .from('user_knowledge_profiles')
        .select('skills, experience_level')
        .eq('user_id', userId)
        .single();

      // Get GitHub user
      const { data: githubUser } = await supabase
        .from('github_users')
        .select('id, public_repos')
        .eq('user_id', userId)
        .single();

      let totalRepositories = 0;
      let totalCommits = 0;
      let recentActivity: any[] = [];

      if (githubUser) {
        // Get repository count
        const { data: repos } = await supabase
          .from('github_repositories')
          .select('name, updated_at, stargazers_count')
          .eq('github_user_id', githubUser.id)
          .order('updated_at', { ascending: false })
          .limit(10);

        totalRepositories = repos?.length || 0;
        recentActivity = repos || [];

        // Get total commits
        const { data: contributions } = await supabase
          .from('github_contributions')
          .select('commit_count')
          .eq('github_user_id', githubUser.id);

        totalCommits = contributions?.reduce((sum, c) => sum + (c.commit_count || 0), 0) || 0;
      }

      // Get top skills based on learning progress
      const { data: skillsProgress } = await supabase
        .from('user_learning_progress')
        .select('skill_name, proficiency_level')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(5);

      return {
        totalSkills: profile?.skills?.length || 0,
        totalRepositories,
        totalCommits,
        experienceLevel: profile?.experience_level || 'beginner',
        topSkills: skillsProgress?.map(s => s.skill_name) || [],
        recentActivity,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalSkills: 0,
        totalRepositories: 0,
        totalCommits: 0,
        experienceLevel: 'beginner',
        topSkills: [],
        recentActivity: [],
      };
    }
  }

  // Search repositories by technology
  static async searchRepositoriesByTech(
    userId: string,
    technology: string
  ): Promise<any[]> {
    try {
      // Get GitHub user
      const { data: githubUser } = await supabase
        .from('github_users')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!githubUser) return [];

      // Search repositories
      const { data: repos } = await supabase
        .from('github_repositories')
        .select('*')
        .eq('github_user_id', githubUser.id)
        .or(`language.ilike.%${technology}%,topics.cs.{${technology}}`)
        .order('stargazers_count', { ascending: false });

      return repos || [];
    } catch (error) {
      console.error('Error searching repositories:', error);
      return [];
    }
  }

  // Get skill learning path
  static async getSkillLearningPath(userId: string, skillName: string): Promise<{
    currentLevel: string;
    relatedProjects: any[];
    suggestedResources: any[];
    nextSteps: string[];
  }> {
    try {
      // Get current skill progress
      const { data: progress } = await supabase
        .from('user_learning_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('skill_name', skillName)
        .single();

      // Get related GitHub projects
      const { data: githubUser } = await supabase
        .from('github_users')
        .select('id')
        .eq('user_id', userId)
        .single();

      let relatedProjects: any[] = [];
      if (githubUser) {
        const { data: repos } = await supabase
          .from('github_repositories')
          .select('name, description, html_url, language, topics, stargazers_count')
          .eq('github_user_id', githubUser.id)
          .or(`language.ilike.%${skillName}%,topics.cs.{${skillName}}`)
          .order('stargazers_count', { ascending: false })
          .limit(5);

        relatedProjects = repos || [];
      }

      // Generate next steps based on current level
      const nextSteps = this.generateNextSteps(skillName, progress?.proficiency_level || 'beginner');

      return {
        currentLevel: progress?.proficiency_level || 'beginner',
        relatedProjects,
        suggestedResources: progress?.learning_resources || [],
        nextSteps,
      };
    } catch (error) {
      console.error('Error getting learning path:', error);
      return {
        currentLevel: 'beginner',
        relatedProjects: [],
        suggestedResources: [],
        nextSteps: [],
      };
    }
  }

  private static generateNextSteps(skillName: string, currentLevel: string): string[] {
    const steps: { [key: string]: string[] } = {
      beginner: [
        `Learn the basics of ${skillName}`,
        `Complete a tutorial project using ${skillName}`,
        `Read official documentation`,
        `Join ${skillName} community forums`,
      ],
      intermediate: [
        `Build a medium-complexity project with ${skillName}`,
        `Learn advanced ${skillName} concepts`,
        `Contribute to open source ${skillName} projects`,
        `Teach or mentor someone in ${skillName}`,
      ],
      advanced: [
        `Lead a team project using ${skillName}`,
        `Speak at conferences about ${skillName}`,
        `Create ${skillName} libraries or tools`,
        `Mentor others and create educational content`,
      ],
    };

    return steps[currentLevel] || steps.beginner;
  }

  // Export user data for AI processing
  static async exportUserDataForAI(userId: string): Promise<{
    profile: any;
    skills: any[];
    repositories: any[];
    contributions: any[];
    learning_progress: any[];
  }> {
    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('user_knowledge_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Get skills progress
      const { data: learning_progress } = await supabase
        .from('user_learning_progress')
        .select('*')
        .eq('user_id', userId);

      // Get GitHub data
      const { data: githubUser } = await supabase
        .from('github_users')
        .select('*')
        .eq('user_id', userId)
        .single();

      let repositories: any[] = [];
      let contributions: any[] = [];

      if (githubUser) {
        const { data: repos } = await supabase
          .from('github_repositories')
          .select('*')
          .eq('github_user_id', githubUser.id);

        const { data: contribs } = await supabase
          .from('github_contributions')
          .select('*')
          .eq('github_user_id', githubUser.id);

        repositories = repos || [];
        contributions = contribs || [];
      }

      return {
        profile: profile || {},
        skills: learning_progress || [],
        repositories,
        contributions,
        learning_progress: learning_progress || [],
      };
    } catch (error) {
      console.error('Error exporting user data for AI:', error);
      return {
        profile: {},
        skills: [],
        repositories: [],
        contributions: [],
        learning_progress: [],
      };
    }
  }
}