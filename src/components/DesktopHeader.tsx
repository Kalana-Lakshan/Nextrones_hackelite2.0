import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, LogIn } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";

export const DesktopHeader = () => {
  const isMobile = useIsMobile();

  if (isMobile) return null;

  return (
    <header className="bg-card border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-2xl font-bold text-primary">CareerPath</div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-foreground hover:text-primary transition-colors">Home</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">About</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Features</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</a>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" className="gap-2" asChild>
              <Link to="/login">
                <LogIn className="h-4 w-4" />
                Log In
              </Link>
            </Button>
            <Button className="gap-2" asChild>
              <Link to="/signup">
                <UserPlus className="h-4 w-4" />
                Sign Up
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};