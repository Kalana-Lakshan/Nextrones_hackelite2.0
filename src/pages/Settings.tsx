import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Linkedin, 
  Github, 
  BookOpen, 
  Upload, 
  User,
  Calendar,
  FileText,
  CalendarIcon,
  Edit
} from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

export default function Settings() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [graduationDate, setGraduationDate] = useState<Date>();

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [session, navigate]);

  const loadProfile = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
        if (profileData.graduation_year) {
          setGraduationDate(new Date(profileData.graduation_year));
        }
      }
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const connectAccount = async (platform: 'linkedin' | 'github' | 'coursera', url: string) => {
    try {
      const updateData: any = {};
      updateData[`${platform}_connected`] = true;
      updateData[`${platform}_url`] = url;

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      loadProfile();
      toast({
        title: "Account connected",
        description: `Your ${platform} account has been connected successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error connecting account",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateGraduationDate = async () => {
    if (!graduationDate) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ graduation_year: graduationDate.toISOString() })
        .eq('user_id', user?.id);

      if (error) throw error;

      loadProfile();
      toast({
        title: "Graduation date updated",
        description: "Your graduation date has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating graduation date",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const uploadModuleDescriptor = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/module-descriptor.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('curricula')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ module_descriptor_uploaded: true })
        .eq('user_id', user?.id);

      if (updateError) throw updateError;

      loadProfile();
      toast({
        title: "Module descriptor uploaded",
        description: "Your module descriptor has been uploaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error uploading file",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Configure your profile and account connections</p>
          </div>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Your basic profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email || ''} disabled />
                </div>
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input id="full_name" value={profile?.full_name || ''} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Graduation or Goal Year</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex-1 justify-start">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {graduationDate ? format(graduationDate, 'PPP') : 'Select graduation date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={graduationDate}
                        onSelect={setGraduationDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                      <div className="p-3 border-t">
                        <div className="grid grid-cols-4 gap-2">
                          {[2024, 2025, 2026, 2027].map((year) => (
                            <Button
                              key={year}
                              variant="outline"
                              size="sm"
                              onClick={() => setGraduationDate(new Date(year, 5, 1))}
                            >
                              {year}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button onClick={updateGraduationDate} disabled={!graduationDate}>
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Connections */}
          <Card>
            <CardHeader>
              <CardTitle>Account Connections</CardTitle>
              <CardDescription>Connect your professional accounts for better recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ConnectionButton
                icon={<Linkedin className="h-4 w-4" />}
                label="LinkedIn"
                connected={profile?.linkedin_connected}
                currentUrl={profile?.linkedin_url}
                onConnect={(url) => connectAccount('linkedin', url)}
              />
              <ConnectionButton
                icon={<Github className="h-4 w-4" />}
                label="GitHub"
                connected={profile?.github_connected}
                currentUrl={profile?.github_url}
                onConnect={(url) => connectAccount('github', url)}
              />
              <ConnectionButton
                icon={<BookOpen className="h-4 w-4" />}
                label="Coursera"
                connected={profile?.coursera_connected}
                currentUrl={profile?.coursera_url}
                onConnect={(url) => connectAccount('coursera', url)}
              />
            </CardContent>
          </Card>

          {/* Module Descriptor Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Module Descriptor
              </CardTitle>
              <CardDescription>Upload your curriculum/module descriptor for personalized recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile?.module_descriptor_uploaded ? (
                  <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span className="text-green-800">Module descriptor uploaded</span>
                  </div>
                ) : null}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  id="module-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadModuleDescriptor(file);
                  }}
                />
                <label htmlFor="module-upload">
                  <Button variant="outline" className="w-full gap-2 cursor-pointer" asChild>
                    <span>
                      <Upload className="h-4 w-4" />
                      {profile?.module_descriptor_uploaded ? 'Replace Module Descriptor' : 'Upload Module Descriptor'}
                    </span>
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Connection Button Component
function ConnectionButton({ 
  icon, 
  label, 
  connected, 
  currentUrl,
  onConnect 
}: { 
  icon: React.ReactNode; 
  label: string; 
  connected: boolean; 
  currentUrl?: string;
  onConnect: (url: string) => void;
}) {
  const [url, setUrl] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium">{label}</span>
        {connected && currentUrl && (
          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
            {currentUrl}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {connected ? (
          <>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-600">Connected</span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setUrl(currentUrl || '');
                setShowDialog(true);
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={() => setShowDialog(true)}>
            Connect
          </Button>
        )}
      </div>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{connected ? 'Update' : 'Connect'} {label}</DialogTitle>
            <DialogDescription>
              {connected ? 'Update your' : 'Enter your'} {label} profile URL
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="url">Profile URL</Label>
              <Input
                id="url"
                placeholder={`Enter your ${label} profile URL`}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => {
                  setShowDialog(false);
                  setUrl('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  onConnect(url);
                  setShowDialog(false);
                  setUrl('');
                }} 
                className="flex-1"
                disabled={!url.trim()}
              >
                {connected ? 'Update' : 'Connect'} Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}