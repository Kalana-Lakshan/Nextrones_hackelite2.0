import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function GitHubIntegration() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    setErrorMessage('');
    // Get the current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setErrorMessage('You must be logged in to connect GitHub.');
      setIsLoading(false);
      return;
    }
    // Import and call the real GitHub sync service
    try {
      // Import the syncUserData function directly
      const { syncUserData } = await import('../services/githubService');
      const username = prompt('Enter your GitHub username:');
      if (!username) {
        setErrorMessage('GitHub username is required.');
        setIsLoading(false);
        return;
      }
      await syncUserData(username, user.id);
      setSuccess(true);
    } catch (err) {
      setErrorMessage('Unexpected error: ' + (err.message || err));
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">GitHub Integration</h2>
      <button
        onClick={handleConnect}
        disabled={isLoading || success}
        className={`px-6 py-2 rounded-md font-medium ${isLoading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : success ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
      >
        {success ? 'GitHub Connected' : isLoading ? 'Connecting...' : 'Connect with GitHub'}
      </button>
      {isLoading && (
        <div className="mt-4 text-blue-600">Connecting to GitHub...</div>
      )}
      {errorMessage && (
        <div className="mt-4 text-red-600">{errorMessage}</div>
      )}
      {success && (
        <div className="mt-4 text-green-600">Successfully connected to GitHub!</div>
      )}
    </div>
  );
}