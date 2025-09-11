import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Eye, ArrowRight } from 'lucide-react';

interface SavedItem {
  id: string;
  type: 'job' | 'pathway';
  job?: any;
  pathway?: any;
  analysis?: any;
  savedAt: Date;
}

interface JobStorageProps {
  onSelectJob: (jobData: any) => void;
  onGenerateRoadmap: (jobData: any) => void;
}

export const JobStorage = ({ onSelectJob, onGenerateRoadmap }: JobStorageProps) => {
  const [savedJobs, setSavedJobs] = useState<SavedItem[]>([]);
  const defaultRoadmaps = [
    { id: 'default-fe', title: 'Frontend Developer Roadmap', category: 'Software Development', description: 'HTML/CSS → JS/TS → React → Testing → Performance' },
    { id: 'default-ds', title: 'Data Scientist Roadmap', category: 'Data', description: 'Python → Stats → ML → SQL → Deployment' },
    { id: 'default-devops', title: 'DevOps Engineer Roadmap', category: 'Cloud', description: 'Linux → Networking → CI/CD → Containers → IaC' },
  ];

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

  const saveItem = (data: { type: 'job' | 'pathway'; job?: any; pathway?: any; analysis?: any; }) => {
    const newItem: SavedItem = {
      id: Date.now().toString(),
      type: data.type,
      job: data.job,
      pathway: data.pathway,
      analysis: data.analysis,
      savedAt: new Date()
    };

    const updated = [...savedJobs, newItem];
    setSavedJobs(updated);
    localStorage.setItem('savedJobs', JSON.stringify(updated));
  };

  const removeJob = (jobId: string) => {
    const updated = savedJobs.filter(job => job.id !== jobId);
    setSavedJobs(updated);
    localStorage.setItem('savedJobs', JSON.stringify(updated));
  };

  // Expose save functions globally (backward compatible)
  useEffect(() => {
    (window as any).saveItemToStorage = saveItem;
    (window as any).saveJobToStorage = (jobData: any) => saveItem({ type: 'job', job: jobData.job, analysis: jobData.analysis });
  }, [savedJobs]);

  const savedRoadmaps = savedJobs.filter((item) => item.type === 'pathway');

  if (savedRoadmaps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Roadmaps</CardTitle>
          <CardDescription>Your saved roadmaps will appear here. Explore defaults below.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {defaultRoadmaps.map((roadmap) => (
              <div key={roadmap.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{roadmap.title}</h4>
                  <p className="text-sm text-muted-foreground">{roadmap.category}</p>
                  <p className="text-xs text-muted-foreground mt-1">{roadmap.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onGenerateRoadmap({ job: roadmap, analysis: {} })}
                  >
                    Generate
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => (window as any).saveItemToStorage?.({ type: 'pathway', pathway: roadmap })}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Saved Roadmaps ({savedRoadmaps.length})</CardTitle>
          <CardDescription>Previously saved learning pathways</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {savedRoadmaps.map((savedJob) => (
              <div key={savedJob.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{savedJob.pathway?.title}</h4>
                  <p className="text-sm text-muted-foreground">{savedJob.pathway?.category}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {savedJob.analysis && (
                      <Badge variant="secondary" className="text-xs">
                        {savedJob.analysis.compatibility}% Match
                      </Badge>
                    )}
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
                        <DialogTitle>{savedJob.pathway?.title}</DialogTitle>
                        <DialogDescription>{savedJob.pathway?.description}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => onGenerateRoadmap({ job: savedJob.pathway, analysis: savedJob.analysis || {} })}
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
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Default Roadmaps</CardTitle>
          <CardDescription>Start quickly with curated roadmaps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {defaultRoadmaps.map((roadmap) => (
              <div key={roadmap.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{roadmap.title}</h4>
                  <p className="text-sm text-muted-foreground">{roadmap.category}</p>
                  <p className="text-xs text-muted-foreground mt-1">{roadmap.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onGenerateRoadmap({ job: roadmap, analysis: {} })}
                  >
                    Generate
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => (window as any).saveItemToStorage?.({ type: 'pathway', pathway: roadmap })}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

