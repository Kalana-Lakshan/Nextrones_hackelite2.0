import { supabase, UserKnowledgeProfile, UserLearningProgress } from '../lib/supabaseClient';
import { GitHubService } from './githubService';

export class SkillsAnalysisService {
  private githubService: GitHubService;

  constructor() {
    this.githubService = new GitHubService();
  }

  // Analyze and store user skills from GitHub data
  async analyzeAndStoreSkills(userId: string): Promise<void> {
    try {
      // Get GitHub user data
      const githubUser = await this.githubService.getGitHubUserByUserId(userId);
      if (!githubUser) {
        console.log('No GitHub user found for userId:', userId);
        return;
      }

      // Extract skills from GitHub repositories
      const extractedSkills = await this.githubService.extractSkillsFromGitHubData(githubUser.id!);
      
      // Get repositories to analyze experience level
      const repositories = await this.githubService.getRepositoriesByGitHubUserId(githubUser.id!);
      
      // Get contribution summary
      const contributionSummary = await this.githubService.getContributionSummary(githubUser.id!);

      // Analyze experience level based on GitHub activity
      const experienceLevel = this.determineExperienceLevel(repositories, contributionSummary);

      // Categorize skills
      const categorizedSkills = this.categorizeSkills(extractedSkills);

      // Update or create user knowledge profile
      await this.updateUserKnowledgeProfile(userId, {
        skills: extractedSkills,
        interests: this.extractInterests(repositories),
        experience_level: experienceLevel,
        career_goals: this.suggestCareerGoals(categorizedSkills),
        learning_goals: this.suggestLearningGoals(categorizedSkills, repositories),
      });

      // Create learning progress entries for each skill
      await this.createLearningProgressEntries(userId, extractedSkills, repositories);

    } catch (error) {
      console.error('Error analyzing and storing skills:', error);
      throw error;
    }
  }

  // Update or create user knowledge profile
  private async updateUserKnowledgeProfile(
    userId: string, 
    profileData: Partial<UserKnowledgeProfile>
  ): Promise<void> {
    try {
      const { data: existingProfile } = await supabase
        .from('user_knowledge_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      const profileUpdate = {
        user_id: userId,
        ...profileData,
        updated_at: new Date().toISOString(),
      };

      if (existingProfile) {
        // Merge existing skills with new ones
        const mergedSkills = Array.from(new Set([
          ...(existingProfile.skills || []),
          ...(profileData.skills || [])
        ]));
        
        profileUpdate.skills = mergedSkills;

        const { error } = await supabase
          .from('user_knowledge_profiles')
          .update(profileUpdate)
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_knowledge_profiles')
          .insert(profileUpdate);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating user knowledge profile:', error);
      throw error;
    }
  }

  // Create learning progress entries for skills
  private async createLearningProgressEntries(
    userId: string,
    skills: string[],
    repositories: any[]
  ): Promise<void> {
    try {
      for (const skill of skills) {
        // Check if learning progress entry already exists
        const { data: existingProgress } = await supabase
          .from('user_learning_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('skill_name', skill)
          .single();

        if (!existingProgress) {
          // Determine proficiency level based on GitHub data
          const proficiencyLevel = this.determineProficiencyLevel(skill, repositories);

          const learningProgress: UserLearningProgress = {
            user_id: userId,
            skill_name: skill,
            skill_id: skill.replace(/\s+/g, '_').toLowerCase(),
            proficiency_level: proficiencyLevel,
            learning_status: proficiencyLevel === 'beginner' ? 'learning' : 'practicing',
            learning_resources: {
              github_projects: this.getRelatedProjects(skill, repositories),
              suggested_resources: this.suggestLearningResources(skill),
            },
            progress_notes: `Skill identified from GitHub repositories. Current level: ${proficiencyLevel}`,
          };

          const { error } = await supabase
            .from('user_learning_progress')
            .insert(learningProgress);

          if (error && error.code !== '23505') { // Ignore duplicate key errors
            console.error(`Error creating learning progress for ${skill}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error creating learning progress entries:', error);
    }
  }

  // Determine experience level based on GitHub activity
  private determineExperienceLevel(repositories: any[], contributionSummary: any): string {
    const repoCount = repositories.length;
    const totalStars = repositories.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    const { totalCommits, activeRepositories } = contributionSummary;

    // Calculate a simple experience score
    const experienceScore = (repoCount * 2) + (totalStars * 0.5) + (totalCommits * 0.1) + (activeRepositories * 3);

    if (experienceScore >= 100) return 'senior';
    if (experienceScore >= 50) return 'intermediate';
    if (experienceScore >= 20) return 'junior';
    return 'beginner';
  }

  // Categorize skills into different types
  private categorizeSkills(skills: string[]): {
    programming: string[];
    frameworks: string[];
    databases: string[];
    tools: string[];
    cloud: string[];
  } {
    const categories = {
      programming: [] as string[],
      frameworks: [] as string[],
      databases: [] as string[],
      tools: [] as string[],
      cloud: [] as string[],
    };

    const categoryMappings = {
      programming: ['javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin'],
      frameworks: ['react', 'vue', 'angular', 'express', 'django', 'flask', 'spring', 'laravel', 'rails'],
      databases: ['mongodb', 'postgresql', 'mysql', 'redis', 'sqlite', 'firebase', 'supabase'],
      tools: ['docker', 'kubernetes', 'git', 'webpack', 'babel', 'jest', 'cypress'],
      cloud: ['aws', 'azure', 'gcp', 'heroku', 'netlify', 'vercel'],
    };

    skills.forEach(skill => {
      const normalizedSkill = skill.toLowerCase();
      let categorized = false;

      for (const [category, keywords] of Object.entries(categoryMappings)) {
        if (keywords.some(keyword => normalizedSkill.includes(keyword))) {
          categories[category as keyof typeof categories].push(skill);
          categorized = true;
          break;
        }
      }

      // If not categorized, add to tools as default
      if (!categorized) {
        categories.tools.push(skill);
      }
    });

    return categories;
  }

  // Extract interests from repository topics and descriptions
  private extractInterests(repositories: any[]): string[] {
    const interests = new Set<string>();

    repositories.forEach(repo => {
      // Add topics as interests
      if (repo.topics && Array.isArray(repo.topics)) {
        repo.topics.forEach((topic: string) => {
          if (topic.length > 2) { // Filter out very short topics
            interests.add(topic.toLowerCase());
          }
        });
      }

      // Extract domain interests from repository names and descriptions
      const domainKeywords = [
        'ai', 'machine-learning', 'data-science', 'web-development', 'mobile-development',
        'game-development', 'blockchain', 'cybersecurity', 'devops', 'cloud-computing',
        'iot', 'automation', 'testing', 'ui-ux', 'frontend', 'backend', 'fullstack'
      ];

      const repoText = `${repo.name} ${repo.description || ''}`.toLowerCase();
      domainKeywords.forEach(keyword => {
        if (repoText.includes(keyword.replace('-', ' ')) || repoText.includes(keyword)) {
          interests.add(keyword);
        }
      });
    });

    return Array.from(interests).slice(0, 15); // Limit to top 15 interests
  }

  // Suggest career goals based on skills
  private suggestCareerGoals(categorizedSkills: any): string[] {
    const goals: string[] = [];

    if (categorizedSkills.programming.length > 0 && categorizedSkills.frameworks.length > 0) {
      if (categorizedSkills.frameworks.some((f: string) => ['react', 'vue', 'angular'].includes(f.toLowerCase()))) {
        goals.push('Frontend Developer');
      }
      if (categorizedSkills.frameworks.some((f: string) => ['express', 'django', 'spring'].includes(f.toLowerCase()))) {
        goals.push('Backend Developer');
      }
      if (goals.length === 2) {
        goals.push('Full Stack Developer');
      }
    }

    if (categorizedSkills.cloud.length > 0 || categorizedSkills.tools.some((t: string) => ['docker', 'kubernetes'].includes(t.toLowerCase()))) {
      goals.push('DevOps Engineer');
    }

    if (categorizedSkills.programming.some((p: string) => ['python', 'r'].includes(p.toLowerCase()))) {
      goals.push('Data Scientist');
    }

    // Default goals if no specific match
    if (goals.length === 0) {
      goals.push('Software Developer');
    }

    return goals.slice(0, 5);
  }

  // Suggest learning goals based on current skills and projects
  private suggestLearningGoals(categorizedSkills: any, repositories: any[]): string[] {
    const goals: string[] = [];

    // Suggest complementary skills
    if (categorizedSkills.programming.includes('javascript') && !categorizedSkills.programming.includes('typescript')) {
      goals.push('Learn TypeScript');
    }

    if (categorizedSkills.frameworks.length > 0 && categorizedSkills.databases.length === 0) {
      goals.push('Learn Database Management');
    }

    if (categorizedSkills.programming.length > 0 && categorizedSkills.cloud.length === 0) {
      goals.push('Learn Cloud Computing');
    }

    // Suggest testing if not present
    const hasTestingSkills = [...categorizedSkills.tools, ...categorizedSkills.frameworks]
      .some((skill: string) => skill.toLowerCase().includes('test'));
    
    if (!hasTestingSkills) {
      goals.push('Learn Software Testing');
    }

    // Suggest advanced topics
    goals.push('Improve System Design Skills');
    goals.push('Learn DevOps Practices');

    return goals.slice(0, 8);
  }

  // Determine proficiency level for a specific skill
  private determineProficiencyLevel(skill: string, repositories: any[]): string {
    const skillLower = skill.toLowerCase();
    let relevantRepos = 0;
    let totalUsage = 0;

    repositories.forEach(repo => {
      let isRelevant = false;

      // Check in primary language
      if (repo.language && repo.language.toLowerCase().includes(skillLower)) {
        isRelevant = true;
        totalUsage += 0.5;
      }

      // Check in languages object
      if (repo.languages && typeof repo.languages === 'object') {
        for (const [lang, bytes] of Object.entries(repo.languages)) {
          if (lang.toLowerCase().includes(skillLower)) {
            isRelevant = true;
            totalUsage += (bytes as number) / 10000; // Normalize bytes to a smaller number
          }
        }
      }

      // Check in topics
      if (repo.topics && Array.isArray(repo.topics)) {
        if (repo.topics.some((topic: string) => topic.toLowerCase().includes(skillLower))) {
          isRelevant = true;
          totalUsage += 0.3;
        }
      }

      if (isRelevant) {
        relevantRepos++;
      }
    });

    // Determine level based on usage
    if (relevantRepos >= 5 && totalUsage > 50) return 'advanced';
    if (relevantRepos >= 3 && totalUsage > 20) return 'intermediate';
    if (relevantRepos >= 1) return 'beginner';
    return 'novice';
  }

  // Get related projects for a skill
  private getRelatedProjects(skill: string, repositories: any[]): any[] {
    const skillLower = skill.toLowerCase();
    return repositories
      .filter(repo => {
        const isLanguageMatch = repo.language && repo.language.toLowerCase().includes(skillLower);
        const isTopicMatch = repo.topics && repo.topics.some((topic: string) => 
          topic.toLowerCase().includes(skillLower)
        );
        const isLanguagesMatch = repo.languages && 
          Object.keys(repo.languages).some(lang => lang.toLowerCase().includes(skillLower));

        return isLanguageMatch || isTopicMatch || isLanguagesMatch;
      })
      .map(repo => ({
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        stars: repo.stargazers_count,
      }))
      .slice(0, 5);
  }

  // Suggest learning resources for a skill
  private suggestLearningResources(skill: string): any[] {
    const resources = [];
    const skillLower = skill.toLowerCase();

    // Add generic resources based on skill type
    if (['javascript', 'typescript', 'python', 'java'].includes(skillLower)) {
      resources.push({
        type: 'documentation',
        title: `Official ${skill} Documentation`,
        url: `https://docs.${skillLower}.org`,
      });
    }

    resources.push({
      type: 'practice',
      title: `${skill} Coding Challenges`,
      platform: 'HackerRank/LeetCode',
    });

    resources.push({
      type: 'course',
      title: `Learn ${skill}`,
      platform: 'Online Learning Platforms',
    });

    return resources;
  }

  // Get user's skill analysis summary
  async getUserSkillsSummary(userId: string): Promise<{
    profile: UserKnowledgeProfile | null;
    skillsProgress: UserLearningProgress[];
    githubSummary: any;
  }> {
    try {
      // Get user knowledge profile
      const { data: profile } = await supabase
        .from('user_knowledge_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Get skills learning progress
      const { data: skillsProgress } = await supabase
        .from('user_learning_progress')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      // Get GitHub summary
      const githubUser = await this.githubService.getGitHubUserByUserId(userId);
      let githubSummary = null;
      
      if (githubUser) {
        const repositories = await this.githubService.getRepositoriesByGitHubUserId(githubUser.id!);
        const contributionSummary = await this.githubService.getContributionSummary(githubUser.id!);
        
        githubSummary = {
          user: githubUser,
          repositories: repositories.slice(0, 10), // Top 10 repositories
          contributions: contributionSummary,
          totalRepositories: repositories.length,
        };
      }

      return {
        profile: profile || null,
        skillsProgress: skillsProgress || [],
        githubSummary,
      };
    } catch (error) {
      console.error('Error getting user skills summary:', error);
      return {
        profile: null,
        skillsProgress: [],
        githubSummary: null,
      };
    }
  }

  // Update skill proficiency based on new activity
  async updateSkillProficiency(userId: string, skillName: string, newLevel?: string): Promise<void> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (newLevel) {
        updateData.proficiency_level = newLevel;
        updateData.progress_notes = `Proficiency updated to ${newLevel} on ${new Date().toLocaleDateString()}`;
      }

      const { error } = await supabase
        .from('user_learning_progress')
        .update(updateData)
        .eq('user_id', userId)
        .eq('skill_name', skillName);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating skill proficiency:', error);
      throw error;
    }
  }
}