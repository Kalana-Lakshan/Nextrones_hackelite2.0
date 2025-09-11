import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { BarChart3, Bookmark, Settings, ListChecks, Sparkles, Rocket, Target, TrendingUp, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppNavProps {
  className?: string;
}

export const AppNav = ({ className }: AppNavProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, href: "/dashboard", color: "text-blue-600", bgColor: "bg-blue-50", hoverColor: "hover:bg-blue-50" },
    { id: "progress", label: "Progress", icon: ListChecks, href: "/todolist", color: "text-green-600", bgColor: "bg-green-50", hoverColor: "hover:bg-green-50" },
    { id: "saved", label: "Explore", icon: Rocket, href: "/saved", color: "text-purple-600", bgColor: "bg-purple-50", hoverColor: "hover:bg-purple-50" },
    { id: "chatbot", label: "AI Chat", icon: MessageCircle, href: "/chatbot", color: "text-indigo-600", bgColor: "bg-indigo-50", hoverColor: "hover:bg-indigo-50" },
    { id: "settings", label: "Settings", icon: Settings, href: "/settings", color: "text-gray-600", bgColor: "bg-gray-50", hoverColor: "hover:bg-gray-50" },
  ];

  const isActive = (href: string) => {
    if (href.startsWith("/dashboard") && location.pathname === "/dashboard") return true;
    return location.pathname === href;
  };

  if (isMobile) {
    return (
      <div className={cn("fixed bottom-0 inset-x-0 z-40 border-t bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 shadow-lg", className)}>
        <nav className="grid grid-cols-5 h-20 px-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.href)}
              className={cn(
                "flex flex-col items-center justify-center text-xs rounded-xl mx-1 my-2 transition-all duration-300 transform hover:scale-105",
                isActive(item.href) 
                  ? `${item.bgColor} ${item.color} shadow-md` 
                  : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg mb-1 transition-all duration-300",
                isActive(item.href) ? `${item.bgColor} ${item.color}` : "hover:bg-gray-100"
              )}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <Sidebar className={cn("border-r bg-gradient-to-b from-white via-gray-50/50 to-white shadow-lg", className)}>
      <SidebarHeader className="p-6 border-b border-gray-200/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Skillora</h2>
            <p className="text-xs text-gray-500">Your journey starts here</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-2">
            {items.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={isActive(item.href)}
                  onClick={() => navigate(item.href)}
                  className={cn(
                    "group relative h-12 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md",
                    isActive(item.href) 
                      ? `${item.bgColor} ${item.color} shadow-md border border-gray-200/50` 
                      : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg transition-all duration-300",
                      isActive(item.href) 
                        ? `${item.bgColor} ${item.color} shadow-sm` 
                        : "group-hover:bg-white group-hover:shadow-sm"
                    )}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  
                  {/* Active indicator */}
                  {isActive(item.href) && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-current rounded-full animate-pulse" />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        
        {/* Decorative elements */}
        <div className="mt-8 p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Quick Stats</h4>
              <p className="text-xs text-gray-500">Track your progress</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Goals Completed</span>
              <span className="text-xs font-semibold text-primary">12/20</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-gradient-to-r from-primary to-accent h-1.5 rounded-full w-3/5 transition-all duration-500"></div>
            </div>
          </div>
        </div>
        
        {/* Floating elements for visual appeal */}
        <div className="absolute top-20 right-4 w-2 h-2 bg-primary/20 rounded-full animate-ping" />
        <div className="absolute top-32 right-6 w-1 h-1 bg-accent/30 rounded-full animate-pulse" />
        <div className="absolute bottom-20 right-3 w-1.5 h-1.5 bg-primary/25 rounded-full animate-bounce" />
      </SidebarContent>
    </Sidebar>
  );
};

export const AppNavInset = SidebarInset;


