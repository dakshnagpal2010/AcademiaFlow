import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { useStaffMode } from "@/contexts/staff-mode-context";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Settings as SettingsIcon,
  User,
  Palette,
  Bell,
  Shield,
  Crown,
  Upload,
  LogOut,
  Trash2,
  Save
} from "lucide-react";
import PremiumUpgradeModal from "@/components/premium-upgrade-modal";

export default function Settings() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { isStaffMode } = useStaffMode();
  const queryClient = useQueryClient();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [profileData, setProfileData] = useState({
    displayName: "",
    bio: "",
    academicYear: "",
    major: "",
  });

  const [preferences, setPreferences] = useState({
    theme: "default",
    animationsEnabled: true,
    compactMode: false,
    notifications: {
      assignments: true,
      deadlines: true,
      achievements: true,
      weekly_summary: true,
    },
  });

  // Sync theme preference with theme provider
  useEffect(() => {
    setPreferences(prev => ({
      ...prev,
      theme: theme === "dark" ? "dark" : "light"
    }));
  }, [theme]);

  // Initialize form data when user data loads
  useEffect(() => {
    if (user) {
      setProfileData({
        displayName: (user as any).displayName || "",
        bio: (user as any).bio || "",
        academicYear: (user as any).academicYear || "",
        major: (user as any).major || "",
      });
      setPreferences({
        theme: theme === "dark" ? "dark" : "light",
        animationsEnabled: (user as any).animationsEnabled ?? true,
        compactMode: (user as any).compactMode ?? false,
        notifications: {
          assignments: true,
          deadlines: true,
          achievements: true,
          weekly_summary: true,
        },
      });
    }
  }, [user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PATCH", "/api/user/profile", {
        ...data,
        theme: preferences.theme,
        animationsEnabled: preferences.animationsEnabled,
        compactMode: preferences.compactMode,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Settings updated successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleSavePreferences = () => {
    updateProfileMutation.mutate({});
  };

  const getInitials = (user: any) => {
    if (profileData.displayName) {
      return profileData.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase();
    }
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const themeOptions = [
    { value: "default", name: "Default", gradient: "from-primary-500 to-purple-500" },
    { value: "nature", name: "Nature", gradient: "from-green-500 to-teal-500" },
    { value: "sunset", name: "Sunset", gradient: "from-orange-500 to-pink-500" },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-primary">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary text-white">
      {/* Header */}
      <header className="bg-dark-secondary/80 glass-effect border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-settings-title">Settings</h1>
            <p className="text-gray-400 mt-1">Manage your account and preferences</p>
          </div>
          {!(user as any)?.isPremium && !isStaffMode && (
            <Button
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white premium-glow"
              onClick={() => setShowUpgradeModal(true)}
              data-testid="button-upgrade-settings"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Pro
            </Button>
          )}
          {isStaffMode && (
            <Button
              variant="outline"
              className="bg-transparent border-2 border-transparent hover:bg-yellow-500/10 relative"
              style={{
                borderImage: "linear-gradient(to right, rgb(250, 204, 21), rgb(202, 138, 4)) 1",
              }}
              onClick={() => setShowUpgradeModal(true)}
              data-testid="button-upgrade-settings"
            >
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent font-semibold">
                AF PRO
              </span>
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* Profile Section */}
          <Card className="bg-dark-secondary border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <User className="h-5 w-5 mr-2" />
                Profile Information
              </CardTitle>
              <CardDescription className="text-gray-400">
                Update your personal information and academic details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div>
                <Label className="text-white mb-2 block">Profile Picture</Label>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={(user as any)?.profileImageUrl} alt="Profile" />
                    <AvatarFallback className="bg-primary-500 text-white text-xl">
                      {getInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-dark-tertiary"
                      data-testid="button-upload-photo"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                    <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="displayName" className="text-white">Display Name</Label>
                  <Input
                    id="displayName"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                    className="bg-dark-tertiary border-gray-600 text-white mt-1"
                    data-testid="input-display-name"
                  />
                </div>

                <div>
                  <Label htmlFor="major" className="text-white">Major</Label>
                  <Input
                    id="major"
                    value={profileData.major}
                    onChange={(e) => setProfileData({ ...profileData, major: e.target.value })}
                    className="bg-dark-tertiary border-gray-600 text-white mt-1"
                    data-testid="input-major"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="academicYear" className="text-white">Academic Year</Label>
                <Select
                  value={profileData.academicYear}
                  onValueChange={(value) => setProfileData({ ...profileData, academicYear: value })}
                >
                  <SelectTrigger className="bg-dark-tertiary border-gray-600 text-white mt-1" data-testid="select-academic-year">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-tertiary border-gray-600">
                    <SelectItem value="freshman">Freshman</SelectItem>
                    <SelectItem value="sophomore">Sophomore</SelectItem>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="graduate">Graduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bio" className="text-white">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  className="bg-dark-tertiary border-gray-600 text-white mt-1"
                  rows={3}
                  data-testid="textarea-bio"
                />
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={updateProfileMutation.isPending}
                className="bg-primary-500 hover:bg-primary-600 text-white"
                data-testid="button-save-profile"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>

          {/* Appearance Section */}
          <Card className="bg-dark-secondary border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Palette className="h-5 w-5 mr-2" />
                Appearance
              </CardTitle>
              <CardDescription className="text-gray-400">
                Customize the look and feel of your workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Selection */}
              <div>
                <Label className="text-white mb-3 block">App Theme</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {/* Original Theme (Active) */}
                  <button
                    className="p-3 rounded-lg border border-primary-500 bg-primary-500/20 transition-all relative"
                    data-testid="theme-original"
                  >
                    <div className="w-full h-12 rounded bg-gradient-to-r from-gray-800 to-gray-900 mb-2"></div>
                    <p className="text-xs text-white font-medium">Original</p>
                    <p className="text-xs text-gray-400">Current</p>
                  </button>
                  
                  {/* Light Theme (Coming Soon) */}
                  <button
                    disabled
                    className="p-3 rounded-lg border border-gray-600 bg-dark-tertiary/50 opacity-60 cursor-not-allowed transition-all relative"
                    data-testid="theme-light"
                  >
                    <div className="w-full h-12 rounded bg-gradient-to-r from-white to-gray-100 mb-2"></div>
                    <p className="text-xs text-gray-300 font-medium">Light</p>
                    <Badge className="absolute top-1 right-1 text-[10px] px-1 py-0 h-4 bg-yellow-500/80">Soon</Badge>
                  </button>

                  {/* Forest Theme (Coming Soon) */}
                  <button
                    disabled
                    className="p-3 rounded-lg border border-gray-600 bg-dark-tertiary/50 opacity-60 cursor-not-allowed transition-all relative"
                    data-testid="theme-forest"
                  >
                    <div className="w-full h-12 rounded bg-gradient-to-r from-green-700 to-emerald-900 mb-2"></div>
                    <p className="text-xs text-gray-300 font-medium">Forest</p>
                    <Badge className="absolute top-1 right-1 text-[10px] px-1 py-0 h-4 bg-yellow-500/80">Soon</Badge>
                  </button>

                  {/* Sport Mode (Coming Soon) */}
                  <button
                    disabled
                    className="p-3 rounded-lg border border-gray-600 bg-dark-tertiary/50 opacity-60 cursor-not-allowed transition-all relative"
                    data-testid="theme-sport"
                  >
                    <div className="w-full h-12 rounded bg-gradient-to-r from-red-600 to-orange-500 mb-2"></div>
                    <p className="text-xs text-gray-300 font-medium">Sport</p>
                    <Badge className="absolute top-1 right-1 text-[10px] px-1 py-0 h-4 bg-yellow-500/80">Soon</Badge>
                  </button>

                  {/* Ocean Theme (Coming Soon) */}
                  <button
                    disabled
                    className="p-3 rounded-lg border border-gray-600 bg-dark-tertiary/50 opacity-60 cursor-not-allowed transition-all relative"
                    data-testid="theme-ocean"
                  >
                    <div className="w-full h-12 rounded bg-gradient-to-r from-blue-600 to-cyan-500 mb-2"></div>
                    <p className="text-xs text-gray-300 font-medium">Ocean</p>
                    <Badge className="absolute top-1 right-1 text-[10px] px-1 py-0 h-4 bg-yellow-500/80">Soon</Badge>
                  </button>

                  {/* Sunset Theme (Coming Soon) */}
                  <button
                    disabled
                    className="p-3 rounded-lg border border-gray-600 bg-dark-tertiary/50 opacity-60 cursor-not-allowed transition-all relative"
                    data-testid="theme-sunset"
                  >
                    <div className="w-full h-12 rounded bg-gradient-to-r from-orange-500 to-pink-500 mb-2"></div>
                    <p className="text-xs text-gray-300 font-medium">Sunset</p>
                    <Badge className="absolute top-1 right-1 text-[10px] px-1 py-0 h-4 bg-yellow-500/80">Soon</Badge>
                  </button>

                  {/* Purple Dream (Coming Soon) */}
                  <button
                    disabled
                    className="p-3 rounded-lg border border-gray-600 bg-dark-tertiary/50 opacity-60 cursor-not-allowed transition-all relative"
                    data-testid="theme-purple-dream"
                  >
                    <div className="w-full h-12 rounded bg-gradient-to-r from-purple-600 to-indigo-700 mb-2"></div>
                    <p className="text-xs text-gray-300 font-medium">Purple Dream</p>
                    <Badge className="absolute top-1 right-1 text-[10px] px-1 py-0 h-4 bg-yellow-500/80">Soon</Badge>
                  </button>

                  {/* Neon Nights (Coming Soon) */}
                  <button
                    disabled
                    className="p-3 rounded-lg border border-gray-600 bg-dark-tertiary/50 opacity-60 cursor-not-allowed transition-all relative"
                    data-testid="theme-neon"
                  >
                    <div className="w-full h-12 rounded bg-gradient-to-r from-pink-500 to-violet-600 mb-2"></div>
                    <p className="text-xs text-gray-300 font-medium">Neon Nights</p>
                    <Badge className="absolute top-1 right-1 text-[10px] px-1 py-0 h-4 bg-yellow-500/80">Soon</Badge>
                  </button>

                  {/* Autumn (Coming Soon) */}
                  <button
                    disabled
                    className="p-3 rounded-lg border border-gray-600 bg-dark-tertiary/50 opacity-60 cursor-not-allowed transition-all relative"
                    data-testid="theme-autumn"
                  >
                    <div className="w-full h-12 rounded bg-gradient-to-r from-amber-600 to-red-700 mb-2"></div>
                    <p className="text-xs text-gray-300 font-medium">Autumn</p>
                    <Badge className="absolute top-1 right-1 text-[10px] px-1 py-0 h-4 bg-yellow-500/80">Soon</Badge>
                  </button>

                  {/* Midnight (Coming Soon) */}
                  <button
                    disabled
                    className="p-3 rounded-lg border border-gray-600 bg-dark-tertiary/50 opacity-60 cursor-not-allowed transition-all relative"
                    data-testid="theme-midnight"
                  >
                    <div className="w-full h-12 rounded bg-gradient-to-r from-slate-900 to-blue-900 mb-2"></div>
                    <p className="text-xs text-gray-300 font-medium">Midnight</p>
                    <Badge className="absolute top-1 right-1 text-[10px] px-1 py-0 h-4 bg-yellow-500/80">Soon</Badge>
                  </button>
                </div>
              </div>

              {/* Animations Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Enable Animations</Label>
                  <p className="text-sm text-gray-400">Add smooth transitions and effects</p>
                </div>
                <Switch
                  checked={preferences.animationsEnabled}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, animationsEnabled: checked })
                  }
                  data-testid="switch-animations"
                />
              </div>

              {/* Compact Mode Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Compact Mode</Label>
                  <p className="text-sm text-gray-400">Reduce spacing for more content on screen</p>
                </div>
                <Switch
                  checked={preferences.compactMode}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, compactMode: checked })
                  }
                  data-testid="switch-compact-mode"
                />
              </div>

              <Button
                onClick={handleSavePreferences}
                disabled={updateProfileMutation.isPending}
                className="bg-primary-500 hover:bg-primary-600 text-white"
                data-testid="button-save-preferences"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card className="bg-dark-secondary border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </CardTitle>
              <CardDescription className="text-gray-400">
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Assignment Reminders</Label>
                  <p className="text-sm text-gray-400">Get notified about upcoming assignments</p>
                </div>
                <Switch
                  checked={preferences.notifications.assignments}
                  onCheckedChange={(checked) => 
                    setPreferences({ 
                      ...preferences, 
                      notifications: { ...preferences.notifications, assignments: checked }
                    })
                  }
                  data-testid="switch-assignment-notifications"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Deadline Alerts</Label>
                  <p className="text-sm text-gray-400">Get warned about approaching deadlines</p>
                </div>
                <Switch
                  checked={preferences.notifications.deadlines}
                  onCheckedChange={(checked) => 
                    setPreferences({ 
                      ...preferences, 
                      notifications: { ...preferences.notifications, deadlines: checked }
                    })
                  }
                  data-testid="switch-deadline-notifications"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Achievement Notifications</Label>
                  <p className="text-sm text-gray-400">Celebrate your study milestones</p>
                </div>
                <Switch
                  checked={preferences.notifications.achievements}
                  onCheckedChange={(checked) => 
                    setPreferences({ 
                      ...preferences, 
                      notifications: { ...preferences.notifications, achievements: checked }
                    })
                  }
                  data-testid="switch-achievement-notifications"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Weekly Summary</Label>
                  <p className="text-sm text-gray-400">Receive weekly progress reports</p>
                </div>
                <Switch
                  checked={preferences.notifications.weekly_summary}
                  onCheckedChange={(checked) => 
                    setPreferences({ 
                      ...preferences, 
                      notifications: { ...preferences.notifications, weekly_summary: checked }
                    })
                  }
                  data-testid="switch-weekly-summary"
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Section */}
          <Card className="bg-dark-secondary border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Shield className="h-5 w-5 mr-2" />
                Account & Security
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage your account settings and subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Premium Status */}
              <div className="flex items-center justify-between p-4 bg-dark-tertiary rounded-lg border border-gray-600">
                <div className="flex items-center space-x-3">
                  <Crown className={`h-6 w-6 ${(user as any)?.isPremium ? "text-purple-400" : "text-gray-500"}`} />
                  <div>
                    <p className="font-medium text-white">
                      {(user as any)?.isPremium ? "AcademiaFlow Pro" : "AcademiaFlow Free"}
                    </p>
                    <p className="text-sm text-gray-400">
                      {(user as any)?.isPremium 
                        ? "Enjoy all premium features including AI assistance"
                        : "Upgrade to unlock AI features and advanced tools"
                      }
                    </p>
                  </div>
                </div>
                {(user as any)?.isPremium ? (
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    Active
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    onClick={() => setShowUpgradeModal(true)}
                    data-testid="button-upgrade-account"
                  >
                    Upgrade
                  </Button>
                )}
              </div>

              <Separator className="bg-gray-600" />

              {/* Account Actions */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-600 text-gray-300 hover:bg-dark-tertiary"
                  onClick={() => window.location.href = '/api/logout'}
                  data-testid="button-sign-out"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start border-red-600 text-red-400 hover:bg-red-500/10"
                  data-testid="button-delete-account"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </div>
  );
}
