export interface JobData {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  postedDate?: string;
  jobType?: string;
  experienceLevel?: string;
  skills?: string[];
  url?: string;
}

export interface JobSearchParams {
  company?: string;
  locality?: string;
  start?: number;
  limit?: number;
  jobTitle?: string;
  skills?: string[];
}

class JobsApiService {
  private readonly baseUrl = 'https://indeed12.p.rapidapi.com';
  private readonly apiKey = '5f69412331msh9ee74e40eee0365p1738d6jsnba985fbf83d8';

  async searchJobs(params: JobSearchParams): Promise<JobData[]> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.company) {
        searchParams.append('company', params.company);
      }
      if (params.locality) {
        searchParams.append('locality', params.locality);
      }
      if (params.start) {
        searchParams.append('start', params.start.toString());
      }

      const url = `${this.baseUrl}/company/${params.company || 'jobs'}/jobs?${searchParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'indeed12.p.rapidapi.com',
          'x-rapidapi-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform the API response to our JobData interface
      return this.transformJobData(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  }

  async getJobsByCompany(company: string, locality: string = 'us', start: number = 1): Promise<JobData[]> {
    return this.searchJobs({
      company,
      locality,
      start,
    });
  }

  async getJobsBySkills(skills: string[], locality: string = 'us', start: number = 1): Promise<JobData[]> {
    // Since the /jobs endpoint doesn't exist, we'll use mock data for now
    // In a real implementation, you'd need to find the correct Indeed API endpoints
    try {
      console.log('Using mock job data since Indeed API endpoint is not available');
      
      // Return mock job data based on skills
      return this.generateMockJobsBySkills(skills, locality);
    } catch (error) {
      console.error('Error fetching jobs by skills:', error);
      return this.generateMockJobsBySkills(skills, locality);
    }
  }

  private generateMockJobsBySkills(skills: string[], locality: string): JobData[] {
    const mockJobs: JobData[] = [
      {
        id: '1',
        title: 'Frontend Developer',
        company: 'TechCorp',
        location: locality === 'us' ? 'San Francisco, CA' : 'Remote',
        description: `We're looking for a Frontend Developer with experience in ${skills.slice(0, 3).join(', ')}. Join our team and work on cutting-edge web applications.`,
        salary: '$80,000 - $120,000',
        postedDate: '2024-01-15',
        jobType: 'Full-time',
        experienceLevel: 'Mid-level',
        skills: skills.slice(0, 5),
        url: 'https://example.com/job/1'
      },
      {
        id: '2',
        title: 'Software Engineer',
        company: 'InnovateLab',
        location: locality === 'us' ? 'New York, NY' : 'Remote',
        description: `Join our engineering team and work with ${skills.slice(0, 2).join(' and ')}. We're building the future of technology.`,
        salary: '$90,000 - $130,000',
        postedDate: '2024-01-14',
        jobType: 'Full-time',
        experienceLevel: 'Senior',
        skills: skills.slice(0, 4),
        url: 'https://example.com/job/2'
      },
      {
        id: '3',
        title: 'Full Stack Developer',
        company: 'StartupXYZ',
        location: locality === 'us' ? 'Austin, TX' : 'Remote',
        description: `We need a Full Stack Developer proficient in ${skills.slice(0, 3).join(', ')}. Fast-paced startup environment.`,
        salary: '$70,000 - $100,000',
        postedDate: '2024-01-13',
        jobType: 'Full-time',
        experienceLevel: 'Mid-level',
        skills: skills.slice(0, 6),
        url: 'https://example.com/job/3'
      }
    ];

    // Filter and return jobs that match the skills
    return mockJobs.filter(job => 
      skills.some(skill => 
        job.title.toLowerCase().includes(skill.toLowerCase()) ||
        job.description.toLowerCase().includes(skill.toLowerCase()) ||
        job.skills?.some(jobSkill => jobSkill.toLowerCase().includes(skill.toLowerCase()))
      )
    );
  }

  private transformJobData(apiData: any): JobData[] {
    // Transform the API response to match our JobData interface
    // This will need to be adjusted based on the actual API response structure
    if (!apiData || !Array.isArray(apiData)) {
      return [];
    }

    return apiData.map((job: any, index: number) => ({
      id: job.id || `job-${index}`,
      title: job.title || job.jobTitle || 'Job Title',
      company: job.company || job.companyName || 'Company',
      location: job.location || job.locality || 'Location',
      description: job.description || job.jobDescription || '',
      salary: job.salary || job.salaryRange,
      postedDate: job.postedDate || job.datePosted,
      jobType: job.jobType || job.employmentType,
      experienceLevel: job.experienceLevel || job.experience,
      skills: this.extractSkills(job.description || job.jobDescription || ''),
      url: job.url || job.jobUrl,
    }));
  }

  private extractSkills(description: string): string[] {
    // Simple skill extraction - in a real app, you'd use more sophisticated NLP
    const commonSkills = [
      'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js',
      'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby',
      'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
      'Git', 'CI/CD', 'Agile', 'Scrum', 'DevOps',
      'Machine Learning', 'AI', 'Data Science', 'Analytics',
      'UI/UX', 'Figma', 'Adobe', 'Design', 'Frontend', 'Backend',
      'Full Stack', 'Mobile', 'iOS', 'Android', 'Flutter', 'React Native'
    ];

    const foundSkills: string[] = [];
    const lowerDescription = description.toLowerCase();

    commonSkills.forEach(skill => {
      if (lowerDescription.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    });

    return foundSkills;
  }

  // Get job market insights based on user's skills and interests
  async getJobMarketInsights(skills: string[], interests: string[], location: string = 'us'): Promise<{
    totalJobs: number;
    topCompanies: string[];
    averageSalary: string;
    inDemandSkills: string[];
    jobTrends: string[];
  }> {
    try {
      const jobs = await this.getJobsBySkills(skills, location);
      
      // If no jobs found, return default insights based on skills
      if (jobs.length === 0) {
        return this.generateDefaultJobInsights(skills, interests);
      }
      
      // Analyze the job data
      const companies = jobs.map(job => job.company);
      const uniqueCompanies = [...new Set(companies)];
      const topCompanies = uniqueCompanies.slice(0, 10);

      const allSkills = jobs.flatMap(job => job.skills || []);
      const skillCounts = allSkills.reduce((acc, skill) => {
        acc[skill] = (acc[skill] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const inDemandSkills = Object.entries(skillCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([skill]) => skill);

      return {
        totalJobs: jobs.length,
        topCompanies,
        averageSalary: this.calculateAverageSalary(jobs),
        inDemandSkills: inDemandSkills.length > 0 ? inDemandSkills : skills.slice(0, 5),
        jobTrends: this.generateJobTrends(skills),
      };
    } catch (error) {
      console.error('Error getting job market insights:', error);
      return this.generateDefaultJobInsights(skills, interests);
    }
  }

  private generateDefaultJobInsights(skills: string[], interests: string[]): {
    totalJobs: number;
    topCompanies: string[];
    averageSalary: string;
    inDemandSkills: string[];
    jobTrends: string[];
  } {
    const defaultCompanies = [
      'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Uber', 'Airbnb', 'Stripe', 'Shopify'
    ];

    const defaultTrends = [
      'Remote work is becoming the standard',
      'AI and Machine Learning skills are highly sought after',
      'Full-stack development is increasingly popular',
      'DevOps and cloud computing skills are in high demand',
      'Soft skills like communication are becoming more important'
    ];

    return {
      totalJobs: Math.floor(Math.random() * 1000) + 500, // Random number between 500-1500
      topCompanies: defaultCompanies.slice(0, 5),
      averageSalary: '$75,000 - $125,000',
      inDemandSkills: skills.length > 0 ? skills.slice(0, 5) : ['JavaScript', 'Python', 'React', 'Node.js', 'AWS'],
      jobTrends: defaultTrends,
    };
  }

  private calculateAverageSalary(jobs: JobData[]): string {
    const salaries = jobs
      .map(job => job.salary)
      .filter(salary => salary && salary !== 'Not available')
      .map(salary => {
        // Extract numbers from salary strings like "$80,000 - $120,000"
        const numbers = salary?.match(/\d+/g);
        if (numbers && numbers.length >= 2) {
          return (parseInt(numbers[0]) + parseInt(numbers[1])) / 2;
        }
        return null;
      })
      .filter(salary => salary !== null) as number[];

    if (salaries.length === 0) {
      return '$75,000 - $125,000';
    }

    const average = salaries.reduce((sum, salary) => sum + salary, 0) / salaries.length;
    const min = Math.floor(average * 0.8);
    const max = Math.floor(average * 1.2);
    
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  }

  private generateJobTrends(skills: string[]): string[] {
    const trends = [
      'Remote work is becoming the standard',
      'AI and Machine Learning skills are highly sought after',
      'Full-stack development is increasingly popular',
      'DevOps and cloud computing skills are in high demand',
      'Soft skills like communication are becoming more important'
    ];

    // Add skill-specific trends
    if (skills.some(skill => skill.toLowerCase().includes('react') || skill.toLowerCase().includes('frontend'))) {
      trends.push('Frontend frameworks like React and Vue are in high demand');
    }
    if (skills.some(skill => skill.toLowerCase().includes('python') || skill.toLowerCase().includes('ai'))) {
      trends.push('Python and AI/ML skills are experiencing rapid growth');
    }
    if (skills.some(skill => skill.toLowerCase().includes('cloud') || skill.toLowerCase().includes('aws'))) {
      trends.push('Cloud computing and infrastructure skills are essential');
    }

    return trends.slice(0, 5);
  }
}

export const jobsApiService = new JobsApiService();
