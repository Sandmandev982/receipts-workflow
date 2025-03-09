
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";
import {
  Home,
  User,
  LogOut,
  ChevronRight,
  Check,
  CalendarClock,
  BarChart,
  Settings,
  Users,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  to,
  icon,
  label,
  active,
  onClick,
}) => {
  const { isMobile } = useMobile();

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={to}
            className={cn(
              "flex items-center px-3 py-2 my-1 rounded-md text-sm font-medium group transition-colors",
              active
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-muted-foreground hover:bg-secondary"
            )}
            onClick={onClick}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                {React.cloneElement(icon as React.ReactElement, {
                  className: "h-5 w-5 mr-3",
                })}
                {!isMobile && <span>{label}</span>}
              </div>
              {!isMobile && active && (
                <ChevronRight className="h-4 w-4 ml-auto" />
              )}
            </div>
          </Link>
        </TooltipTrigger>
        {isMobile && <TooltipContent side="right">{label}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
};

export default function AppSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  const { isMobile } = useMobile();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <aside
      className={cn(
        "bg-card h-full border-r border-border transition-all duration-300 py-5 flex flex-col",
        isMobile ? "w-16 px-2" : "w-64 px-4"
      )}
    >
      <div className="mb-8 flex items-center">
        {!isMobile && <h2 className="text-xl font-bold">Receipts</h2>}
      </div>

      <nav className="space-y-1 flex-1">
        <SidebarLink
          to="/"
          icon={<Home />}
          label="Dashboard"
          active={isActive("/")}
        />
        <SidebarLink
          to="/tasks"
          icon={<Check />}
          label="My Tasks"
          active={location.pathname.includes("/tasks")}
        />
        <SidebarLink
          to="/calendar"
          icon={<CalendarClock />}
          label="Calendar"
          active={location.pathname.includes("/calendar")}
        />
        <SidebarLink
          to="/teams"
          icon={<Users />}
          label="Teams"
          active={location.pathname.includes("/teams")}
        />
        <SidebarLink
          to="/analytics"
          icon={<BarChart />}
          label="Analytics"
          active={location.pathname.includes("/analytics")}
        />
      </nav>

      <div className="pt-4 border-t border-border mt-auto">
        <SidebarLink
          to="/profile"
          icon={<User />}
          label="Profile"
          active={location.pathname.includes("/profile")}
        />
        <SidebarLink
          to="/settings"
          icon={<Settings />}
          label="Settings"
          active={location.pathname.includes("/settings")}
        />
        <SidebarLink
          to="#"
          icon={<LogOut />}
          label="Sign Out"
          onClick={handleSignOut}
        />
      </div>
    </aside>
  );
}
