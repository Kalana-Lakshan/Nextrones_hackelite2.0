import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, XCircle, AlertTriangle, Database } from 'lucide-react';

export const ProfileDebugger = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setProfileData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testUpdate = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          skills: ['JavaScript', 'React'],
          interests: ['Web Development'],
          goals: ['Learn TypeScript'],
          experience_level: 'intermediate',
          bio: 'Test bio',
          current_job_title: 'Developer',
          target_job_title: 'Senior Developer',
          location: 'New York',
          time_commitment: 'moderate',
          preferred_learning_style: 'visual',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        setError(`Update failed: ${error.message}`);
      } else {
        setError(null);
        await checkProfile();
      }
    } catch (err: any) {
      setError(`Update error: ${err.message}`);
    }
  };

  useEffect(() => {
    checkProfile();
  }, [user]);

  const requiredFields = [
    'skills', 'interests', 'experience_level', 'goals', 'bio',
    'current_job_title', 'target_job_title', 'location',
    'time_commitment', 'preferred_learning_style', 'learning_preferences'
  ];

  const getFieldStatus = (field: string) => {
    if (!profileData) return 'unknown';
    
    const value = profileData[field];
    if (value === null || value === undefined) return 'missing';
    if (Array.isArray(value) && value.length === 0) return 'empty';
    if (typeof value === 'string' && value.trim() === '') return 'empty';
    return 'present';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'empty':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'missing':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'empty':
        return 'bg-yellow-100 text-yellow-800';
      case 'missing':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Profile Debugger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please log in to debug profile issues.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Profile Debugger
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={checkProfile} disabled={loading}>
            {loading ? 'Checking...' : 'Check Profile'}
          </Button>
          <Button onClick={testUpdate} variant="outline">
            Test Update
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        {profileData && (
          <div className="space-y-3">
            <h4 className="font-semibold">Field Status:</h4>
            <div className="grid grid-cols-2 gap-2">
              {requiredFields.map((field) => {
                const status = getFieldStatus(field);
                return (
                  <div key={field} className="flex items-center gap-2 p-2 border rounded">
                    {getStatusIcon(status)}
                    <span className="text-sm font-mono">{field}</span>
                    <Badge className={getStatusColor(status)}>
                      {status}
                    </Badge>
                  </div>
                );
              })}
            </div>

            <div className="mt-4">
              <h4 className="font-semibold mb-2">Raw Profile Data:</h4>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(profileData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

