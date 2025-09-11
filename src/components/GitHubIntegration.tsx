import { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { GitHubService } from '@/services/githubService';
import { SkillsAnalysisService } from '@/services/skillsAnalysisService';

interface GitHubIntegrationProps {
  onSyncComplete?: () => void;
}

interface SkillsSummary {
  profile: any;
  skillsProgress: any[];
  githubSummary: any;
}

export default function GitHubIntegration({ onSyncComplete }: GitHubIntegrationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [skillsSummary, setSkillsSummary] = useState<SkillsSummary | null>(null);
  const user = useUser();

  // Load existing skills summary on component mount
  useEffect(() => {
    if (user?.id) {
      loadSkillsSummary();
    }
  }, [user?.id]);

  const loadSkillsSummary = async () => {
    try {
      // For now, we'll load the profile data directly from Supabase
      // This can be enhanced later with a dedicated skills summary function
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (profile) {
        setSkillsSummary({
          profile: profile,
          skillsProgress: [], // This would come from a skills progress table
          githubSummary: null // This would come from GitHub data
        });
      }
    } catch (error) {
      console.error('Error loading skills summary:', error);
    }
  };

  const handleGitHubSync = async () => {
    if (!githubUsername.trim() || !user?.id) {
      setErrorMessage('Please enter a valid GitHub username');
      return;
    }

    setIsLoading(true);
    setSyncStatus('syncing');
    setErrorMessage('');

    try {
      // Use the existing GitHub service directly
      const githubService = new GitHubService();
      const skillsService = new SkillsAnalysisService();

      // Sync GitHub data
      const githubUser = await githubService.syncUserData(githubUsername.trim(), user.id);
      if (!githubUser) {
        throw new Error('GitHub user not found');
      }

      // Analyze and store skills
      await skillsService.analyzeAndStoreSkills(user.id);

      // Update user profile to mark GitHub as connected
      await supabase
        .from('profiles')
        .update({ 
          github_connected: true,
          github_url: `https://github.com/${githubUsername.trim()}`,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      setSyncStatus('success');
      await loadSkillsSummary(); // Reload skills data
      
      if (onSyncComplete) {
        onSyncComplete();
      }

    } catch (error) {
      console.error('GitHub sync failed:', error);
      setSyncStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSkillsOverview = () => {
    if (!skillsSummary) return null;

    const { profile, skillsProgress, githubSummary } = skillsSummary;

    return (
      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-semibold">Skills Overview</h3>
        
        {githubSummary && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">GitHub Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Repositories:</span>
                <span className="ml-1 font-medium">{githubSummary.totalRepositories}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Commits:</span>
                <span className="ml-1 font-medium">{githubSummary.contributions.totalCommits}</span>
              </div>
              <div>
                <span className="text-gray-600">Followers:</span>
                <span className="ml-1 font-medium">{githubSummary.user.followers}</span>
              </div>
              <div>
                <span className="text-gray-600">Public Repos:</span>
                <span className="ml-1 font-medium">{githubSummary.user.public_repos}</span>
              </div>
            </div>
          </div>
        )}

        {profile && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Identified Skills</h4>
            <div className="flex flex-wrap gap-2">
              {profile.skills?.slice(0, 10).map((skill: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                >
                  {skill}
                </span>
              ))}
              {profile.skills?.length > 10 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-md">
                  +{profile.skills.length - 10} more
                </span>
              )}
            </div>
            
            {profile.experience_level && (
              <div className="mt-2">
                <span className="text-gray-600 text-sm">Experience Level:</span>
                <span className="ml-1 font-medium capitalize">{profile.experience_level}</span>
              </div>
            )}
          </div>
        )}

        {skillsProgress && skillsProgress.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Learning Progress</h4>
            <div className="space-y-2">
              {skillsProgress.slice(0, 5).map((progress, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{progress.skill_name}</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {progress.proficiency_level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">GitHub Integration</h2>
      
      <div className="mb-4">
        <label htmlFor="github-username" className="block text-sm font-medium text-gray-700 mb-2">
          GitHub Username
        </label>
        <div className="flex gap-3">
          <input
            id="github-username"
            type="text"
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            placeholder="Enter your GitHub username"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleGitHubSync}
            disabled={isLoading || !githubUsername.trim()}
            className={`px-6 py-2 rounded-md font-medium ${
              isLoading || !githubUsername.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Syncing...' : 'Sync GitHub'}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {syncStatus === 'syncing' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-blue-800">Analyzing your GitHub repositories and extracting skills...</span>
          </div>
        </div>
      )}

      {syncStatus === 'success' && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <span className="text-green-800">✅ GitHub data synced successfully! Skills analysis complete.</span>
        </div>
      )}

      {syncStatus === 'error' && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <span className="text-red-800">❌ {errorMessage}</span>
        </div>
      )}

      {/* Skills Overview */}
      {renderSkillsOverview()}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">How it works:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
          <li>Enter your GitHub username and click "Sync GitHub"</li>
          <li>We'll analyze your repositories, languages, and contributions</li>
          <li>Skills will be automatically extracted and categorized</li>
          <li>Your experience level will be determined based on activity</li>
          <li>Learning recommendations will be generated</li>
        </ol>
      </div>
    </div>
  );
}