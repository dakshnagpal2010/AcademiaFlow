import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X } from "lucide-react";

interface ProfileCustomizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileCustomizationModal({ 
  open, 
  onOpenChange 
}: ProfileCustomizationModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    bio: user?.bio || "",
    academicYear: user?.academicYear || "",
    major: user?.major || "",
    theme: user?.theme || "default",
    animationsEnabled: user?.animationsEnabled ?? true,
    compactMode: user?.compactMode ?? false,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PATCH", "/api/user/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const getInitials = (user: any) => {
    if (formData.displayName) {
      return formData.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark-secondary border-gray-700 max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Customize Profile</DialogTitle>
          <DialogDescription className="text-gray-400">
            Update your profile information and preferences
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div>
            <Label className="text-white mb-2 block">Profile Picture</Label>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.profileImageUrl} alt="Profile" />
                <AvatarFallback className="bg-primary-500 text-white text-lg">
                  {getInitials(user)}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-dark-tertiary"
                data-testid="button-change-photo"
              >
                <Upload className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="displayName" className="text-white">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="bg-dark-tertiary border-gray-600 text-white mt-1"
                data-testid="input-display-name"
              />
            </div>

            <div>
              <Label htmlFor="bio" className="text-white">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                className="bg-dark-tertiary border-gray-600 text-white mt-1"
                rows={3}
                data-testid="textarea-bio"
              />
            </div>

            <div>
              <Label htmlFor="academicYear" className="text-white">Year/Grade</Label>
              <Select
                value={formData.academicYear}
                onValueChange={(value) => setFormData({ ...formData, academicYear: value })}
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
              <Label htmlFor="major" className="text-white">Major</Label>
              <Input
                id="major"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                className="bg-dark-tertiary border-gray-600 text-white mt-1"
                data-testid="input-major"
              />
            </div>
          </div>

          {/* Theme Customization */}
          <div className="pt-6 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Theme Preferences</h3>
            
            <div className="space-y-4">
              <div>
                <Label className="text-white mb-2 block">Color Scheme</Label>
                <div className="grid grid-cols-3 gap-3">
                  {themeOptions.map((theme) => (
                    <button
                      key={theme.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, theme: theme.value })}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        formData.theme === theme.value
                          ? "border-primary-500 bg-primary-500/20"
                          : "border-gray-600 hover:border-gray-500"
                      }`}
                      data-testid={`button-theme-${theme.value}`}
                    >
                      <div className={`w-full h-4 bg-gradient-to-r ${theme.gradient} rounded`}></div>
                      <p className="text-xs mt-2 text-gray-300">{theme.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-white">Enable Animations</Label>
                <Switch
                  checked={formData.animationsEnabled}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, animationsEnabled: checked })
                  }
                  data-testid="switch-animations"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-white">Compact Mode</Label>
                <Switch
                  checked={formData.compactMode}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, compactMode: checked })
                  }
                  data-testid="switch-compact-mode"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
              disabled={updateProfileMutation.isPending}
              data-testid="button-save-profile"
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-dark-tertiary"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-profile"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
