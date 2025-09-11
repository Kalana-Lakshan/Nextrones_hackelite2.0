import { useEffect, useState } from "react";
import { Search, Github, Linkedin, GraduationCap, Target, BookOpen, Briefcase, ArrowRight, UserPlus, Play, Star, Users, TrendingUp, CheckCircle, Zap, Lightbulb, Award, Clock, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DesktopHeader } from "@/components/DesktopHeader";
import { MobileNavigation } from "@/components/MobileNavigation";
import { TrendingNews } from "@/components/TrendingNews";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect logged-in users trying to access homepage to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: Github,
      title: "GitHub Skill Analysis",
      description: "Connect your GitHub to get detailed analysis of your coding skills and project expertise",
      benefits: ["Code quality insights", "Skill gap analysis", "Project portfolio review"],
      link: "https://github.com"
    },
    {
      icon: Linkedin,
      title: "Professional Skill Mapping",
      description: "Import your LinkedIn profile to map your professional skills and experience",
      benefits: ["Skill validation", "Industry benchmarking", "Career progression insights"],
      link: "https://linkedin.com"
    },
    {
      icon: GraduationCap,
      title: "Learning Platform Integration",
      description: "Connect your learning platforms to track progress and get recommendations",
      benefits: ["Progress tracking", "Course recommendations", "Learning analytics"],
      link: "#"
    },
    {
      icon: Target,
      title: "AI Learning Paths",
      description: "Get personalized skill development roadmaps powered by AI",
      benefits: ["Customized learning", "Skill progression", "Achievement tracking"],
      link: "#"
    }
  ];

  const platforms = [
    { 
      name: "Udemy", 
      courses: "150K+ courses", 
      logo: "🎓",
      description: "Learn from industry experts",
      link: "https://udemy.com",
      popular: ["Web Development", "Data Science", "Design"]
    },
    { 
      name: "Coursera", 
      courses: "5K+ courses", 
      logo: "📚",
      description: "University-level education",
      link: "https://coursera.org",
      popular: ["Computer Science", "Business", "Healthcare"]
    },
    { 
      name: "edX", 
      courses: "3K+ courses", 
      logo: "🏛️",
      description: "Top university courses",
      link: "https://edx.org",
      popular: ["Engineering", "Mathematics", "Languages"]
    },
    { 
      name: "Khan Academy", 
      courses: "Free courses", 
      logo: "🧠",
      description: "Free world-class education",
      link: "https://khanacademy.org",
      popular: ["Math", "Science", "Computer Programming"]
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Full Stack Developer",
      company: "Google",
      avatar: "👩‍💻",
      quote: "Skillora helped me master React and Node.js in just 4 months! The skill tracking is incredible.",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Data Scientist",
      company: "Microsoft",
      avatar: "👨‍💼",
      quote: "The AI skill assessment was spot-on. I identified my weak areas and improved them systematically.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "UX Designer",
      company: "Apple",
      avatar: "👩‍🎨",
      quote: "Skillora's learning paths are perfectly tailored to my skill level and career goals.",
      rating: 5
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Connect Your Accounts",
      description: "Link your GitHub, LinkedIn, and learning platforms to Skillora",
      icon: UserPlus,
      action: "Get Started"
    },
    {
      number: "02",
      title: "Assess Your Skills",
      description: "Get AI-powered analysis of your current skill level and gaps",
      icon: Target,
      action: "Start Assessment"
    },
    {
      number: "03",
      title: "Get Learning Path",
      description: "Receive personalized skill development roadmap with courses",
      icon: BookOpen,
      action: "View Learning Path"
    },
    {
      number: "04",
      title: "Track & Improve",
      description: "Monitor your skill progress and get continuous recommendations",
      icon: TrendingUp,
      action: "Track Progress"
    }
  ];

  const stats = [
    { number: "75K+", label: "Active Learners", icon: Users },
    { number: "98%", label: "Skill Improvement", icon: Award },
    { number: "3 months", label: "Avg. Skill Mastery", icon: Clock },
    { number: "200+", label: "Skills Tracked", icon: Globe }
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to dashboard with search query
      navigate('/dashboard');
    }
  };

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleWatchDemo = () => {
    // Open demo video from University of Moratuwa
    // Note: This requires UoM account credentials
    const confirmed = window.confirm(
      'This will open the demo video from University of Moratuwa. You will need UoM account credentials to access it. Continue?'
    );
    if (confirmed) {
      window.open('https://dms.uom.lk/s/iDJxWPC4yfkKwEc', '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DesktopHeader />
      
      <main className={`${isMobile ? 'pb-20' : ''}`}>
        {/* Hero Section */}
        <section className="container mx-auto px-4 md:px-6 py-8 md:py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-6">
              <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm">
                <Zap className="h-4 w-4 mr-2" />
                AI-Powered Skill Development
              </Badge>
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Master Skills with
              <span className="text-primary block md:inline md:ml-4">Skillora AI</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect your GitHub, LinkedIn, and learning platforms to get personalized skill assessments and intelligent learning paths. 
              <span className="font-semibold text-primary"> Join 75,000+ learners</span> who are advancing their skills with Skillora.
            </p>
            
            {/* Search Bar - Enhanced */}
            <div className="relative max-w-md mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur-sm"></div>
              <div className="relative bg-card rounded-lg border-2 border-primary/30 shadow-lg">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5" />
                <Input 
                  placeholder="Search skills, courses, or learning paths..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 py-4 bg-transparent border-0 text-base font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" className="gap-2" onClick={handleGetStarted}>
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={handleWatchDemo} className="gap-2">
                <Play className="h-4 w-4" />
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                <span>Setup in 2 minutes</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 md:px-6 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-2">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-primary">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works - Enhanced */}
        <section className="container mx-auto px-4 md:px-6 py-8 md:py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              How Skillora Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Master new skills with AI-powered guidance in just 4 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {steps.map((step, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-sm font-bold text-primary mb-2">{step.number}</div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">{step.description}</CardDescription>
                  <Button variant="outline" size="sm" className="w-full">
                    {step.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Section - Enhanced */}
        <section className="bg-secondary/50 py-8 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Powerful Features
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to accelerate your career growth
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Key Benefits:</h4>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                      <div className="pt-4">
                        <Button variant="outline" size="sm" onClick={() => window.open(feature.link, '_blank')}>
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="container mx-auto px-4 md:px-6 py-8 md:py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Success Stories
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See how Skillora has helped learners master new skills and advance their careers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-sm text-muted-foreground mb-4 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{testimonial.avatar}</div>
                    <div>
                      <div className="font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Learning Platforms - Enhanced */}
        <section className="bg-secondary/50 py-8 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Integrated Learning Platforms
              </h2>
              <p className="text-muted-foreground">
                Skillora connects with top educational platforms for seamless learning
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {platforms.map((platform, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader className="pb-2">
                    <div className="text-4xl mb-3">{platform.logo}</div>
                    <CardTitle className="text-lg">{platform.name}</CardTitle>
                    <CardDescription>{platform.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{platform.courses}</p>
                    <div className="space-y-2 mb-4">
                      <p className="text-xs font-semibold text-primary">Popular Courses:</p>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {platform.popular.map((course, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {course}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => window.open(platform.link, '_blank')}
                    >
                      Visit Platform
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trending News - Enhanced */}
        <section className="container mx-auto px-4 md:px-6 mb-8">
          <div className="bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5 rounded-2xl p-1">
            <div className="bg-card rounded-xl border border-primary/20 shadow-xl">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Skill Development Insights</h3>
                </div>
                <TrendingNews />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Enhanced */}
        <section className="container mx-auto px-4 md:px-6 py-8 md:py-16">
          <Card className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl md:text-3xl mb-4">
                Ready to Master New Skills?
              </CardTitle>
              <CardDescription className="text-primary-foreground/80 text-base md:text-lg mb-6">
                Join thousands of learners who are using Skillora to accelerate their skill development. 
                <span className="font-semibold"> Start learning today!</span>
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="gap-2"
                  onClick={handleGetStarted}
                >
                  <UserPlus className="h-4 w-4" />
                  Start Learning Free
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              </div>
              <p className="text-sm text-primary-foreground/70 mt-4">
                No credit card required • Free forever plan • Setup in 2 minutes
              </p>
            </CardHeader>
          </Card>
        </section>
      </main>

      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
