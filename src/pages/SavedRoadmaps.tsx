import { SidebarProvider } from '@/components/ui/sidebar';
import { AppNav, AppNavInset } from '@/components/AppNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { JobStorage } from '@/components/JobStorage';

export default function SavedRoadmaps() {
  return (
    <SidebarProvider>
      <AppNav />
      <AppNavInset className="bg-gradient-subtle">
        <div className="container mx-auto px-6 py-8 max-w-[1400px]">
          <div className="max-w-6xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Saved Roadmaps</h1>
              <p className="text-muted-foreground">Your saved and default learning pathways</p>
            </div>

            <JobStorage onSelectJob={() => {}} onGenerateRoadmap={() => {}} />
          </div>
        </div>
      </AppNavInset>
    </SidebarProvider>
  );
}


