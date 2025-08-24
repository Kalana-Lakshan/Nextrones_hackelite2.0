import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Eye, ArrowRight } from 'lucide-react';

interface SavedJob {
  id: string;
  job: any;
  analysis: any;
  savedAt: Date;
}

interface JobStorageProps {
  onSelectJob: (jobData: any) => void;
  onGenerateRoadmap: (jobData: any) => void;
}

export const JobStorage = ({ onSelectJob, onGenerateRoadmap }: JobStorageProps) => {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const loadSavedJobs = () => {
    const stored = localStorage.getItem('savedJobs');
    if (stored) {
      const jobs = JSON.parse(stored);
      setSavedJobs(jobs.map((job: any) => ({
        ...job,
        savedAt: new Date(job.savedAt)
      })));
    }
  };

  const saveJob = (jobData: any) => {
    const newJob: SavedJob = {
      id: Date.now().toString(),
      job: jobData.job,
      analysis: jobData.analysis,
      savedAt: new Date()
    };

    const updated = [...savedJobs, newJob];
    setSavedJobs(updated);
    localStorage.setItem('savedJobs', JSON.stringify(updated));
  };

  const removeJob = (jobId: string) => {
    const updated = savedJobs.filter(job => job.id !== jobId);
    setSavedJobs(updated);
    localStorage.setItem('savedJobs', JSON.stringify(updated));
  };

  // Expose save function globally
  useEffect(() => {
    (window as any).saveJobToStorage = saveJob;
  }, [savedJobs]);

  if (savedJobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Jobs</CardTitle>
          <CardDescription>Jobs you've analyzed will appear here for quick access</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No saved jobs yet. Analyze a job to save it here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Jobs ({savedJobs.length})</CardTitle>
        <CardDescription>Previously analyzed career opportunities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {savedJobs.map((savedJob) => (
            <div key={savedJob.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">{savedJob.job.title}</h4>
                <p className="text-sm text-muted-foreground">{savedJob.job.company}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {savedJob.analysis.compatibility}% Match
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Saved {savedJob.savedAt.toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{savedJob.job.title}</DialogTitle>
                      <DialogDescription>{savedJob.job.company}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium mb-2">Academic Skills Needed</h5>
                          <div className="space-y-1">
                            {savedJob.analysis.academicSkills.slice(0, 5).map((skill: string) => (
                              <Badge key={skill} variant="outline" className="text-xs mr-1 mb-1">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium mb-2">Soft Skills Needed</h5>
                          <div className="space-y-1">
                            {savedJob.analysis.softSkills.slice(0, 5).map((skill: string) => (
                              <Badge key={skill} variant="outline" className="text-xs mr-1 mb-1">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => onGenerateRoadmap({ job: savedJob.job, analysis: savedJob.analysis })}
                          className="flex-1"
                        >
                          Generate Roadmap
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeJob(savedJob.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

