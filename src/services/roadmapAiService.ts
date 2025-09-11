export interface RoadmapItem {
  id: number;
  title: string;
  description: string;
  category: 'Academic Skills' | 'Soft Skills' | 'Practical Experience' | 'Certification';
  deadline: string;
  estimatedHours: number;
  platform: string;
  skills: string[];
  resources: {
    type: 'course' | 'video' | 'documentation' | 'guide' | 'tutorial' | 'book' | 'certification' | 'practice';
    title: string;
    url: string;
  }[];
}

export interface RoadmapGenerationParams {
  jobData: {
    job: string;
    description: string;
    requirements: string[];
    skills: string[];
  };
  userProfile: {
    name: string;
    skills: string[];
    experienceLevel: string;
    careerGoals: string[];
    graduationDate: string;
    freeTimePerWeek: number;
  };
  jobMarketData?: {
    insights: any;
    jobs: any[];
  };
}

class RoadmapAiService {
  private readonly apiKey = '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';

  async generatePersonalizedRoadmap(params: RoadmapGenerationParams): Promise<RoadmapItem[]> {
    try {
      const systemPrompt = this.buildSystemPrompt(params);
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://learn-roadmap-genie.vercel.app",
          "X-Title": "Learn Roadmap Genie",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1:free",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: `Generate a personalized learning roadmap for the user to achieve their career goal of becoming a ${params.jobData.job}. Please provide a detailed, step-by-step learning plan with specific resources and realistic timelines.`
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const completion = await response.json();
      const aiResponse = completion.choices[0].message.content;
      
      return this.parseRoadmapResponse(aiResponse, params);
    } catch (error) {
      console.error('Error generating AI roadmap:', error);
      // Fallback to default roadmap
      return this.generateFallbackRoadmap(params);
    }
  }

  private buildSystemPrompt(params: RoadmapGenerationParams): string {
    const { jobData, userProfile, jobMarketData } = params;
    
    let prompt = `You are an expert career advisor and learning path specialist. Generate a personalized, actionable learning roadmap for a user to achieve their career goal.

USER PROFILE:
- Name: ${userProfile.name}
- Current Skills: ${userProfile.skills.join(', ')}
- Experience Level: ${userProfile.experienceLevel}
- Career Goals: ${userProfile.careerGoals.join(', ')}
- Graduation Date: ${userProfile.graduationDate}
- Available Study Time: ${userProfile.freeTimePerWeek} hours per week

TARGET JOB:
- Position: ${jobData.job}
- Description: ${jobData.description}
- Required Skills: ${jobData.skills.join(', ')}
- Requirements: ${jobData.requirements.join(', ')}

`;

    if (jobMarketData) {
      prompt += `CURRENT JOB MARKET DATA:
- Total Available Jobs: ${jobMarketData.insights.totalJobs}
- Top Companies Hiring: ${jobMarketData.insights.topCompanies.join(', ')}
- In-Demand Skills: ${jobMarketData.insights.inDemandSkills.join(', ')}
- Job Trends: ${jobMarketData.insights.jobTrends.join(', ')}

RECENT JOB LISTINGS:
${jobMarketData.jobs.map((job: any, index: number) => `
${index + 1}. ${job.title} at ${job.company}
   Location: ${job.location}
   Skills Required: ${job.skills?.join(', ') || 'Not specified'}
   ${job.salary ? `Salary: ${job.salary}` : ''}
`).join('')}

`;
    }

    prompt += `INSTRUCTIONS:
1. Create a realistic, step-by-step learning roadmap with 4-6 milestones
2. Each milestone should be achievable within 4-8 weeks
3. Include specific learning resources (courses, tutorials, projects)
4. Consider the user's current skill level and available time
5. Focus on practical, hands-on learning
6. Include both technical and soft skills development
7. Provide realistic timelines based on the graduation date
8. Reference current job market trends and in-demand skills

RESPONSE FORMAT:
Return a JSON array of roadmap items with this exact structure:
[
  {
    "id": 1,
    "title": "Milestone Title",
    "description": "Detailed description of what to learn and achieve",
    "category": "Academic Skills|Soft Skills|Practical Experience|Certification",
    "deadline": "YYYY-MM-DD",
    "estimatedHours": 40,
    "platform": "Learning Platform Name",
    "skills": ["Skill1", "Skill2", "Skill3"],
    "resources": [
      {
        "type": "course|video|documentation|guide|tutorial|book|certification|practice",
        "title": "Resource Title",
        "url": "https://example.com"
      }
    ]
  }
]

Make sure the JSON is valid and properly formatted.`;

    return prompt;
  }

  private parseRoadmapResponse(aiResponse: string, params: RoadmapGenerationParams): RoadmapItem[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const roadmapData = JSON.parse(jsonMatch[0]);
        return this.validateAndFormatRoadmap(roadmapData, params);
      }
      
      // If no JSON found, try to parse the response differently
      return this.parseTextResponse(aiResponse, params);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.generateFallbackRoadmap(params);
    }
  }

  private parseTextResponse(textResponse: string, params: RoadmapGenerationParams): RoadmapItem[] {
    // Fallback parsing for non-JSON responses
    const lines = textResponse.split('\n').filter(line => line.trim());
    const roadmapItems: RoadmapItem[] = [];
    let currentItem: Partial<RoadmapItem> = {};
    let itemId = 1;

    for (const line of lines) {
      if (line.match(/^\d+\./)) {
        // New milestone
        if (currentItem.title) {
          roadmapItems.push(this.completeRoadmapItem(currentItem, itemId++, params));
        }
        currentItem = {
          title: line.replace(/^\d+\.\s*/, '').trim(),
          description: '',
          category: 'Academic Skills',
          estimatedHours: 40,
          platform: 'Various',
          skills: [],
          resources: []
        };
      } else if (line.includes('Description:') || line.includes('description:')) {
        currentItem.description = line.split(':')[1]?.trim() || '';
      } else if (line.includes('Skills:') || line.includes('skills:')) {
        const skillsText = line.split(':')[1]?.trim() || '';
        currentItem.skills = skillsText.split(',').map(s => s.trim()).filter(s => s);
      }
    }

    // Add the last item
    if (currentItem.title) {
      roadmapItems.push(this.completeRoadmapItem(currentItem, itemId, params));
    }

    return roadmapItems.length > 0 ? roadmapItems : this.generateFallbackRoadmap(params);
  }

  private completeRoadmapItem(item: Partial<RoadmapItem>, id: number, params: RoadmapGenerationParams): RoadmapItem {
    const now = new Date();
    const graduationDate = new Date(params.userProfile.graduationDate);
    const weeksUntilGraduation = Math.ceil((graduationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const weeksPerItem = Math.max(4, Math.floor(weeksUntilGraduation / 5));
    
    return {
      id,
      title: item.title || `Learning Milestone ${id}`,
      description: item.description || `Complete this learning milestone to progress toward your goal`,
      category: item.category || 'Academic Skills',
      deadline: this.calculateDeadline(now, weeksPerItem * id),
      estimatedHours: item.estimatedHours || 40,
      platform: item.platform || 'Various',
      skills: item.skills || [],
      resources: item.resources || this.generateDefaultResources(item.title || '')
    };
  }

  private validateAndFormatRoadmap(roadmapData: any[], params: RoadmapGenerationParams): RoadmapItem[] {
    const now = new Date();
    const graduationDate = new Date(params.userProfile.graduationDate);
    const weeksUntilGraduation = Math.ceil((graduationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const weeksPerItem = Math.max(4, Math.floor(weeksUntilGraduation / roadmapData.length));

    return roadmapData.map((item, index) => ({
      id: item.id || index + 1,
      title: item.title || `Learning Milestone ${index + 1}`,
      description: item.description || `Complete this learning milestone`,
      category: this.validateCategory(item.category),
      deadline: item.deadline || this.calculateDeadline(now, weeksPerItem * (index + 1)),
      estimatedHours: item.estimatedHours || 40,
      platform: item.platform || 'Various',
      skills: Array.isArray(item.skills) ? item.skills : [],
      resources: Array.isArray(item.resources) ? item.resources : this.generateDefaultResources(item.title)
    }));
  }

  private validateCategory(category: string): 'Academic Skills' | 'Soft Skills' | 'Practical Experience' | 'Certification' {
    const validCategories = ['Academic Skills', 'Soft Skills', 'Practical Experience', 'Certification'];
    return validCategories.includes(category) ? category as any : 'Academic Skills';
  }

  private calculateDeadline(startDate: Date, weeksFromStart: number): string {
    const deadline = new Date(startDate);
    deadline.setDate(deadline.getDate() + (weeksFromStart * 7));
    return deadline.toISOString().split('T')[0];
  }

  private generateDefaultResources(title: string) {
    return [
      {
        type: 'course' as const,
        title: `${title} - Online Course`,
        url: 'https://www.coursera.org'
      },
      {
        type: 'documentation' as const,
        title: 'Official Documentation',
        url: 'https://developer.mozilla.org'
      }
    ];
  }

  private generateFallbackRoadmap(params: RoadmapGenerationParams): RoadmapItem[] {
    const now = new Date();
    const graduationDate = new Date(params.userProfile.graduationDate);
    const weeksUntilGraduation = Math.ceil((graduationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const weeksPerItem = Math.max(4, Math.floor(weeksUntilGraduation / 5));

    return [
      {
        id: 1,
        title: `Master ${params.jobData.skills[0] || 'Core Skills'}`,
        description: `Build strong foundation in ${params.jobData.skills[0] || 'core skills'} required for ${params.jobData.job}`,
        category: 'Academic Skills',
        deadline: this.calculateDeadline(now, weeksPerItem),
        estimatedHours: 40,
        platform: 'Coursera',
        skills: params.jobData.skills.slice(0, 3),
        resources: this.generateDefaultResources(params.jobData.skills[0] || 'Core Skills')
      },
      {
        id: 2,
        title: 'Build Practical Projects',
        description: `Create hands-on projects demonstrating your skills in ${params.jobData.job}`,
        category: 'Practical Experience',
        deadline: this.calculateDeadline(now, weeksPerItem * 2),
        estimatedHours: 60,
        platform: 'GitHub',
        skills: ['Project Management', 'Version Control'],
        resources: [
          { type: 'guide', title: 'Project Ideas', url: 'https://github.com/karan/Projects' },
          { type: 'tutorial', title: 'Git Tutorial', url: 'https://www.youtube.com/watch?v=RGOj5yH7evk' }
        ]
      },
      {
        id: 3,
        title: 'Develop Professional Skills',
        description: 'Enhance communication, teamwork, and industry knowledge',
        category: 'Soft Skills',
        deadline: this.calculateDeadline(now, weeksPerItem * 3),
        estimatedHours: 30,
        platform: 'LinkedIn Learning',
        skills: ['Communication', 'Teamwork', 'Problem Solving'],
        resources: [
          { type: 'course', title: 'Professional Skills', url: 'https://www.linkedin.com/learning' }
        ]
      }
    ];
  }
}

export const roadmapAiService = new RoadmapAiService();

