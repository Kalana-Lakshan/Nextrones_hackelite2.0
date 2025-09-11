import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JobDetails } from '@/components/JobDetails';
import { 
  ArrowLeft
} from 'lucide-react';

interface JobExplorationProps {
  onBack: () => void;
  onGenerateRoadmap: (jobData: any) => void;
}

export const JobExploration = ({ onBack, onGenerateRoadmap }: JobExplorationProps) => {
  const [selectedExploration, setSelectedExploration] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showJobAnalysis, setShowJobAnalysis] = useState(false);

  const explorationOptions = [
    {
      id: 'field-wise',
      title: 'Field-wise Exploration',
      description: 'Browse opportunities by industry sectors',
      icon: '🏢'
    },
    {
      id: 'job-wise',
      title: 'Job-wise Exploration',
      description: 'Search specific job roles and positions',
      icon: '💼'
    },
    {
      id: 'higher-studies',
      title: 'Higher Studies Pathways',
      description: 'Explore masters and PhD opportunities',
      icon: '🎓'
    }
  ];

  const mockFields = [
    'Software Development', 'Data Science', 'Cybersecurity', 'AI/Machine Learning', 
    'Web Development', 'Mobile Development', 'DevOps', 'Product Management'
  ];

  const mockJobs = [
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'Tech Solutions Inc.',
      field: 'Software Development',
      salary: '$65,000 - $85,000',
      compatibility: 92
    },
    {
      id: 2,
      title: 'Data Scientist',
      company: 'Analytics Corp',
      field: 'Data Science',
      salary: '$75,000 - $95,000',
      compatibility: 87
    },
    {
      id: 3,
      title: 'Full Stack Developer',
      company: 'Innovation Labs',
      field: 'Software Development',
      salary: '$70,000 - $90,000',
      compatibility: 89
    }
  ];

  const mockJobAnalysis = {
    introduction: "Frontend Developers create user-facing web applications using modern frameworks like React, Vue, and Angular. They bridge the gap between design and technology, ensuring optimal user experiences.",
    future: "The demand for Frontend Developers is expected to grow 13% from 2022-2032, faster than average. With the rise of mobile-first design and progressive web apps, opportunities continue expanding.",
    growthData: [
      { year: '2020', demand: 85, salary: 65 },
      { year: '2021', demand: 88, salary: 68 },
      { year: '2022', demand: 92, salary: 72 },
      { year: '2023', demand: 95, salary: 75 },
      { year: '2024', demand: 98, salary: 78 }
    ],
    salaryInsights: {
      entry: '$50,000 - $65,000',
      mid: '$65,000 - $85,000',
      senior: '$85,000 - $120,000',
      factors: ['Location', 'Company Size', 'Tech Stack', 'Experience']
    },
    compatibility: 92,
    academicSkills: [
      'JavaScript/TypeScript',
      'React/Vue/Angular',
      'HTML5 & CSS3',
      'Responsive Design',
      'Version Control (Git)',
      'Testing Frameworks'
    ],
    softSkills: [
      'Problem Solving',
      'Communication',
      'Attention to Detail',
      'Creativity',
      'Time Management',
      'Teamwork'
    ]
  };

  const handleExplorationSelect = (option: string) => {
    setSelectedExploration(option);
  };

  const handleJobSelect = (job: any) => {
    setSelectedJob(job);
    setShowJobAnalysis(true);
  };

  const handleGenerateRoadmap = () => {
    const jobData = { job: selectedJob, analysis: mockJobAnalysis };
    
    // Save job to storage
    if (typeof (window as any).saveJobToStorage === 'function') {
      (window as any).saveJobToStorage(jobData);
    }
    
    onGenerateRoadmap(jobData);
  };

  if (showJobAnalysis && selectedJob) {
    return (
      <JobDetails 
        job={selectedJob}
        analysis={mockJobAnalysis}
        onBack={() => setShowJobAnalysis(false)}
        onGenerateRoadmap={handleGenerateRoadmap}
      />
    );
  }

  if (selectedExploration) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setSelectedExploration(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">
            {explorationOptions.find(opt => opt.id === selectedExploration)?.title}
          </h2>
        </div>

        {selectedExploration === 'field-wise' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mockFields.map((field) => (
              <Card key={field} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <h3 className="font-medium text-sm">{field}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {(selectedExploration === 'job-wise' || selectedExploration === 'field-wise') && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Available Opportunities</h3>
            <div className="space-y-4">
              {mockJobs.map((job) => (
                <Card key={job.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleJobSelect(job)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h4 className="font-semibold">{job.title}</h4>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                        <p className="text-sm font-medium">{job.salary}</p>
                        <Badge variant="secondary">{job.field}</Badge>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {job.compatibility}% Match
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {selectedExploration === 'higher-studies' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Master's Programs</CardTitle>
                <CardDescription>Advanced degree programs in your field</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">• MS in Computer Science</p>
                  <p className="text-sm">• MS in Data Science</p>
                  <p className="text-sm">• MS in Software Engineering</p>
                  <p className="text-sm">• MS in Cybersecurity</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>PhD Programs</CardTitle>
                <CardDescription>Research-focused doctoral programs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">• PhD in Computer Science</p>
                  <p className="text-sm">• PhD in Artificial Intelligence</p>
                  <p className="text-sm">• PhD in Information Systems</p>
                  <p className="text-sm">• PhD in Human-Computer Interaction</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Career Exploration</h2>
          <p className="text-muted-foreground">Choose how you'd like to explore opportunities</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {explorationOptions.map((option) => (
          <Card 
            key={option.id} 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
            onClick={() => handleExplorationSelect(option.id)}
          >
            <CardHeader className="text-center">
              <div className="text-4xl mb-2">{option.icon}</div>
              <CardTitle>{option.title}</CardTitle>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Explore</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};