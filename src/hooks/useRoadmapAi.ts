import { useState, useCallback } from 'react';
import { roadmapAiService, RoadmapItem, RoadmapGenerationParams } from '@/services/roadmapAiService';

export const useRoadmapAi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePersonalizedRoadmap = useCallback(async (params: RoadmapGenerationParams): Promise<RoadmapItem[]> => {
    setLoading(true);
    setError(null);

    try {
      const roadmap = await roadmapAiService.generatePersonalizedRoadmap(params);
      return roadmap;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate roadmap';
      setError(errorMessage);
      console.error('Roadmap generation error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    generatePersonalizedRoadmap,
  };
};

