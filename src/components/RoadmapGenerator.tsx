import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedCalendar } from '@/components/ui/enhanced-calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format, addMonths, addWeeks } from 'date-fns';
import { FreeTimeScheduler } from './FreeTimeScheduler';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  CheckCircle, 
  Clock,
  BookOpen,
  Target,
  ListTodo,
  ArrowRight
} from 'lucide-react';

interface RoadmapGeneratorProps {
  jobData: any;
  onBack: () => void;
  onGenerateTodoList: (roadmapData: any) => void;
}

export const RoadmapGenerator = ({ jobData, onBack, onGenerateTodoList }: RoadmapGeneratorProps) => {
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [graduationDate, setGraduationDate] = useState<Date>(new Date('2025-06-01'));
  const [freeTimeSchedule, setFreeTimeSchedule] = useState<any[]>([]);

  const generateRoadmapItems = () => {
    const now = new Date();
    const months = Math.floor((graduationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    const roadmapItems = [
      {
        id: 1,
        title: 'Master JavaScript Fundamentals',
        description: 'Complete advanced JavaScript concepts including async/await, closures, and prototypes',
        category: 'Academic Skills',
        deadline: format(addWeeks(now, 6), 'yyyy-MM-dd'),
        estimatedHours: 40,
        platform: 'Free Resources',
        skills: ['JavaScript', 'ES6+', 'Async Programming'],
        resources: [
          { type: 'course', title: 'JavaScript Fundamentals', url: 'https://javascript.info/' },
          { type: 'video', title: 'Modern JavaScript Tutorial', url: 'https://www.youtube.com/watch?v=hdI2bqOjy3c' }
        ]
      },
      {
        id: 2,
        title: 'Learn React Framework',
        description: 'Build proficiency in React including hooks, context, and state management',
        category: 'Academic Skills',
        deadline: format(addMonths(now, 2), 'yyyy-MM-dd'),
        estimatedHours: 60,
        platform: 'Coursera',
        skills: ['React', 'JSX', 'State Management'],
        resources: [
          { type: 'course', title: 'React - The Complete Guide', url: 'https://www.coursera.org/learn/react' },
          { type: 'documentation', title: 'React Official Docs', url: 'https://react.dev/' }
        ]
      },
      {
        id: 3,
        title: 'Build Portfolio Projects',
        description: 'Create 3-4 impressive projects showcasing your frontend development skills',
        category: 'Practical Experience',
        deadline: format(addMonths(now, 4), 'yyyy-MM-dd'),
        estimatedHours: 80,
        platform: 'GitHub',
        skills: ['Project Management', 'Version Control', 'Deployment'],
        resources: [
          { type: 'guide', title: 'GitHub Project Ideas', url: 'https://github.com/karan/Projects' },
          { type: 'tutorial', title: 'Git & GitHub Tutorial', url: 'https://www.youtube.com/watch?v=RGOj5yH7evk' }
        ]
      },
      {
        id: 4,
        title: 'Improve Communication Skills',
        description: 'Enhance presentation and technical communication abilities',
        category: 'Soft Skills',
        deadline: format(addMonths(now, 3), 'yyyy-MM-dd'),
        estimatedHours: 20,
        platform: 'LinkedIn Learning',
        skills: ['Communication', 'Presentation', 'Technical Writing'],
        resources: [
          { type: 'course', title: 'Effective Communication', url: 'https://www.linkedin.com/learning/effective-communication' },
          { type: 'book', title: 'Technical Writing Guide', url: 'https://developers.google.com/tech-writing' }
        ]
      },
      {
        id: 5,
        title: 'Complete Frontend Certification',
        description: 'Obtain a recognized certification in frontend development',
        category: 'Certification',
        deadline: format(addMonths(now, 5), 'yyyy-MM-dd'),
        estimatedHours: 30,
        platform: 'Coursera',
        skills: ['HTML5', 'CSS3', 'JavaScript', 'React'],
        resources: [
          { type: 'certification', title: 'Frontend Development Certificate', url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer' },
          { type: 'practice', title: 'Frontend Mentor Challenges', url: 'https://www.frontendmentor.io/' }
        ]
      }
    ];

    return roadmapItems.filter((_, index) => index < Math.min(months, 6));
  };

  const roadmapItems = generateRoadmapItems();

  const handleGenerateRoadmap = () => {
    setShowRoadmap(true);
  };

  const handleCreateTodoList = () => {
    setShowScheduler(true);
  };

  const confirmTodoGeneration = () => {
    onGenerateTodoList({
      job: jobData.job,
      roadmapItems: roadmapItems,
      graduationDate: graduationDate,
      freeTimeSchedule: freeTimeSchedule
    });
    setShowConfirmDialog(false);
  };

  const handleScheduleSet = (schedule: any[]) => {
    setFreeTimeSchedule(schedule);
    setShowConfirmDialog(true);
  };

  const getTotalEstimatedHours = () => {
    return roadmapItems.reduce((total, item) => total + item.estimatedHours, 0);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Academic Skills': return 'bg-blue-100 text-blue-800';
      case 'Soft Skills': return 'bg-green-100 text-green-800';
      case 'Practical Experience': return 'bg-purple-100 text-purple-800';
      case 'Certification': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (showRoadmap) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setShowRoadmap(false)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Your Learning Roadmap</h2>
            <p className="text-muted-foreground">
              Personalized plan for {jobData.job.title} at {jobData.job.company}
            </p>
          </div>
        </div>

        {/* Roadmap Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{roadmapItems.length}</div>
              <div className="text-sm text-muted-foreground">Learning Modules</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{getTotalEstimatedHours()}</div>
              <div className="text-sm text-muted-foreground">Total Hours</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{format(graduationDate, 'MMM yyyy')}</div>
              <div className="text-sm text-muted-foreground">Target Date</div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Learning Timeline
            </CardTitle>
            <CardDescription>Complete these milestones to reach your career goal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {roadmapItems.map((item, index) => (
                <div key={item.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    {index < roadmapItems.length - 1 && (
                      <div className="w-0.5 h-16 bg-border mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{item.title}</h4>
                      <Badge className={getCategoryColor(item.category)}>
                        {item.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          Complete by {format(new Date(item.deadline), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.estimatedHours} hours
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {item.platform}
                        </Badge>
                      </div>
                      {item.resources && (
                        <div className="flex flex-wrap gap-2">
                          {item.resources.map((resource: any, idx: number) => (
                            <a
                              key={idx}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                            >
                              {resource.type}: {resource.title}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Ready to Get Started?</CardTitle>
            <CardDescription>
              Convert this roadmap into actionable To-Do items with automatic progress tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreateTodoList} className="w-full gap-2">
              <ListTodo className="h-4 w-4" />
              Generate To-Do List
            </Button>
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate To-Do List</DialogTitle>
              <DialogDescription>
                This will create a detailed To-Do list based on your roadmap. Tasks will be automatically tracked based on your connected accounts (LinkedIn, GitHub, Coursera).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">What will be created:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {roadmapItems.length} main learning modules</li>
                  <li>• Detailed sub-tasks with deadlines</li>
                  <li>• Progress tracking integration</li>
                  <li>• Automatic updates from connected accounts</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowConfirmDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={confirmTodoGeneration} className="flex-1 gap-2">
                  Create To-Do List
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Free Time Scheduler */}
        <FreeTimeScheduler
          isOpen={showScheduler}
          onClose={() => setShowScheduler(false)}
          onScheduleSet={handleScheduleSet}
        />
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
          <h2 className="text-2xl font-bold">Generate Learning Roadmap</h2>
          <p className="text-muted-foreground">
            Create a personalized timeline for {jobData.job.title}
          </p>
        </div>
      </div>

      {/* Job Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Target Position</span>
            <Badge variant="secondary">{jobData.analysis.compatibility}% Match</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h3 className="font-semibold">{jobData.job.title}</h3>
            <p className="text-muted-foreground">{jobData.job.company}</p>
            <p className="text-sm">{jobData.job.salary}</p>
          </div>
        </CardContent>
      </Card>

      {/* Graduation Date Setting */}
      <Card>
        <CardHeader>
          <CardTitle>Set Your Target Date</CardTitle>
          <CardDescription>
            When do you want to be ready for this position? This will help us create appropriate deadlines.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Target Date:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {format(graduationDate, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <EnhancedCalendar
                  mode="single"
                  selected={graduationDate}
                  onSelect={(date) => date && setGraduationDate(date)}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Roadmap Preview</h4>
            <p className="text-sm text-blue-600">
              Based on your target date, we'll create a {Math.floor((graduationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30))}-month learning plan with specific deadlines for each skill area.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Skills That Will Be Covered */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Academic Skills Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {jobData.analysis.academicSkills.slice(0, 4).map((skill: string) => (
                <div key={skill} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{skill}</span>
                </div>
              ))}
              {jobData.analysis.academicSkills.length > 4 && (
                <p className="text-xs text-muted-foreground">
                  +{jobData.analysis.academicSkills.length - 4} more skills
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Soft Skills Development</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {jobData.analysis.softSkills.slice(0, 4).map((skill: string) => (
                <div key={skill} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{skill}</span>
                </div>
              ))}
              {jobData.analysis.softSkills.length > 4 && (
                <p className="text-xs text-muted-foreground">
                  +{jobData.analysis.softSkills.length - 4} more skills
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generate Button */}
      <Card>
        <CardContent className="p-6">
          <Button onClick={handleGenerateRoadmap} className="w-full gap-2" size="lg">
            Generate Personalized Roadmap
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};