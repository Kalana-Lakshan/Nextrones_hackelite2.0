import { localNewsService } from './localNewsService';

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

class NewsApiService {
  private readonly apiKey = 'da57d981509a40b69f985e72813898e7';
  private readonly baseUrl = 'https://newsapi.org/v2';
  private readonly proxyUrls = [
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://thingproxy.freeboard.io/fetch/',
    'https://api.codetabs.com/v1/proxy?quest='
  ];

  private async tryFetchWithProxies(apiUrl: string): Promise<Response | null> {
    for (const proxyUrl of this.proxyUrls) {
      try {
        const fullUrl = proxyUrl.includes('raw?url=') 
          ? `${proxyUrl}${encodeURIComponent(apiUrl)}`
          : `${proxyUrl}${apiUrl}`;
        
        console.log('Trying proxy:', proxyUrl, 'for URL:', apiUrl);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout per proxy
        
        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log('Success with proxy:', proxyUrl);
          return response;
        }
      } catch (error) {
        console.warn('Proxy failed:', proxyUrl, error);
        continue;
      }
    }
    return null;
  }

  async getTopHeadlines(category: string = 'technology', country: string = 'us', pageSize: number = 10): Promise<NewsArticle[]> {
    try {
      const apiUrl = `${this.baseUrl}/top-headlines?category=${category}&country=${country}&pageSize=${pageSize}&apiKey=${this.apiKey}`;
      
      const response = await this.tryFetchWithProxies(apiUrl);
      
      if (!response) {
        console.warn('All proxies failed - using local news service for category:', category);
        return await localNewsService.getTopHeadlines(category, 'us', pageSize);
      }

      const data: NewsResponse = await response.json();
      
      if (data.status === 'ok' && data.articles && data.articles.length > 0) {
        return data.articles.map((article, index) => ({
          ...article,
          id: `news-${category}-${index}-${Date.now()}`,
          category: this.mapCategoryToCareerCategory(category)
        }));
      }
      
      return await localNewsService.getTopHeadlines(category, 'us', pageSize);
    } catch (error) {
      console.error('Error fetching top headlines:', error);
      return await localNewsService.getTopHeadlines(category, 'us', pageSize);
    }
  }

  async searchNews(query: string, pageSize: number = 10): Promise<NewsArticle[]> {
    try {
      const apiUrl = `${this.baseUrl}/everything?q=${encodeURIComponent(query)}&pageSize=${pageSize}&sortBy=publishedAt&apiKey=${this.apiKey}`;
      
      const response = await this.tryFetchWithProxies(apiUrl);
      
      if (!response) {
        console.warn('All proxies failed - using local news service for query:', query);
        return await localNewsService.searchNews(query, pageSize);
      }

      const data: NewsResponse = await response.json();
      
      if (data.status === 'ok' && data.articles && data.articles.length > 0) {
        return data.articles.map((article, index) => ({
          ...article,
          id: `search-${query.replace(/\s+/g, '-')}-${index}-${Date.now()}`,
          category: this.extractCategoryFromQuery(query)
        }));
      }
      
      return await localNewsService.searchNews(query, pageSize);
    } catch (error) {
      console.error('Error searching news:', error);
      return await localNewsService.searchNews(query, pageSize);
    }
  }

  async getCareerNews(userSkills: string[] = [], userInterests: string[] = []): Promise<{
    technology: NewsArticle[];
    ai: NewsArticle[];
    development: NewsArticle[];
    data: NewsArticle[];
    design: NewsArticle[];
    cloud: NewsArticle[];
  }> {
    try {
      // Fetch news for different career categories with better error handling
      const [techNews, aiNews, devNews, dataNews, designNews, cloudNews] = await Promise.allSettled([
        this.getTopHeadlines('technology', 'us', 3),
        this.searchNews('artificial intelligence machine learning career', 3),
        this.searchNews('software development programming career', 3),
        this.searchNews('data science analytics career', 3),
        this.searchNews('UX UI design career', 3),
        this.searchNews('cloud computing AWS Azure career', 3)
      ]);

      return {
        technology: techNews.status === 'fulfilled' ? techNews.value : await localNewsService.getTopHeadlines('technology', 'us', 3),
        ai: aiNews.status === 'fulfilled' ? aiNews.value : await localNewsService.searchNews('artificial intelligence machine learning career', 3),
        development: devNews.status === 'fulfilled' ? devNews.value : await localNewsService.searchNews('software development programming career', 3),
        data: dataNews.status === 'fulfilled' ? dataNews.value : await localNewsService.searchNews('data science analytics career', 3),
        design: designNews.status === 'fulfilled' ? designNews.value : await localNewsService.searchNews('UX UI design career', 3),
        cloud: cloudNews.status === 'fulfilled' ? cloudNews.value : await localNewsService.searchNews('cloud computing AWS Azure career', 3)
      };
    } catch (error) {
      console.error('Error fetching career news:', error);
      return await localNewsService.getCareerNews(userSkills, userInterests);
    }
  }

  private mapCategoryToCareerCategory(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'technology': 'Technology',
      'business': 'Business',
      'science': 'Science',
      'health': 'Health',
      'sports': 'Sports',
      'entertainment': 'Entertainment'
    };
    return categoryMap[category] || 'Technology';
  }

  private extractCategoryFromQuery(query: string): string {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('ai') || lowerQuery.includes('artificial intelligence') || lowerQuery.includes('machine learning')) {
      return 'AI/ML Career Path';
    }
    if (lowerQuery.includes('development') || lowerQuery.includes('programming') || lowerQuery.includes('software')) {
      return 'Full-Stack Development';
    }
    if (lowerQuery.includes('data') || lowerQuery.includes('analytics')) {
      return 'Data Science Trends';
    }
    if (lowerQuery.includes('design') || lowerQuery.includes('ux') || lowerQuery.includes('ui')) {
      return 'UX/UI Design';
    }
    if (lowerQuery.includes('cloud') || lowerQuery.includes('aws') || lowerQuery.includes('azure')) {
      return 'Cloud Computing';
    }
    return 'Technology';
  }

  private getFallbackNews(category: string): NewsArticle[] {
    const timestamp = Date.now();
    const fallbackNews: { [key: string]: NewsArticle[] } = {
      'technology': [
        {
          id: `fallback-tech-${timestamp}`,
          title: 'Tech Industry Sees Record Growth in 2024',
          description: 'Technology companies report unprecedented growth with new innovations driving market expansion.',
          url: 'https://example.com/tech-growth-2024',
          urlToImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop',
          publishedAt: new Date().toISOString(),
          source: { id: 'tech-news', name: 'Tech News' },
          author: 'Tech Reporter',
          content: 'Technology industry continues to grow...',
          category: 'Technology'
        },
        {
          id: `fallback-tech-2-${timestamp}`,
          title: 'Remote Work Tools Revolutionize Tech Industry',
          description: 'New collaboration platforms and AI-powered tools are transforming how tech teams work remotely.',
          url: 'https://example.com/remote-work-tech',
          urlToImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=200&fit=crop',
          publishedAt: new Date(Date.now() - 86400000).toISOString(),
          source: { id: 'tech-news', name: 'Tech News' },
          author: 'Tech Reporter',
          content: 'Remote work technology continues to evolve...',
          category: 'Technology'
        }
      ],
      'ai': [
        {
          id: `fallback-ai-${timestamp}`,
          title: 'AI Skills in High Demand Across Industries',
          description: 'Machine learning engineers see 40% salary growth in 2024 as AI adoption accelerates.',
          url: 'https://example.com/ai-skills-demand',
          urlToImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop',
          publishedAt: new Date().toISOString(),
          source: { id: 'ai-news', name: 'AI News' },
          author: 'AI Reporter',
          content: 'Artificial intelligence skills are becoming essential...',
          category: 'AI/ML Career Path'
        }
      ],
      'development': [
        {
          id: `fallback-dev-${timestamp}`,
          title: 'React and Node.js Remain Top Skills for Developers',
          description: 'Full-stack development continues to be the most sought-after skill set in 2024.',
          url: 'https://example.com/react-nodejs-trends',
          urlToImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop',
          publishedAt: new Date().toISOString(),
          source: { id: 'dev-news', name: 'Dev News' },
          author: 'Dev Reporter',
          content: 'Full-stack development skills remain crucial...',
          category: 'Full-Stack Development'
        }
      ],
      'data': [
        {
          id: `fallback-data-${timestamp}`,
          title: 'Python and SQL Essential for Data Analyst Roles',
          description: 'Data science professionals with Python and SQL skills command higher salaries.',
          url: 'https://example.com/data-skills-2024',
          urlToImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
          publishedAt: new Date().toISOString(),
          source: { id: 'data-news', name: 'Data News' },
          author: 'Data Reporter',
          content: 'Data science skills are increasingly valuable...',
          category: 'Data Science Trends'
        }
      ],
      'design': [
        {
          id: `fallback-design-${timestamp}`,
          title: 'Design Thinking Skills in High Demand Across Industries',
          description: 'UX/UI designers with strong design thinking capabilities are highly sought after.',
          url: 'https://example.com/design-thinking-demand',
          urlToImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=200&fit=crop',
          publishedAt: new Date().toISOString(),
          source: { id: 'design-news', name: 'Design News' },
          author: 'Design Reporter',
          content: 'Design thinking is becoming a core business skill...',
          category: 'UX/UI Design'
        }
      ],
      'cloud': [
        {
          id: `fallback-cloud-${timestamp}`,
          title: 'AWS and Azure Certifications Boost Career Prospects',
          description: 'Cloud computing certifications continue to provide significant career advantages.',
          url: 'https://example.com/cloud-certifications-2024',
          urlToImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=200&fit=crop',
          publishedAt: new Date().toISOString(),
          source: { id: 'cloud-news', name: 'Cloud News' },
          author: 'Cloud Reporter',
          content: 'Cloud computing skills are essential for modern IT careers...',
          category: 'Cloud Computing'
        }
      ]
    };

    return fallbackNews[category] || fallbackNews['technology'];
  }

  private getFallbackCareerNews(): {
    technology: NewsArticle[];
    ai: NewsArticle[];
    development: NewsArticle[];
    data: NewsArticle[];
    design: NewsArticle[];
    cloud: NewsArticle[];
  } {
    return {
      technology: this.getFallbackNews('technology'),
      ai: this.getFallbackNews('ai'),
      development: this.getFallbackNews('development'),
      data: this.getFallbackNews('data'),
      design: this.getFallbackNews('design'),
      cloud: this.getFallbackNews('cloud')
    };
  }
}

export const newsApiService = new NewsApiService();
