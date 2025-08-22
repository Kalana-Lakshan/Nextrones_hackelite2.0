import { useState } from "react";
import { Search, Github, Linkedin, GraduationCap, Target, BookOpen, Briefcase, ArrowRight, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DesktopHeader } from "@/components/DesktopHeader";
import { MobileNavigation } from "@/components/MobileNavigation";
import { TrendingNews } from "@/components/TrendingNews";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const isMobile = useIsMobile();

  const features = [
    {
      icon: Github,
      title: "GitHub Integration",
      description: "Connect your GitHub to analyze your coding skills and project experience"
    },
    {
      icon: Linkedin,
      title: "LinkedIn Profile",
      description: "Import your professional experience and network connections"
    },
    {
      icon: GraduationCap,
      title: "Campus Curriculum",
      description: "Link your academic background and current coursework"
    },
    {
      icon: Target,
      title: "AI Career Roadmap",
      description: "Get personalized learning paths based on your goals"
    }
  ];

  const platforms = [
    { name: "Udemy", courses: "150K+ courses", logo: "🎓" },
    { name: "Coursera", courses: "5K+ courses", logo: "📚" },
    { name: "edX", courses: "3K+ courses", logo: "🏛️" },
    { name: "Khan Academy", courses: "Free courses", logo: "🧠" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <DesktopHeader />
      
      <main className={`${isMobile ? 'pb-20' : ''}`}>
        {/* Hero Section */}
        <section className="container mx-auto px-4 md:px-6 py-8 md:py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Shape Your Career with
              <span className="text-primary block md:inline md:ml-4">AI-Powered Guidance</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect your LinkedIn, GitHub, and academic background to receive personalized career roadmaps and course recommendations
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto mb-8">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search career paths, skills, or courses..." 
                className="pl-10 py-3"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Welcome Message Card */}
        <section className="container mx-auto px-4 md:px-6 mb-8">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl md:text-3xl">Welcome to CareerPath</CardTitle>
              <CardDescription className="text-base md:text-lg">
                Your AI-powered career assistant is ready to help you achieve your professional goals
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        {/* Trending News */}
        <TrendingNews />

        {/* Features Section */}
        <section className="container mx-auto px-4 md:px-6 py-8 md:py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connect your professional profiles and let our AI create a personalized roadmap for your career success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Learning Platforms */}
        <section className="bg-secondary/50 py-8 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Recommended Learning Platforms
              </h2>
              <p className="text-muted-foreground">
                Get course recommendations from top educational platforms
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {platforms.map((platform, index) => (
                <Card key={index} className="text-center hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="text-3xl mb-2">{platform.logo}</div>
                    <CardTitle className="text-lg">{platform.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{platform.courses}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 md:px-6 py-8 md:py-16">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl md:text-3xl mb-4">
                Ready to Transform Your Career?
              </CardTitle>
              <CardDescription className="text-primary-foreground/80 text-base md:text-lg mb-6">
                Join thousands of professionals who are already using AI to accelerate their career growth
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" size="lg" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Create Free Account
                </Button>
                <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                  Learn More
                </Button>
              </div>
            </CardHeader>
          </Card>
        </section>
      </main>

      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
