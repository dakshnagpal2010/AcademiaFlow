import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useStaffMode } from "@/contexts/staff-mode-context";
import { useSidebar } from "@/contexts/sidebar-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { 
  GraduationCap, 
  Home, 
  BookOpen, 
  CheckSquare, 
  Calendar, 
  Settings,
  Bot,
  Crown,
  ChevronLeft,
  ChevronRight,
  X,
  Shield,
  Clock,
  Sparkles
} from "lucide-react";
import ProfileCustomizationModal from "./profile-customization-modal";
import PremiumUpgradeModal from "./premium-upgrade-modal";
import StaffPinModal from "./staff-pin-modal";
import NotificationsPopover from "./notifications";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, signOut, isSigningOut } = useAuth();
  const { toast } = useToast();
  const { isStaffMode, setIsStaffMode } = useStaffMode();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Schedule", href: "/schedule", icon: Clock },
    { name: "Classes", href: "/classes", icon: BookOpen },
    { name: "Homework", href: "/homework", icon: CheckSquare },
    { name: "Calendar", href: "/calendar", icon: Calendar },
  ];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  const getInitials = (user: any) => {
    if (user?.displayName) {
      return user.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase();
    }
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <>
      {/* Collapsed Sidebar - Only Logo and Arrow (Desktop Only) */}
      {isCollapsed && (
        <div className="fixed left-0 top-0 h-full w-20 bg-dark-secondary/50 backdrop-blur-sm border-r border-gray-700/50 z-40 transition-all duration-300 flex flex-col items-center py-6">
          {/* Logo */}
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg flex items-center justify-center mb-6">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          
          {/* Open Sidebar Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 rounded-full bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 hover:text-primary-300 border border-primary-500/30 flex items-center justify-center"
            onClick={() => setIsCollapsed(false)}
            data-testid="button-toggle-sidebar"
            title="Open Sidebar"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Full Sidebar */}
      <div className={`fixed left-0 top-0 h-full ${isCollapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-16 lg:w-80'} bg-dark-secondary glass-effect border-r border-gray-700 z-40 transition-all duration-300 overflow-y-auto overflow-x-hidden`}>
        <div className="p-3 lg:p-8">
          {/* Logo */}
          <div className="flex items-center justify-center lg:justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent hidden lg:block">
                AcademiaFlow
              </h1>
            </div>
            <div className="hidden lg:block">
              <NotificationsPopover />
            </div>
          </div>
          
          {/* Sidebar Toggle Button - Small & Unique, Under Logo */}
          <div className="flex justify-center lg:justify-start mb-6">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 hover:text-primary-300 border border-primary-500/30 hidden lg:flex items-center justify-center"
              onClick={() => setIsCollapsed(!isCollapsed)}
              data-testid="button-toggle-sidebar"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 mb-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={`flex items-center justify-center lg:justify-start lg:space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                      isActive(item.href)
                        ? "bg-primary-500 text-white"
                        : "text-gray-300 hover:bg-dark-tertiary hover:text-white"
                    }`}
                    data-testid={`nav-${item.name.toLowerCase()}`}
                    title={item.name}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="hidden lg:block">{item.name}</span>
                  </div>
                </Link>
              );
            })}
            
            {/* Daily Planner - ChronoPlan */}
            <Link href="/daily-planner">
              <div
                className={`flex items-center justify-center lg:justify-start lg:space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  isActive("/daily-planner")
                    ? "bg-primary-500 text-white"
                    : "text-gray-300 hover:bg-dark-tertiary hover:text-white"
                }`}
                data-testid="nav-daily-planner"
                title="ChronoPlan"
              >
                <Sparkles className="h-5 w-5" />
                <span className="hidden lg:block">ChronoPlan</span>
              </div>
            </Link>

            {/* AI Assistant - Premium Feature */}
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="w-full flex items-center justify-center lg:justify-start lg:space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-dark-tertiary hover:text-white transition-colors relative premium-glow"
              data-testid="nav-ai-assistant"
              title="AI Assistant"
            >
              <Bot className="h-5 w-5" />
              <span className="hidden lg:inline">AI Assistant</span>
              {!isStaffMode && <Crown className="h-4 w-4 text-purple-400 absolute top-1 right-1 hidden lg:block" />}
            </button>

            {/* Settings */}
            <Link href="/settings">
              <div
                className={`flex items-center justify-center lg:justify-start lg:space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  isActive("/settings")
                    ? "bg-primary-500 text-white"
                    : "text-gray-300 hover:bg-dark-tertiary hover:text-white"
                }`}
                data-testid="nav-settings"
                title="Settings"
              >
                <Settings className="h-5 w-5" />
                <span className="hidden lg:block">Settings</span>
              </div>
            </Link>
          </nav>

          {/* Profile Section */}
          <div className="p-4 lg:p-4 p-2 bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-lg border border-primary-500/30">
            <div className="flex items-center justify-center lg:space-x-3 mb-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user?.profileImageUrl} alt="Profile" />
                <AvatarFallback className="bg-primary-500 text-white">
                  {getInitials(user)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 hidden lg:block">
                <h3 className="font-semibold text-white truncate" data-testid="text-user-name">
                  {user?.displayName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Student"}
                </h3>
                <p className="text-sm text-gray-400 truncate" data-testid="text-user-year">
                  {user?.schoolName || user?.academicYear || "Student"}
                </p>
              </div>
            </div>
            
            <div className="space-y-2 hidden lg:block">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-gradient-to-r from-primary-500 to-purple-500 text-white border-none hover:from-primary-600 hover:to-purple-600 pl-[50px] pr-[50px]"
                  onClick={() => setShowProfileModal(true)}
                  data-testid="button-customize-profile"
                >
                  Customize Profile
                </Button>
                
                <div className="flex space-x-2">
                  {!user?.isPremium && (
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 premium-glow text-xs"
                      onClick={() => setShowUpgradeModal(true)}
                      data-testid="button-upgrade-to-pro"
                    >
                      <Crown className="h-3 w-3 mr-1" />
                      Upgrade
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className={isStaffMode 
                      ? "bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30 text-xs" 
                      : "bg-yellow-500/20 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/30 text-xs"
                    }
                    onClick={() => {
                      if (isStaffMode) {
                        setIsStaffMode(false);
                        toast({
                          title: "Staff Mode Disabled",
                          description: "You have left staff mode.",
                        });
                      } else {
                        setShowStaffModal(true);
                      }
                    }}
                    data-testid="button-staff-pin"
                    title={isStaffMode ? "Exit Staff Mode" : "Staff Access"}
                  >
                    {isStaffMode ? <X className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                  </Button>
                </div>
            </div>
          </div>

          {/* Logout */}
          <div className="mt-6 hidden lg:block">
            <Button
              variant="ghost"
              className="w-full text-gray-400 hover:text-white hover:bg-dark-tertiary"
              onClick={() => signOut()}
              disabled={isSigningOut}
              data-testid="button-logout"
            >
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProfileCustomizationModal 
        open={showProfileModal} 
        onOpenChange={setShowProfileModal}
      />
      <PremiumUpgradeModal 
        open={showUpgradeModal} 
        onOpenChange={setShowUpgradeModal}
      />
      <StaffPinModal 
        open={showStaffModal} 
        onOpenChange={setShowStaffModal}
        onStaffModeActivated={() => {
          setIsStaffMode(true);
          toast({
            title: "Staff Mode Activated",
            description: "You now have staff access.",
          });
        }}
      />
    </>
  );
}
