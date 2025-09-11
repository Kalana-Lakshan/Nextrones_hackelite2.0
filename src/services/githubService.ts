import { Octokit } from '@octokit/rest';
import { supabase, GitHubUser, GitHubRepository, GitHubContribution } from '../lib/supabaseClient';

export class GitHubService {
  private octokit: Octokit;

  constructor() {
    this.octokit = new Octokit({
      auth: import.meta.env.VITE_GITHUB_TOKEN, // Optional for public repos
    });
  }

  // Fetch and store user data with skill analysis
  async syncUserData(username: string, userId: string): Promise<GitHubUser | null> {
    try {
      // Fetch user data from GitHub
      const { data: userData } = await this.octokit.rest.users.getByUsername({
        username,
      });

      // Check if GitHub user already exists
      const { data: existingUser } = await supabase
        .from('github_users')
        .select('*')
        .eq('github_id', userData.id)
        .single();

      const githubUser: GitHubUser = {
        user_id: userId,
        github_id: userData.id,
        username: userData.login,
        avatar_url: userData.avatar_url,
        bio: userData.bio,
        public_repos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
        html_url: userData.html_url,
        updated_at: new Date().toISOString(),
      };

      let storedUser;
      if (existingUser) {
        // Update existing user
        const { data, error } = await supabase
          .from('github_users')
          .update(githubUser)
          .eq('id', existingUser.id)
          .select()
          .single();
        
        if (error) throw error;
        storedUser = data;
      } else {
        // Insert new user
        const { data, error } = await supabase
          .from('github_users')
          .insert(githubUser)
          .select()
          .single();
        
        if (error) throw error;
        storedUser = data;
      }

      // Sync repositories and contributions
      await this.syncUserRepositories(storedUser.id, username);
      
      return storedUser;
    } catch (error) {
      console.error('Error syncing GitHub user data:', error);
      throw error;
    }
  }

  // Fetch and store repository data with language analysis
  async syncUserRepositories(githubUserId: string, username: string): Promise<void> {
    try {
      // Fetch all repositories
      const repositories = await this.octokit.paginate(
        this.octokit.rest.repos.listForUser,
        {
          username,
          per_page: 100,
          type: 'all',
        }
      );

      for (const repo of repositories) {
        try {
          // Get languages for each repository
          const { data: languages } = await this.octokit.rest.repos.listLanguages({
            owner: username,
            repo: repo.name,
          });

          // Get repository topics
          const { data: topicsData } = await this.octokit.rest.repos.getAllTopics({
            owner: username,
            repo: repo.name,
          });

          const repository: GitHubRepository = {
            github_user_id: githubUserId,
            repo_id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            html_url: repo.html_url,
            stargazers_count: repo.stargazers_count,
            forks_count: repo.forks_count,
            language: repo.language,
            languages: languages,
            topics: topicsData.names,
            is_fork: repo.fork,
            created_at: repo.created_at,
            updated_at: repo.updated_at,
            pushed_at: repo.pushed_at,
            last_synced: new Date().toISOString(),
          };

          // Upsert repository
          const { error } = await supabase
            .from('github_repositories')
            .upsert(repository, { onConflict: 'repo_id' });

          if (error) {
            console.error(`Error storing repository ${repo.name}:`, error);
          }

          // Get contribution stats for this repository
          await this.syncRepositoryContributions(githubUserId, username, repo.name, repo.id);
        } catch (repoError) {
          console.error(`Error processing repository ${repo.name}:`, repoError);
          continue;
        }
      }
    } catch (error) {
      console.error('Error syncing repositories:', error);
      throw error;
    }
  }

  // Fetch and store contribution data
  async syncRepositoryContributions(
    githubUserId: string,
    username: string,
    repoName: string,
    repoId: number
  ): Promise<void> {
    try {
      // Get contribution stats for the repository
      const { data: stats } = await this.octokit.rest.repos.getContributorsStats({
        owner: username,
        repo: repoName,
      });

      if (!stats || stats.length === 0) return;

      // Find the user's stats
      const userStats = stats.find(stat => stat.author?.login === username);
      if (!userStats || !userStats.weeks) return;

      // Process weekly contributions
      for (const week of userStats.weeks) {
        if (week.c > 0) { // Only store weeks with commits
          const contribution: GitHubContribution = {
            github_user_id: githubUserId,
            repo_id: repoId,
            commit_count: week.c,
            additions: week.a,
            deletions: week.d,
            contribution_period: new Date(week.w * 1000).toISOString().split('T')[0],
            updated_at: new Date().toISOString(),
          };

          const { error } = await supabase
            .from('github_contributions')
            .upsert(contribution, { 
              onConflict: 'github_user_id,repo_id,contribution_period' 
            });

          if (error) {
            console.error('Error storing contribution:', error);
          }
        }
      }
    } catch (error) {
      console.error(`Error syncing contributions for ${repoName}:`, error);
    }
  }

  // Extract skills from GitHub data
  async extractSkillsFromGitHubData(githubUserId: string): Promise<string[]> {
    try {
      // Get repositories and their languages
      const { data: repositories } = await supabase
        .from('github_repositories')
        .select('languages, topics, description')
        .eq('github_user_id', githubUserId);

      const skills = new Set<string>();

      repositories.forEach(repo => {
        // Add programming languages
        if (repo.languages) {
          Object.keys(repo.languages).forEach(lang => {
            skills.add(lang.toLowerCase());
          });
        }

        // Add topics/technologies
        if (repo.topics && Array.isArray(repo.topics)) {
          repo.topics.forEach(topic => {
            skills.add(topic.toLowerCase());
          });
        }

        // Extract skills from repository description
        if (repo.description) {
          const techKeywords = this.extractTechKeywords(repo.description);
          techKeywords.forEach(keyword => skills.add(keyword));
        }
      });

      return Array.from(skills);
    } catch (error) {
      console.error('Error extracting skills:', error);
      return [];
    }
  }

  // Extract technology keywords from text
  private extractTechKeywords(text: string): string[] {
    const techPatterns = [
      // Web Technologies
      /react/i, /vue/i, /angular/i, /svelte/i, /nextjs/i, /nuxt/i,
      /javascript/i, /typescript/i, /html/i, /css/i, /sass/i, /scss/i,
      /nodejs/i, /express/i, /fastify/i, /nestjs/i,
      
      // Databases
      /mongodb/i, /postgresql/i, /mysql/i, /redis/i, /sqlite/i, /supabase/i, /firebase/i,
      
      // Cloud & DevOps
      /aws/i, /azure/i, /gcp/i, /docker/i, /kubernetes/i, /terraform/i,
      /ci\/cd/i, /github actions/i, /jenkins/i,
      
      // Mobile
      /react native/i, /flutter/i, /swift/i, /kotlin/i, /ionic/i,
      
      // Data Science & AI
      /python/i, /machine learning/i, /deep learning/i, /tensorflow/i, /pytorch/i,
      /pandas/i, /numpy/i, /scikit-learn/i, /jupyter/i,
      
      // Other Technologies
      /api/i, /rest/i, /graphql/i, /microservices/i, /blockchain/i,
      /testing/i, /jest/i, /cypress/i, /selenium/i,
    ];

    const keywords: string[] = [];
    techPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        keywords.push(matches[0].toLowerCase());
      }
    });

    return keywords;
  }

  // Get GitHub user by user_id
  async getGitHubUserByUserId(userId: string): Promise<GitHubUser | null> {
    try {
      const { data, error } = await supabase
        .from('github_users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error fetching GitHub user:', error);
      return null;
    }
  }

  // Get all repositories for a GitHub user
  async getRepositoriesByGitHubUserId(githubUserId: string): Promise<GitHubRepository[]> {
    try {
      const { data, error } = await supabase
        .from('github_repositories')
        .select('*')
        .eq('github_user_id', githubUserId)
        .order('stargazers_count', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching repositories:', error);
      return [];
    }
  }

  // Get contribution summary
  async getContributionSummary(githubUserId: string): Promise<{
    totalCommits: number;
    totalAdditions: number;
    totalDeletions: number;
    activeRepositories: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('github_contributions')
        .select('commit_count, additions, deletions, repo_id')
        .eq('github_user_id', githubUserId);

      if (error) throw error;

      const summary = data.reduce(
        (acc, contribution) => {
          acc.totalCommits += contribution.commit_count || 0;
          acc.totalAdditions += contribution.additions || 0;
          acc.totalDeletions += contribution.deletions || 0;
          return acc;
        },
        { totalCommits: 0, totalAdditions: 0, totalDeletions: 0, activeRepositories: 0 }
      );

      // Count unique repositories
      const uniqueRepos = new Set(data.map(c => c.repo_id));
      summary.activeRepositories = uniqueRepos.size;

      return summary;
    } catch (error) {
      console.error('Error getting contribution summary:', error);
      return { totalCommits: 0, totalAdditions: 0, totalDeletions: 0, activeRepositories: 0 };
    }
  }
}