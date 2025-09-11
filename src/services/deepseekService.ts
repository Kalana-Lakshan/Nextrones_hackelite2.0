interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface UserProfile {
  skills: string[];
  interests: string[];
  experience_level: string;
  goals: string[];
}

interface LearningActivity {
  activity_type: string;
  skill_name?: string;
  course_name?: string;
  progress_percentage?: number;
  time_spent_minutes?: number;
  created_at: string;
}

interface SkillInsight {
  type: 'skill_gap' | 'learning_recommendation' | 'career_opportunity' | 'progress_milestone' | 'market_trend';
  title: string;
  description: string;
  confidence_score: number;
  actionable: boolean;
  priority: 'high' | 'medium' | 'low';
}

class DeepSeekService {
  private apiKey: string;
  private baseUrl = 'https://api.deepseek.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
    if (!this.apiKey) {
      console.warn('DeepSeek API key not found. Please set VITE_DEEPSEEK_API_KEY in your environment variables.');
    }
  }

  private async makeRequest(prompt: string, maxTokens: number = 1000): Promise<string> {
    if (!this.apiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an AI career advisor and skill development expert. Analyze user data and provide actionable insights for skill development and career growth. Always respond with valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    const data: DeepSeekResponse = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  async analyzeUserSkills(profile: UserProfile, recentActivity: LearningActivity[]): Promise<SkillInsight[]> {
    const prompt = `
    Analyze this user's skill development data and generate actionable insights:

    User Profile:
    - Skills: ${profile.skills.join(', ')}
    - Interests: ${profile.interests.join(', ')}
    - Experience Level: ${profile.experience_level}
    - Goals: ${profile.goals.join(', ')}

    Recent Learning Activity (last 30 days):
    ${recentActivity.map(activity => 
      `- ${activity.activity_type}: ${activity.skill_name || activity.course_name || 'Unknown'} (${activity.progress_percentage || 0}% progress)`
    ).join('\n')}

    Generate 3-5 actionable insights in this JSON format:
    [
      {
        "type": "skill_gap|learning_recommendation|career_opportunity|progress_milestone|market_trend",
        "title": "Brief, actionable title",
        "description": "Detailed description with specific recommendations",
        "confidence_score": 0.85,
        "actionable": true,
        "priority": "high|medium|low"
      }
    ]

    Focus on:
    1. Skill gaps that need attention
    2. Learning recommendations based on current progress
    3. Career opportunities aligned with skills
    4. Progress milestones and achievements
    5. Market trends relevant to their field

    Make insights specific, actionable, and personalized to their current skill level and goals.
    `;

    try {
      const response = await this.makeRequest(prompt, 1500);
      const insights = JSON.parse(response);
      return Array.isArray(insights) ? insights : [];
    } catch (error) {
      console.error('Error analyzing user skills:', error);
      return [];
    }
  }

  async generatePersonalizedActions(profile: UserProfile, currentActions: any[]): Promise<any[]> {
    const prompt = `
    Based on this user's profile and current actions, generate 2-3 new personalized actions:

    User Profile:
    - Skills: ${profile.skills.join(', ')}
    - Interests: ${profile.interests.join(', ')}
    - Experience Level: ${profile.experience_level}
    - Goals: ${profile.goals.join(', ')}

    Current Actions:
    ${currentActions.map(action => `- ${action.title}: ${action.status}`).join('\n')}

    Generate new actions in this JSON format:
    [
      {
        "type": "action|alert|reminder|achievement|recommendation",
        "priority": "high|medium|low",
        "title": "Action title",
        "description": "Detailed description",
        "action_text": "Button text",
        "action_url": "Optional URL",
        "category": "Profile Setup|Learning|Career|Skills|Projects"
      }
    ]

    Focus on:
    1. Immediate next steps for skill development
    2. Profile completion tasks
    3. Learning opportunities based on their interests
    4. Career advancement actions
    5. Skill practice recommendations

    Make actions specific, achievable, and relevant to their current situation.
    `;

    try {
      const response = await this.makeRequest(prompt, 1000);
      const actions = JSON.parse(response);
      return Array.isArray(actions) ? actions : [];
    } catch (error) {
      console.error('Error generating personalized actions:', error);
      return [];
    }
  }

  async analyzeLearningProgress(profile: UserProfile, activities: LearningActivity[]): Promise<{
    progress_summary: string;
    recommendations: string[];
    next_milestones: string[];
  }> {
    const prompt = `
    Analyze this user's learning progress and provide insights:

    User Profile:
    - Skills: ${profile.skills.join(', ')}
    - Experience Level: ${profile.experience_level}
    - Goals: ${profile.goals.join(', ')}

    Learning Activities:
    ${activities.map(activity => 
      `- ${activity.activity_type}: ${activity.skill_name || activity.course_name} (${activity.progress_percentage || 0}% complete, ${activity.time_spent_minutes || 0} minutes)`
    ).join('\n')}

    Provide analysis in this JSON format:
    {
      "progress_summary": "Brief summary of their learning progress",
      "recommendations": ["Specific recommendation 1", "Specific recommendation 2", "Specific recommendation 3"],
      "next_milestones": ["Next milestone 1", "Next milestone 2", "Next milestone 3"]
    }

    Focus on:
    1. Progress patterns and trends
    2. Areas of strength and improvement
    3. Specific next steps for continued growth
    4. Realistic milestones based on their current level
    `;

    try {
      const response = await this.makeRequest(prompt, 1200);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error analyzing learning progress:', error);
      return {
        progress_summary: 'Unable to analyze progress at this time.',
        recommendations: [],
        next_milestones: []
      };
    }
  }

  async generateSkillRecommendations(currentSkills: string[], targetRole?: string): Promise<{
    recommended_skills: string[];
    skill_roadmap: Array<{
      skill: string;
      priority: 'high' | 'medium' | 'low';
      estimated_time: string;
      resources: string[];
    }>;
  }> {
    const prompt = `
    Generate skill recommendations based on current skills and target role:

    Current Skills: ${currentSkills.join(', ')}
    Target Role: ${targetRole || 'Not specified'}

    Provide recommendations in this JSON format:
    {
      "recommended_skills": ["Skill 1", "Skill 2", "Skill 3"],
      "skill_roadmap": [
        {
          "skill": "Skill name",
          "priority": "high|medium|low",
          "estimated_time": "2-3 months",
          "resources": ["Resource 1", "Resource 2"]
        }
      ]
    }

    Focus on:
    1. Skills that complement current abilities
    2. Industry-relevant skills for their target role
    3. Practical, learnable skills with clear learning paths
    4. Skills that build upon their existing foundation
    `;

    try {
      const response = await this.makeRequest(prompt, 1500);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating skill recommendations:', error);
      return {
        recommended_skills: [],
        skill_roadmap: []
      };
    }
  }
}

export const deepSeekService = new DeepSeekService();
export default deepSeekService;

