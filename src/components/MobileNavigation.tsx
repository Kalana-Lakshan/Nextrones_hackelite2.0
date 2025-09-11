import { Home, MapIcon, Settings, BarChart3, ListTodo, Bookmark, MessageCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileNavigation = ({ activeTab, onTabChange }: MobileNavigationProps) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // Only show mobile navigation for logged-in users
  if (!isMobile || !user) return null;

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "todolist", label: "To-Do List", icon: ListTodo },
    { id: "saved", label: "Explore", icon: Bookmark },
    { id: "chatbot", label: "AI Chat", icon: MessageCircle },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="mobile-nav">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`mobile-nav-item ${activeTab === item.id ? "active" : ""}`}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};