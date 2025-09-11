import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  Heart, 
  GraduationCap, 
  Brain,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface JobDetailsProps {
  job: any;
  analysis: any;
  onBack: () => void;
  onGenerateRoadmap: (jobData: any) => void;
}

export const JobDetails = ({ job, analysis, onBack, onGenerateRoadmap }: JobDetailsProps) => {
  const handleGenerateRoadmap = () => {
    const jobData = { job, analysis };
    
    // Save job to storage
    if (typeof (window as any).saveJobToStorage === 'function') {
      (window as any).saveJobToStorage(jobData);
    }
    
    onGenerateRoadmap(jobData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{job.title}</h2>
          <p className="text-muted-foreground">{job.company}</p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          {analysis.compatibility}% Match
        </Badge>
      </div>

      {/* Job Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Job Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{analysis.introduction}</p>
        </CardContent>
      </Card>

      {/* Future Outlook & Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Future Outlook
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{analysis.future}</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analysis.growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="demand" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Salary Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Entry Level</span>
                <span className="text-sm font-medium">{analysis.salaryInsights.entry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Mid Level</span>
                <span className="text-sm font-medium">{analysis.salaryInsights.mid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Senior Level</span>
                <span className="text-sm font-medium">{analysis.salaryInsights.senior}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Factors affecting salary:</p>
              <div className="flex flex-wrap gap-1">
                {analysis.salaryInsights.factors.map((factor: string) => (
                  <Badge key={factor} variant="outline" className="text-xs">
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compatibility Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Compatibility Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Based on your profile and interests</span>
              <span className="text-2xl font-bold text-primary">{analysis.compatibility}%</span>
            </div>
            <Progress value={analysis.compatibility} className="h-3" />
            <p className="text-sm text-muted-foreground">
              Great match! Your GitHub projects and skills align well with this role.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Required Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Academic Skills Needed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.academicSkills.map((skill: string) => (
                <div key={skill} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{skill}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Soft Skills Needed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.softSkills.map((skill: string) => (
                <div key={skill} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{skill}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roadmap Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Ready to Start Your Journey?</CardTitle>
          <CardDescription>
            Generate a personalized learning roadmap with deadlines to reach this career goal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateRoadmap} className="w-full gap-2">
            Generate Learning Roadmap
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

