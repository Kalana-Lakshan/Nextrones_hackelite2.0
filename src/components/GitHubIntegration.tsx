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
    // Example GitHub user data
    const githubUser = {
      user_id: user.id, // <-- required for RLS
      github_id: Math.floor(Math.random() * 1000000),
      username: 'exampleuser',
      avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
      bio: 'Sample bio',
      public_repos: 10,
      followers: 5,
      following: 2,
      html_url: 'https://github.com/exampleuser',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    try {
      const { error } = await supabase.from('github_users').insert([githubUser]);
      if (error) {
        setErrorMessage('Supabase insert error: ' + error.message);
        setIsLoading(false);
        return;
      }
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