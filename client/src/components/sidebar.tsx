import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
  Crown
} from "lucide-react";
import ProfileCustomizationModal from "./profile-customization-modal";
import PremiumUpgradeModal from "./premium-upgrade-modal";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, signOut, isSigningOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Classes", href: "/classes", icon: BookOpen },
    { name: "Homework", href: "/homework", icon: CheckSquare },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Settings", href: "/settings", icon: Settings },
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
      <div className="fixed left-0 top-0 h-full w-64 bg-dark-secondary glass-effect border-r border-gray-700 z-40">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent">
              StudyFlow
            </h1>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 mb-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? "bg-primary-500 text-white"
                        : "text-gray-300 hover:bg-dark-tertiary hover:text-white"
                    }`}
                    data-testid={`nav-${item.name.toLowerCase()}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </a>
                </Link>
              );
            })}
            
            {/* AI Assistant - Premium Feature */}
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-dark-tertiary hover:text-white transition-colors relative premium-glow"
              data-testid="nav-ai-assistant"
            >
              <Bot className="h-5 w-5" />
              <span>AI Assistant</span>
              <Crown className="h-4 w-4 text-purple-400 absolute top-1 right-1" />
            </button>
          </nav>

          {/* Theme Toggle */}
          <div className="mb-8 p-4 bg-dark-tertiary rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Dark Theme</span>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                data-testid="switch-theme-toggle"
              />
            </div>
          </div>

          {/* Profile Section */}
          <div className="p-4 bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-lg border border-primary-500/30">
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user?.profileImageUrl} alt="Profile" />
                <AvatarFallback className="bg-primary-500 text-white">
                  {getInitials(user)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate" data-testid="text-user-name">
                  {user?.displayName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Student"}
                </h3>
                <p className="text-sm text-gray-400 truncate" data-testid="text-user-year">
                  {user?.academicYear || "Student"}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-gradient-to-r from-primary-500 to-purple-500 text-white border-none hover:from-primary-600 hover:to-purple-600"
                onClick={() => setShowProfileModal(true)}
                data-testid="button-customize-profile"
              >
                Customize Profile
              </Button>
              
              {!user?.isPremium && (
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 premium-glow"
                  onClick={() => setShowUpgradeModal(true)}
                  data-testid="button-upgrade-to-pro"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </Button>
              )}
            </div>
          </div>

          {/* Logout */}
          <div className="mt-6">
            <Button
              variant="ghost"
              className="w-full text-gray-400 hover:text-white hover:bg-dark-tertiary"
              onClick={signOut}
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
    </>
  );
}
