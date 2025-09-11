import { NextApiRequest, NextApiResponse } from 'next';
import { SkillsAnalysisService } from '../../../services/skillsAnalysisService';
import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Verify user exists
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    const skillsService = new SkillsAnalysisService();
    const summary = await skillsService.getUserSkillsSummary(userId);

    res.status(200).json(summary);

  } catch (error) {
    console.error('Skills summary error:', error);
    res.status(500).json({ 
      error: 'Failed to get skills summary',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}