import { useState, useCallback } from 'react';
import { jobsApiService, JobData, JobSearchParams } from '@/services/jobsApi';

export const useJobsApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchJobs = useCallback(async (params: JobSearchParams): Promise<JobData[]> => {
    setLoading(true);
    setError(null);

    try {
      const jobs = await jobsApiService.searchJobs(params);
      return jobs;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch jobs';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getJobsByCompany = useCallback(async (company: string, locality: string = 'us', start: number = 1): Promise<JobData[]> => {
    setLoading(true);
    setError(null);

    try {
      const jobs = await jobsApiService.getJobsByCompany(company, locality, start);
      return jobs;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch company jobs';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getJobsBySkills = useCallback(async (skills: string[], locality: string = 'us', start: number = 1): Promise<JobData[]> => {
    setLoading(true);
    setError(null);

    try {
      const jobs = await jobsApiService.getJobsBySkills(skills, locality, start);
      return jobs;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch jobs by skills';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getJobMarketInsights = useCallback(async (skills: string[], interests: string[], location: string = 'us') => {
    setLoading(true);
    setError(null);

    try {
      const insights = await jobsApiService.getJobMarketInsights(skills, interests, location);
      return insights;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch job market insights';
      setError(errorMessage);
      return {
        totalJobs: 0,
        topCompanies: [],
        averageSalary: 'Not available',
        inDemandSkills: [],
        jobTrends: [],
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    searchJobs,
    getJobsByCompany,
    getJobsBySkills,
    getJobMarketInsights,
  };
};

