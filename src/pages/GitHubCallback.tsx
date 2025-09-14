import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function GitHubCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const storedState = localStorage.getItem('github_oauth_state');

    async function handleOAuth() {
      if (code && state && state === storedState) {
        try {
          // Exchange code for access token
          const response = await fetch(`/api/github-oauth?code=${code}`);
          const data = await response.json();
          if (data.access_token) {
            // Optionally store token in localStorage/session
            localStorage.setItem('github_access_token', data.access_token);
            // Trigger GitHub data sync (could be a backend call or Supabase function)
            // Redirect to settings with success message
            navigate('/settings?github_connected=1');
          } else {
            navigate('/settings?github_connected=0');
          }
        } catch (err) {
          navigate('/settings?github_connected=0');
        }
      } else {
        navigate('/settings?github_connected=0');
      }
    }
    handleOAuth();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-xl font-bold mb-4">Connecting to GitHub...</h2>
      <p className="text-muted-foreground">Please wait while we complete your authentication.</p>
    </div>
  );
}
