import { Home, MapIcon, Settings, BarChart3 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileNavigation = ({ activeTab, onTabChange }: MobileNavigationProps) => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "roadmap", label: "Roadmap", icon: MapIcon },
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