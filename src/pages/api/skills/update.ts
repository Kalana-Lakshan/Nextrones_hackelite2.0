import { NextApiRequest, NextApiResponse } from 'next';
import { SkillsAnalysisService } from '../../../services/skillsAnalysisService';
import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, skillName, proficiencyLevel } = req.body;

    if (!userId || !skillName) {
      return res.status(400).json({ error: 'userId and skillName are required' });
    }

    // Verify user exists
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    const skillsService = new SkillsAnalysisService();
    await skillsService.updateSkillProficiency(userId, skillName, proficiencyLevel);

    res.status(200).json({ message: 'Skill updated successfully' });

  } catch (error) {
    console.error('Skill update error:', error);
    res.status(500).json({ 
      error: 'Failed to update skill',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}