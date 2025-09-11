import { useState, useEffect, useCallback } from 'react';
import { newsApiService, NewsArticle } from '@/services/newsApiService';

export const useNewsApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCareerNews = useCallback(async (userSkills: string[] = [], userInterests: string[] = []): Promise<{
    technology: NewsArticle[];
    ai: NewsArticle[];
    development: NewsArticle[];
    data: NewsArticle[];
    design: NewsArticle[];
    cloud: NewsArticle[];
  }> => {
    setLoading(true);
    setError(null);

    try {
      const news = await newsApiService.getCareerNews(userSkills, userInterests);
      return news;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch news';
      setError(errorMessage);
      console.error('News API error:', err);
      return {
        technology: [],
        ai: [],
        development: [],
        data: [],
        design: [],
        cloud: []
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const searchNews = useCallback(async (query: string, pageSize: number = 10): Promise<NewsArticle[]> => {
    setLoading(true);
    setError(null);

    try {
      const news = await newsApiService.searchNews(query, pageSize);
      return news;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search news';
      setError(errorMessage);
      console.error('News search error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getTopHeadlines = useCallback(async (category: string = 'technology', country: string = 'us', pageSize: number = 10): Promise<NewsArticle[]> => {
    setLoading(true);
    setError(null);

    try {
      const news = await newsApiService.getTopHeadlines(category, country, pageSize);
      return news;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch headlines';
      setError(errorMessage);
      console.error('Headlines error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getCareerNews,
    searchNews,
    getTopHeadlines,
  };
};

