import { NextApiRequest, NextApiResponse } from 'next';
import { GitHubService } from '../../../services/githubService';
import { SkillsAnalysisService } from '../../../services/skillsAnalysisService';
import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, userId } = req.body;

    if (!username || !userId) {
      return res.status(400).json({ error: 'Username and userId are required' });
    }

    // Verify user exists
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    const githubService = new GitHubService();
    const skillsService = new SkillsAnalysisService();

    // Sync GitHub data
    const githubUser = await githubService.syncUserData(username, userId);
    if (!githubUser) {
      return res.status(404).json({ error: 'GitHub user not found' });
    }

    // Analyze and store skills
    await skillsService.analyzeAndStoreSkills(userId);

    // Update user profile to mark GitHub as connected
    await supabase
      .from('profiles')
      .update({ 
        github_connected: true,
        github_url: `https://github.com/${username}`,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    res.status(200).json({
      message: 'GitHub data synced successfully',
      githubUser,
    });

  } catch (error) {
    console.error('GitHub sync error:', error);
    res.status(500).json({ 
      error: 'Failed to sync GitHub data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}