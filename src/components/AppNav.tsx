import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { BarChart3, Bookmark, Settings, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppNavProps {
  className?: string;
}

export const AppNav = ({ className }: AppNavProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, href: "/dashboard" },
    { id: "progress", label: "Progress", icon: ListChecks, href: "/todolist" },
    { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
    { id: "saved", label: "Saved Roadmaps", icon: Bookmark, href: "/saved" },
  ];

  const isActive = (href: string) => {
    if (href.startsWith("/dashboard") && location.pathname === "/dashboard") return true;
    return location.pathname === href;
  };

  if (isMobile) {
    return (
      <div className={cn("fixed bottom-0 inset-x-0 z-40 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60", className)}>
        <nav className="grid grid-cols-4 h-16">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.href)}
              className={cn("flex flex-col items-center justify-center text-xs", isActive(item.href) ? "text-primary" : "text-muted-foreground")}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <Sidebar className={cn("border-r", className)}>
      <SidebarHeader>
        <SidebarGroupLabel className="text-sm">Navigation</SidebarGroupLabel>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={isActive(item.href)}
                  onClick={() => navigate(item.href)}
                  className=""
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export const AppNavInset = SidebarInset;


