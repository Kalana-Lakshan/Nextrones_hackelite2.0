import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  ExternalLink,
  Star,
  Award,
  Rocket,
  Settings as SettingsIcon,
  Bell,
  Palette,
  Globe,
  Lock,
  Users,
  Briefcase
} from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { AppNav, AppNavInset } from '@/components/AppNav';
import { SidebarProvider } from '@/components/ui/sidebar';
import GitHubIntegration from '@/components/GitHubIntegration';

export default function Settings() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [graduationDate, setGraduationDate] = useState<Date>();
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string>('beginner');
  const [bio, setBio] = useState<string>('');
  const [currentJobTitle, setCurrentJobTitle] = useState<string>('');
  const [targetJobTitle, setTargetJobTitle] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [timeCommitment, setTimeCommitment] = useState<string>('moderate');
  const [preferredLearningStyle, setPreferredLearningStyle] = useState<string>('mixed');
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [showGitHubIntegration, setShowGitHubIntegration] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    loadProfile();
    // Show toast if redirected from GitHub OAuth
    const params = new URLSearchParams(window.location.search);
    if (params.get('github_connected') === '1') {
      toast({
        title: 'GitHub Connected',
        description: 'Your GitHub account has been connected and synced successfully.',
        duration: 5000,
      });
    }
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
        
        // Load new profile fields
  // Only set state for properties that exist in profileData
  if ('skills' in profileData) setSkills(profileData.skills || []);
  // Remove interests, goals, experience_level, bio, current_job_title, target_job_title, location, time_commitment, preferred_learning_style as they do not exist in the profileData type
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

  const handleGitHubConnect = () => {
    setShowGitHubIntegration(true);
  };

  const handleGitHubSyncComplete = () => {
    setShowGitHubIntegration(false);
    loadProfile(); // Reload profile to show updated connection status
    toast({
      title: "GitHub connected",
      description: "Your GitHub account has been connected and synced successfully.",
    });
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

  const updateProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          skills,
          interests,
          goals,
          experience_level: experienceLevel,
          bio,
          current_job_title: currentJobTitle,
          target_job_title: targetJobTitle,
          location,
          time_commitment: timeCommitment,
          preferred_learning_style: preferredLearningStyle,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      loadProfile();
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addItem = (type: 'skills' | 'interests' | 'goals', value: string) => {
    if (!value.trim()) return;
    
    const trimmedValue = value.trim();
    if (type === 'skills' && !skills.includes(trimmedValue)) {
      setSkills([...skills, trimmedValue]);
      setSkillInput('');
    } else if (type === 'interests' && !interests.includes(trimmedValue)) {
      setInterests([...interests, trimmedValue]);
      setInterestInput('');
    } else if (type === 'goals' && !goals.includes(trimmedValue)) {
      setGoals([...goals, trimmedValue]);
      setGoalInput('');
    }
  };

  const removeItem = (type: 'skills' | 'interests' | 'goals', value: string) => {
    if (type === 'skills') {
      setSkills(skills.filter(s => s !== value));
    } else if (type === 'interests') {
      setInterests(interests.filter(i => i !== value));
    } else if (type === 'goals') {
      setGoals(goals.filter(g => g !== value));
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
    let total = 8; // Increased total for new fields
    
    if (profile?.full_name) completed++;
    if (graduationDate) completed++;
    if (profile?.linkedin_connected || profile?.github_connected) completed++;
    if (profile?.module_descriptor_uploaded) completed++;
    if (skills.length > 0) completed++;
    if (interests.length > 0) completed++;
    if (goals.length > 0) completed++;
    if (bio.trim()) completed++;
    
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
    <SidebarProvider>
      <AppNav />
      <AppNavInset className="bg-gradient-subtle">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-[1400px]">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Configure your profile and account connections</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="flex flex-col sm:flex-row gap-2">
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
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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

          {/* Skills & Interests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Skills & Interests
              </CardTitle>
              <CardDescription>Tell us about your skills, interests, and career goals for personalized recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Experience Level */}
              <div>
                <Label htmlFor="experience_level">Experience Level</Label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Skills */}
              <div>
                <Label htmlFor="skills">Skills</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add a skill (e.g., JavaScript, React, Python)"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addItem('skills', skillInput)}
                  />
                  <Button
                    type="button"
                    onClick={() => addItem('skills', skillInput)}
                    disabled={!skillInput.trim()}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1">
                      {skill}
                      <button
                        onClick={() => removeItem('skills', skill)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <Label htmlFor="interests">Interests</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add an interest (e.g., Web Development, AI, Data Science)"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addItem('interests', interestInput)}
                  />
                  <Button
                    type="button"
                    onClick={() => addItem('interests', interestInput)}
                    disabled={!interestInput.trim()}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="gap-1">
                      {interest}
                      <button
                        onClick={() => removeItem('interests', interest)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Goals */}
              <div>
                <Label htmlFor="goals">Career Goals</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add a goal (e.g., Learn React, Get a Developer Job)"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addItem('goals', goalInput)}
                  />
                  <Button
                    type="button"
                    onClick={() => addItem('goals', goalInput)}
                    disabled={!goalInput.trim()}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {goals.map((goal) => (
                    <Badge key={goal} variant="secondary" className="gap-1">
                      {goal}
                      <button
                        onClick={() => removeItem('goals', goal)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <Button onClick={updateProfile} className="w-full">
                Save Skills & Interests
              </Button>
            </CardContent>
          </Card>

          {/* Career Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Career Information
              </CardTitle>
              <CardDescription>Help us understand your career path and learning preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="current_job_title">Current Job Title</Label>
                  <Input
                    id="current_job_title"
                    placeholder="e.g., Frontend Developer, Student, Data Analyst"
                    value={currentJobTitle}
                    onChange={(e) => setCurrentJobTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="target_job_title">Target Job Title</Label>
                  <Input
                    id="target_job_title"
                    placeholder="e.g., Senior Full Stack Developer, ML Engineer"
                    value={targetJobTitle}
                    onChange={(e) => setTargetJobTitle(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., New York, NY or Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself, your background, and what you're passionate about..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="time_commitment">Time Commitment</Label>
                  <Select value={timeCommitment} onValueChange={setTimeCommitment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time commitment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (1-5 hours/week)</SelectItem>
                      <SelectItem value="moderate">Moderate (6-15 hours/week)</SelectItem>
                      <SelectItem value="high">High (16+ hours/week)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="learning_style">Preferred Learning Style</Label>
                  <Select value={preferredLearningStyle} onValueChange={setPreferredLearningStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select learning style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visual">Visual</SelectItem>
                      <SelectItem value="auditory">Auditory</SelectItem>
                      <SelectItem value="kinesthetic">Hands-on</SelectItem>
                      <SelectItem value="reading">Reading</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={updateProfile} className="w-full">
                Save Career Information
              </Button>
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
                            if (key === 'github') {
                              // For GitHub, we need to use the GitHub integration component
                              // This will be handled by opening a dialog or redirecting
                              handleGitHubConnect();
                            } else {
                              // For other platforms, use the existing connectAccount function
                              const url = prompt(`Enter your ${info.name} profile URL:`);
                              if (url) {
                                connectAccount(key as 'linkedin' | 'github' | 'coursera', url);
                              }
                            }
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


        </div>
      </div>
      </AppNavInset>

      {/* GitHub Integration Dialog */}
      <Dialog open={showGitHubIntegration} onOpenChange={setShowGitHubIntegration}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Connect GitHub Account</DialogTitle>
            <DialogDescription>
              Connect your GitHub account to analyze your coding skills and generate personalized learning roadmaps.
            </DialogDescription>
          </DialogHeader>
          <GitHubIntegration />
        </DialogContent>
      </Dialog>

      {/* GitHub Connect Button (visible in settings) */}
      <div className="mt-6 flex justify-center">
        {!profile?.github_connected && (
          <Button
            variant="default"
            onClick={handleGitHubConnect}
          >
            <span className="flex items-center gap-2">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.332-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.527.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.649.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.803 5.624-5.475 5.921.43.371.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.218.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              Connect GitHub
            </span>
          </Button>
        )}
        {profile?.github_connected && (
          <div className="text-green-700 font-semibold flex items-center gap-2">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.332-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.527.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.649.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.803 5.624-5.475 5.921.43.371.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.218.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            GitHub is connected!
          </div>
        )}
      </div>
    </SidebarProvider>
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