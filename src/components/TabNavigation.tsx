import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DesktopHeader } from '@/components/DesktopHeader';
import { MobileNavigation } from '@/components/MobileNavigation';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import TodoList from '@/pages/TodoList';
import Settings from '@/pages/Settings';
import SavedRoadmaps from '@/pages/SavedRoadmaps';
import ChatbotPage from '@/pages/Chatbot';
import { useIsMobile } from '@/hooks/use-mobile';

export const TabNavigation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('home');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // If user is not logged in, show the main page
  if (!user) {
    return (
      <>
        <DesktopHeader />
        <Index />
      </>
    );
  }

  // Show onboarding for first-time users
  // In a real app, you'd check if the user has completed onboarding
  const shouldShowOnboarding = false; // Set this based on user's onboarding status

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (!isMobile) {
      // For desktop, navigate to the route
      if (tab === 'home') navigate('/');
      else navigate(`/${tab}`);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Index />;
      case 'dashboard':
        return <Dashboard />;
      case 'todolist':
        return <TodoList />;
      case 'saved':
        return <SavedRoadmaps />;
      case 'chatbot':
        return <ChatbotPage />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DesktopHeader />
      
      {isMobile ? (
        <div className="pb-20">
          {renderContent()}
          <MobileNavigation 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
          />
        </div>
      ) : (
        renderContent()
      )}

      <OnboardingFlow 
        isOpen={showOnboarding && shouldShowOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />
    </div>
  );
};