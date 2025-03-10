
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/useMobile";
import {
  LayoutDashboard,
  Users,
  Calendar as CalendarIcon,
  Settings,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AppSidebarProps {
  onClose?: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ onClose }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMobile();
  const pathname = useLocation().pathname;

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const navLinks = [
    { href: "/", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: "/teams", label: "Teams", icon: <Users className="h-5 w-5" /> },
    { href: "/calendar", label: "Calendar", icon: <CalendarIcon className="h-5 w-5" /> },
    { href: "/messages", label: "Messages", icon: <MessageSquare className="h-5 w-5" /> },
    { href: "/profile", label: "Profile", icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <Sheet open={isMobile} onOpenChange={isMobile ? onClose : undefined}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <LayoutDashboard className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader className="text-left">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Navigate through your Receipts workspace.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <div className="px-4 py-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.user_metadata.avatar_url} />
              <AvatarFallback>{user?.user_metadata.first_name?.[0]}{user?.user_metadata.last_name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="mt-2">
              <p className="font-semibold">{user?.user_metadata.first_name} {user?.user_metadata.last_name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="grid gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center space-x-2 rounded-md p-2 hover:bg-secondary ${pathname === link.href ? 'bg-secondary' : ''}`}
                onClick={onClose}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="absolute bottom-4 w-full">
          <Button variant="outline" className="w-full" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AppSidebar;
