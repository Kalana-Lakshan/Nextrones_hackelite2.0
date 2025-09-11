export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  content: string | null;
  category: string;
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

class LocalNewsService {
  private readonly newsDatabase: { [key: string]: NewsArticle[] } = {
    'technology': [
      {
        id: 'tech-1',
        title: 'Tech Industry Sees Record Growth in 2024',
        description: 'Technology companies report unprecedented growth with new innovations driving market expansion. Major tech giants are investing heavily in AI and cloud computing.',
        url: 'https://example.com/tech-growth-2024',
        urlToImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop',
        publishedAt: new Date().toISOString(),
        source: { id: 'tech-news', name: 'Tech News' },
        author: 'Tech Reporter',
        content: 'Technology industry continues to grow with new innovations...',
        category: 'Technology'
      },
      {
        id: 'tech-2',
        title: 'Remote Work Tools Revolutionize Tech Industry',
        description: 'New collaboration platforms and AI-powered tools are transforming how tech teams work remotely, increasing productivity by 30%.',
        url: 'https://example.com/remote-work-tech',
        urlToImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=200&fit=crop',
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        source: { id: 'tech-news', name: 'Tech News' },
        author: 'Tech Reporter',
        content: 'Remote work technology continues to evolve...',
        category: 'Technology'
      },
      {
        id: 'tech-3',
        title: 'Cybersecurity Skills in High Demand',
        description: 'With increasing cyber threats, companies are urgently hiring cybersecurity professionals with 50% salary premium over other tech roles.',
        url: 'https://example.com/cybersecurity-demand',
        urlToImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop',
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        source: { id: 'tech-news', name: 'Tech News' },
        author: 'Tech Reporter',
        content: 'Cybersecurity skills are becoming essential...',
        category: 'Technology'
      }
    ],
    'ai': [
      {
        id: 'ai-1',
        title: 'AI Skills in High Demand Across Industries',
        description: 'Machine learning engineers see 40% salary growth in 2024 as AI adoption accelerates across healthcare, finance, and manufacturing sectors.',
        url: 'https://example.com/ai-skills-demand',
        urlToImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop',
        publishedAt: new Date().toISOString(),
        source: { id: 'ai-news', name: 'AI News' },
        author: 'AI Reporter',
        content: 'Artificial intelligence skills are becoming essential...',
        category: 'AI/ML Career Path'
      },
      {
        id: 'ai-2',
        title: 'ChatGPT and AI Tools Transform Software Development',
        description: 'Developers using AI coding assistants report 60% faster development cycles and improved code quality.',
        url: 'https://example.com/ai-coding-tools',
        urlToImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop',
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        source: { id: 'ai-news', name: 'AI News' },
        author: 'AI Reporter',
        content: 'AI coding tools are revolutionizing development...',
        category: 'AI/ML Career Path'
      },
      {
        id: 'ai-3',
        title: 'Natural Language Processing Jobs Surge 200%',
        description: 'NLP specialists are in high demand as companies integrate conversational AI into their products and services.',
        url: 'https://example.com/nlp-jobs-surge',
        urlToImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop',
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        source: { id: 'ai-news', name: 'AI News' },
        author: 'AI Reporter',
        content: 'Natural language processing is transforming industries...',
        category: 'AI/ML Career Path'
      }
    ],
    'development': [
      {
        id: 'dev-1',
        title: 'React and Node.js Remain Top Skills for Developers',
        description: 'Full-stack development continues to be the most sought-after skill set in 2024, with React and Node.js leading the pack.',
        url: 'https://example.com/react-nodejs-trends',
        urlToImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop',
        publishedAt: new Date().toISOString(),
        source: { id: 'dev-news', name: 'Dev News' },
        author: 'Dev Reporter',
        content: 'Full-stack development skills remain crucial...',
        category: 'Full-Stack Development'
      },
      {
        id: 'dev-2',
        title: 'TypeScript Adoption Reaches 80% in Enterprise',
        description: 'TypeScript is becoming the standard for large-scale JavaScript applications, with 80% of enterprise projects now using it.',
        url: 'https://example.com/typescript-adoption',
        urlToImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=200&fit=crop',
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        source: { id: 'dev-news', name: 'Dev News' },
        author: 'Dev Reporter',
        content: 'TypeScript is revolutionizing JavaScript development...',
        category: 'Full-Stack Development'
      },
      {
        id: 'dev-3',
        title: 'Microservices Architecture Drives DevOps Demand',
        description: 'Companies adopting microservices are hiring DevOps engineers at record rates, with salaries increasing 35% year-over-year.',
        url: 'https://example.com/microservices-devops',
        urlToImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=200&fit=crop',
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        source: { id: 'dev-news', name: 'Dev News' },
        author: 'Dev Reporter',
        content: 'Microservices are driving DevOps transformation...',
        category: 'Full-Stack Development'
      }
    ],
    'data': [
      {
        id: 'data-1',
        title: 'Python and SQL Essential for Data Analyst Roles',
        description: 'Data science professionals with Python and SQL skills command higher salaries, with 45% premium over basic analytics roles.',
        url: 'https://example.com/data-skills-2024',
        urlToImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
        publishedAt: new Date().toISOString(),
        source: { id: 'data-news', name: 'Data News' },
        author: 'Data Reporter',
        content: 'Data science skills are increasingly valuable...',
        category: 'Data Science Trends'
      },
      {
        id: 'data-2',
        title: 'Machine Learning Engineers Earn $150K+ Average',
        description: 'ML engineers with expertise in TensorFlow and PyTorch are commanding top salaries in the data science field.',
        url: 'https://example.com/ml-engineer-salaries',
        urlToImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop',
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        source: { id: 'data-news', name: 'Data News' },
        author: 'Data Reporter',
        content: 'Machine learning engineering is highly lucrative...',
        category: 'Data Science Trends'
      },
      {
        id: 'data-3',
        title: 'Big Data Technologies Transform Business Intelligence',
        description: 'Apache Spark and Hadoop skills are in high demand as companies process larger datasets for business insights.',
        url: 'https://example.com/big-data-bi',
        urlToImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop',
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        source: { id: 'data-news', name: 'Data News' },
        author: 'Data Reporter',
        content: 'Big data technologies are revolutionizing BI...',
        category: 'Data Science Trends'
      }
    ],
    'design': [
      {
        id: 'design-1',
        title: 'Design Thinking Skills in High Demand Across Industries',
        description: 'UX/UI designers with strong design thinking capabilities are highly sought after, with 60% of job postings requiring these skills.',
        url: 'https://example.com/design-thinking-demand',
        urlToImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=200&fit=crop',
        publishedAt: new Date().toISOString(),
        source: { id: 'design-news', name: 'Design News' },
        author: 'Design Reporter',
        content: 'Design thinking is becoming a core business skill...',
        category: 'UX/UI Design'
      },
      {
        id: 'design-2',
        title: 'Figma and Adobe XD Dominate UI Design Market',
        description: 'UI designers proficient in Figma and Adobe XD are seeing 40% higher salaries compared to traditional design tools.',
        url: 'https://example.com/figma-adobe-xd',
        urlToImage: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=200&fit=crop',
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        source: { id: 'design-news', name: 'Design News' },
        author: 'Design Reporter',
        content: 'Modern design tools are transforming the industry...',
        category: 'UX/UI Design'
      },
      {
        id: 'design-3',
        title: 'Accessibility Design Becomes Legal Requirement',
        description: 'With new accessibility regulations, companies are urgently hiring designers with WCAG compliance expertise.',
        url: 'https://example.com/accessibility-design',
        urlToImage: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&h=200&fit=crop',
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        source: { id: 'design-news', name: 'Design News' },
        author: 'Design Reporter',
        content: 'Accessibility design is now a critical skill...',
        category: 'UX/UI Design'
      }
    ],
    'cloud': [
      {
        id: 'cloud-1',
        title: 'AWS and Azure Certifications Boost Career Prospects',
        description: 'Cloud computing certifications continue to provide significant career advantages, with certified professionals earning 25% more.',
        url: 'https://example.com/cloud-certifications-2024',
        urlToImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=200&fit=crop',
        publishedAt: new Date().toISOString(),
        source: { id: 'cloud-news', name: 'Cloud News' },
        author: 'Cloud Reporter',
        content: 'Cloud computing skills are essential for modern IT careers...',
        category: 'Cloud Computing'
      },
      {
        id: 'cloud-2',
        title: 'Kubernetes and Docker Skills Command Premium Salaries',
        description: 'Containerization experts with Kubernetes and Docker experience are seeing 50% salary increases as companies adopt cloud-native architectures.',
        url: 'https://example.com/kubernetes-docker',
        urlToImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop',
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        source: { id: 'cloud-news', name: 'Cloud News' },
        author: 'Cloud Reporter',
        content: 'Containerization is transforming cloud computing...',
        category: 'Cloud Computing'
      },
      {
        id: 'cloud-3',
        title: 'Serverless Architecture Redefines Cloud Development',
        description: 'Developers with serverless expertise in AWS Lambda and Azure Functions are in high demand for cost-effective cloud solutions.',
        url: 'https://example.com/serverless-architecture',
        urlToImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=200&fit=crop',
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        source: { id: 'cloud-news', name: 'Cloud News' },
        author: 'Cloud Reporter',
        content: 'Serverless computing is the future of cloud development...',
        category: 'Cloud Computing'
      }
    ]
  };

  async getTopHeadlines(category: string = 'technology', country: string = 'us', pageSize: number = 10): Promise<NewsArticle[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const news = this.newsDatabase[category] || this.newsDatabase['technology'];
    return news.slice(0, pageSize).map(article => ({
      ...article,
      id: `${article.id}-${Date.now()}`,
      publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }));
  }

  async searchNews(query: string, pageSize: number = 10): Promise<NewsArticle[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const lowerQuery = query.toLowerCase();
    let category = 'technology';
    
    if (lowerQuery.includes('ai') || lowerQuery.includes('artificial intelligence') || lowerQuery.includes('machine learning')) {
      category = 'ai';
    } else if (lowerQuery.includes('development') || lowerQuery.includes('programming') || lowerQuery.includes('software')) {
      category = 'development';
    } else if (lowerQuery.includes('data') || lowerQuery.includes('analytics')) {
      category = 'data';
    } else if (lowerQuery.includes('design') || lowerQuery.includes('ux') || lowerQuery.includes('ui')) {
      category = 'design';
    } else if (lowerQuery.includes('cloud') || lowerQuery.includes('aws') || lowerQuery.includes('azure')) {
      category = 'cloud';
    }
    
    const news = this.newsDatabase[category] || this.newsDatabase['technology'];
    return news.slice(0, pageSize).map(article => ({
      ...article,
      id: `search-${article.id}-${Date.now()}`,
      publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }));
  }

  async getCareerNews(userSkills: string[] = [], userInterests: string[] = []): Promise<{
    technology: NewsArticle[];
    ai: NewsArticle[];
    development: NewsArticle[];
    data: NewsArticle[];
    design: NewsArticle[];
    cloud: NewsArticle[];
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const [techNews, aiNews, devNews, dataNews, designNews, cloudNews] = await Promise.all([
      this.getTopHeadlines('technology', 'us', 3),
      this.searchNews('artificial intelligence machine learning career', 3),
      this.searchNews('software development programming career', 3),
      this.searchNews('data science analytics career', 3),
      this.searchNews('UX UI design career', 3),
      this.searchNews('cloud computing AWS Azure career', 3)
    ]);

    return {
      technology: techNews,
      ai: aiNews,
      development: devNews,
      data: dataNews,
      design: designNews,
      cloud: cloudNews
    };
  }
}

export const localNewsService = new LocalNewsService();

