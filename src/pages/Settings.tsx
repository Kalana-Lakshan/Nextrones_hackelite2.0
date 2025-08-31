import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Edit,
  CheckCircle,
  AlertCircle,
  Info,
  Shield,
  Zap,
  Target,
  TrendingUp,
  Lightbulb,
  HelpCircle,
  ExternalLink,
  Star,
  Award,
  Rocket,
  Settings as SettingsIcon,
  Bell,
  Palette,
  Globe,
  Lock,
  Users
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

  const calculateProfileCompletion = () => {
    let completed = 0;
    let total = 4;
    
    if (profile?.full_name) completed++;
    if (graduationDate) completed++;
    if (profile?.linkedin_connected || profile?.github_connected) completed++;
    if (profile?.module_descriptor_uploaded) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const getProfileCompletionMessage = () => {
    const completion = calculateProfileCompletion();
    if (completion === 0) return "Let's get started! Complete your profile to unlock personalized recommendations.";
    if (completion < 50) return "Great start! Keep going to get better recommendations.";
    if (completion < 100) return "Almost there! Complete the remaining steps for full benefits.";
    return "Perfect! Your profile is complete and you're getting the best recommendations.";
  };

  const platformInfo = {
    linkedin: {
      name: "LinkedIn",
      description: "Connect your professional experience and network",
      benefits: ["Experience analysis", "Network insights", "Industry trends"],
      icon: <Linkedin className="h-5 w-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    github: {
      name: "GitHub",
      description: "Showcase your coding skills and projects",
      benefits: ["Skill assessment", "Project portfolio", "Code quality insights"],
      icon: <Github className="h-5 w-5" />,
      color: "text-gray-800",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200"
    },
    coursera: {
      name: "Coursera",
      description: "Track your learning progress and certifications",
      benefits: ["Course mapping", "Skill gaps", "Learning paths"],
      icon: <BookOpen className="h-5 w-5" />,
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
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

  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Configure your profile and account connections</p>
          </div>

          {/* Profile Completion Banner */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/20 p-3 rounded-full">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">Profile Completion</h3>
                    <Badge variant={profileCompletion === 100 ? "default" : "secondary"}>
                      {profileCompletion}% Complete
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">{getProfileCompletionMessage()}</p>
                  <Progress value={profileCompletion} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Your basic profile details and career goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" value={user?.email || ''} disabled />
                  <p className="text-xs text-muted-foreground mt-1">Your email is used for account management</p>
                </div>
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input id="full_name" value={profile?.full_name || ''} disabled />
                  <p className="text-xs text-muted-foreground mt-1">Your name as it appears on your resume</p>
                </div>
              </div>
              <div className="space-y-3">
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
                        <p className="text-sm text-muted-foreground mb-2">Quick Select:</p>
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
                <p className="text-xs text-muted-foreground">
                  This helps us create a timeline for your career goals and learning path
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Account Connections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Account Connections
              </CardTitle>
              <CardDescription>Connect your professional accounts for better recommendations and insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(platformInfo).map(([key, info]) => (
                <div key={key} className={`p-4 rounded-lg border ${info.bgColor} ${info.borderColor}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${info.bgColor}`}>
                        {info.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{info.name}</h4>
                          {profile?.[`${key}_connected`] && (
                            <Badge variant="default" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Connected
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{info.description}</p>
                        <div className="space-y-1">
                          {info.benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span>{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {profile?.[`${key}_connected`] ? (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              // Handle edit
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(profile?.[`${key}_url`], '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            // Handle connect
                          }}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Module Descriptor Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Academic Curriculum
              </CardTitle>
              <CardDescription>Upload your curriculum/module descriptor for personalized course recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile?.module_descriptor_uploaded ? (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <span className="text-green-800 font-medium">Module descriptor uploaded</span>
                      <p className="text-sm text-green-700">We're using this to personalize your learning recommendations</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">Why upload your curriculum?</h4>
                        <p className="text-sm text-blue-700 mb-3">
                          By uploading your academic curriculum, we can better understand your current knowledge 
                          and recommend courses that complement your studies.
                        </p>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• Get course recommendations that align with your degree</li>
                          <li>• Identify skill gaps in your current curriculum</li>
                          <li>• Receive personalized learning paths</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
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
                <p className="text-xs text-muted-foreground">
                  Supported formats: PDF, DOC, DOCX. Maximum file size: 10MB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>Manage your data and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Data Privacy</p>
                    <p className="text-xs text-muted-foreground">How we use your information</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Notifications</p>
                    <p className="text-xs text-muted-foreground">Manage your notification preferences</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Help & Support */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <HelpCircle className="h-5 w-5" />
                Need Help?
              </CardTitle>
              <CardDescription className="text-blue-700">
                Get support and learn more about CareerPath
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm mb-1">Help Center</h4>
                  <p className="text-xs text-blue-600 mb-2">Find answers to common questions</p>
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-300">
                    Browse Articles
                  </Button>
                </div>
                <div className="text-center p-4">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm mb-1">Community</h4>
                  <p className="text-xs text-blue-600 mb-2">Connect with other professionals</p>
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-300">
                    Join Forum
                  </Button>
                </div>
                <div className="text-center p-4">
                  <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm mb-1">Contact Support</h4>
                  <p className="text-xs text-blue-600 mb-2">Get help from our team</p>
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-300">
                    Contact Us
                  </Button>
                </div>
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