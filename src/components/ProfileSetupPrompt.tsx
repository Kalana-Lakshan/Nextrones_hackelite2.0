import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus, User, Target, BookOpen, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProfileSetupPromptProps {
  onComplete: () => void;
}

export const ProfileSetupPrompt = ({ onComplete }: ProfileSetupPromptProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string>('beginner');
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [goalInput, setGoalInput] = useState('');

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

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          skills,
          interests,
          goals,
          experience_level: experienceLevel,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully!',
      });

      onComplete();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Complete Your Profile
        </CardTitle>
        <CardDescription>
          Help us personalize your learning experience by sharing your skills, interests, and goals.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Experience Level */}
        <div>
          <label className="text-sm font-medium mb-2 block">Experience Level</label>
          <div className="flex gap-2">
            {['beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
              <Button
                key={level}
                variant={experienceLevel === level ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExperienceLevel(level)}
                className="capitalize"
              >
                {level}
              </Button>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="text-sm font-medium mb-2 block">Skills</label>
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
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="gap-1">
                {skill}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeItem('skills', skill)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="text-sm font-medium mb-2 block">Interests</label>
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
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <Badge key={interest} variant="secondary" className="gap-1">
                {interest}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeItem('interests', interest)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div>
          <label className="text-sm font-medium mb-2 block">Goals</label>
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
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {goals.map((goal) => (
              <Badge key={goal} variant="secondary" className="gap-1">
                {goal}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeItem('goals', goal)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-2">
          <Button
            onClick={handleSubmit}
            disabled={loading || (skills.length === 0 && interests.length === 0 && goals.length === 0)}
            className="gap-2"
          >
            <Target className="h-4 w-4" />
            {loading ? 'Saving...' : 'Complete Profile'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

