import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, CheckCircle, Settings, Upload, Calendar, Linkedin, Github, BookOpen } from 'lucide-react';

interface OnboardingFlowProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingFlow = ({ isOpen, onComplete }: OnboardingFlowProps) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<any>(null);

  const steps = [
    {
      title: "Welcome to CareerPath! 🎉",
      description: "Let's get you set up for success. We'll guide you through connecting your accounts and setting up your profile.",
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      action: null
    },
    {
      title: "Connect Your Accounts",
      description: "Link your LinkedIn, GitHub, and Coursera accounts to sync your progress automatically.",
      icon: <Settings className="h-8 w-8 text-primary" />,
      action: "Go to Settings"
    },
    {
      title: "Upload Module Descriptor",
      description: "Upload your curriculum or module descriptor so we can provide personalized recommendations.",
      icon: <Upload className="h-8 w-8 text-primary" />,
      action: "Upload Document"
    },
    {
      title: "Set Graduation Year",
      description: "Tell us your graduation year or career goal year to create timeline-based roadmaps.",
      icon: <Calendar className="h-8 w-8 text-primary" />,
      action: "Set Year"
    },
    {
      title: "You're All Set! 🚀",
      description: "Now you can explore career opportunities, get personalized roadmaps, and track your progress.",
      icon: <CheckCircle className="h-8 w-8 text-green-500" />,
      action: "Start Exploring"
    }
  ];

  useEffect(() => {
    if (isOpen && user) {
      loadProfile();
    }
  }, [isOpen, user]);

  const loadProfile = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      markOnboardingComplete();
    }
  };

  const handleAction = () => {
    if (currentStep === 1 || currentStep === 2 || currentStep === 3) {
      // These steps require going to settings
      onComplete();
      // Navigate to settings for configuration steps
    } else if (currentStep === steps.length - 1) {
      // Final step - go to dashboard
      markOnboardingComplete();
    } else {
      handleNext();
    }
  };

  const markOnboardingComplete = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user?.id);

      if (error) throw error;
      
      // Navigate to dashboard for the final step
      if (currentStep === steps.length - 1) {
        window.location.href = '/dashboard';
      } else {
        onComplete();
      }
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
      onComplete(); // Still close the flow
    }
  };

  const getProgress = () => {
    return Math.round(((currentStep + 1) / steps.length) * 100);
  };

  const currentStepData = steps[currentStep];

  const canClose = currentStep === steps.length - 1; // Only allow closing on the final step

  return (
    <Dialog open={isOpen} onOpenChange={canClose ? () => onComplete() : undefined}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            {currentStepData.icon}
          </div>
          <DialogTitle className="text-center text-xl">
            {currentStepData.title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{getProgress()}%</span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>

          {/* Step Content */}
          {currentStep === 1 && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4" />
                      <span className="text-sm">LinkedIn</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${profile?.linkedin_connected ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      <span className="text-sm">GitHub</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${profile?.github_connected ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span className="text-sm">Coursera</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${profile?.coursera_connected ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {profile?.module_descriptor_uploaded ? 
                      "✅ Module descriptor uploaded" : 
                      "Upload your curriculum file"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {profile?.graduation_year ? 
                      `✅ Graduation year set: ${profile.graduation_year}` : 
                      "Set your graduation or goal year"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && currentStep < steps.length - 1 && (
              <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)} className="flex-1">
                Back
              </Button>
            )}
            <Button onClick={handleAction} className="flex-1 gap-2">
              {currentStepData.action || 'Next'}
              {currentStep < steps.length - 1 && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>

          {/* Skip option for non-essential steps */}
          {(currentStep === 1 || currentStep === 2 || currentStep === 3) && (
            <div className="text-center">
              <Button variant="ghost" size="sm" onClick={handleNext}>
                Skip for now
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};