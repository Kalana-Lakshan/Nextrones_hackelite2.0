import { GitHubService } from '../services/githubService';
import { SkillsAnalysisService } from '../services/skillsAnalysisService';
import { supabase } from '../lib/supabaseClient';

/**
 * Scheduled job to sync GitHub data for all connected users
 * This can be run as a cron job or serverless function
 */
export class GitHubSyncJob {
  private githubService: GitHubService;
  private skillsService: SkillsAnalysisService;

  constructor() {
    this.githubService = new GitHubService();
    this.skillsService = new SkillsAnalysisService();
  }

  async runSync(): Promise<void> {
    console.log('Starting scheduled GitHub sync job...');

    try {
      // Get all users with GitHub connected
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_id, github_url')
        .eq('github_connected', true)
        .not('github_url', 'is', null);

      if (error) {
        console.error('Error fetching profiles:', error);
        return;
      }

      if (!profiles || profiles.length === 0) {
        console.log('No GitHub-connected users found');
        return;
      }

      console.log(`Found ${profiles.length} users with GitHub connected`);

      // Process each user
      for (const profile of profiles) {
        try {
          // Extract username from GitHub URL
          const username = this.extractUsernameFromUrl(profile.github_url);
          if (!username) {
            console.log(`Invalid GitHub URL for user ${profile.user_id}: ${profile.github_url}`);
            continue;
          }

          console.log(`Syncing data for user ${profile.user_id} (GitHub: ${username})`);

          // Check if user needs sync (avoid too frequent syncs)
          const shouldSync = await this.shouldSyncUser(profile.user_id);
          if (!shouldSync) {
            console.log(`Skipping sync for ${username} - synced recently`);
            continue;
          }

          // Sync GitHub data
          await this.githubService.syncUserData(username, profile.user_id);

          // Analyze and store skills
          await this.skillsService.analyzeAndStoreSkills(profile.user_id);

          console.log(`Successfully synced data for ${username}`);

          // Add delay to respect GitHub API rate limits
          await this.delay(1000);

        } catch (error) {
          console.error(`Error syncing user ${profile.user_id}:`, error);
          continue; // Continue with next user
        }
      }

      console.log('Completed scheduled GitHub sync job');

    } catch (error) {
      console.error('Error in scheduled sync job:', error);
    }
  }

  private extractUsernameFromUrl(githubUrl: string): string | null {
    try {
      const match = githubUrl.match(/github\.com\/([^\/]+)/);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  }

  private async shouldSyncUser(userId: string): Promise<boolean> {
    try {
      // Check when user was last synced
      const { data: githubUser } = await supabase
        .from('github_users')
        .select('updated_at')
        .eq('user_id', userId)
        .single();

      if (!githubUser) return true; // Never synced before

      const lastSync = new Date(githubUser.updated_at);
      const now = new Date();
      const hoursSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

      // Sync if it's been more than 24 hours
      return hoursSinceSync > 24;

    } catch (error) {
      console.error('Error checking sync status:', error);
      return true; // Sync if we can't determine last sync time
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Run incremental sync (only recent changes)
  async runIncrementalSync(): Promise<void> {
    console.log('Starting incremental GitHub sync...');

    try {
      // Get users who have been active recently
      const { data: recentUsers } = await supabase
        .from('github_users')
        .select('user_id, username, updated_at')
        .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
        .order('updated_at', { ascending: true });

      if (!recentUsers || recentUsers.length === 0) {
        console.log('No recently active users found');
        return;
      }

      for (const user of recentUsers) {
        try {
          console.log(`Incremental sync for ${user.username}`);

          // Only sync repositories (faster than full sync)
          const { data: githubUser } = await supabase
            .from('github_users')
            .select('id')
            .eq('user_id', user.user_id)
            .single();

          if (githubUser) {
            await this.githubService.syncUserRepositories(githubUser.id, user.username);
            await this.skillsService.analyzeAndStoreSkills(user.user_id);
          }

          await this.delay(500); // Shorter delay for incremental sync

        } catch (error) {
          console.error(`Error in incremental sync for ${user.username}:`, error);
        }
      }

    } catch (error) {
      console.error('Error in incremental sync:', error);
    }
  }
}

// Export function for serverless deployment
export async function handler() {
  const job = new GitHubSyncJob();
  await job.runSync();
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'GitHub sync completed' })
  };
}

// Export function for incremental sync
export async function incrementalHandler() {
  const job = new GitHubSyncJob();
  await job.runIncrementalSync();
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Incremental GitHub sync completed' })
  };
}