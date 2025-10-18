import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Edit, 
  Trash2, 
  MoreVertical, 
  BookOpen,
  Dumbbell,
  Coffee,
  Moon,
  Briefcase,
  GraduationCap,
  Heart,
  Music,
  Camera,
  Gamepad2,
  Lightbulb,
  CheckCircle,
  Eye,
  Clock,
  FileText
} from "lucide-react";

// Icon options for plans
const iconOptions = [
  { value: "BookOpen", label: "Book", icon: BookOpen },
  { value: "GraduationCap", label: "Study", icon: GraduationCap },
  { value: "Dumbbell", label: "Exercise", icon: Dumbbell },
  { value: "Coffee", label: "Coffee", icon: Coffee },
  { value: "Moon", label: "Evening", icon: Moon },
  { value: "Briefcase", label: "Work", icon: Briefcase },
  { value: "Heart", label: "Health", icon: Heart },
  { value: "Music", label: "Music", icon: Music },
  { value: "Camera", label: "Creative", icon: Camera },
  { value: "Gamepad2", label: "Gaming", icon: Gamepad2 },
  { value: "Lightbulb", label: "Ideas", icon: Lightbulb },
];

// Color options for plans
const colorOptions = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", 
  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
  "#f97316", "#6366f1", "#14b8a6", "#eab308"
];

export default function Plans() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [editingSlot, setEditingSlot] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [slotFormData, setSlotFormData] = useState({
    title: "",
    timeSlot: "",
    details: "",
    type: "slot" as "slot" | "note",
  });
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "BookOpen",
    color: "#3b82f6",
    isTemplate: false,
  });

  // Plans query
  const { data: plans, isLoading } = useQuery({
    queryKey: ["/api/plans"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Create plan mutation
  const createPlanMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/plans", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      toast({
        title: "Success",
        description: "Plan created successfully!",
      });
      setShowAddModal(false);
      setFormData({
        name: "",
        description: "",
        icon: "BookOpen",
        color: "#3b82f6",
        isTemplate: false,
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
        description: "Failed to create plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update plan mutation
  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/plans/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      toast({
        title: "Success",
        description: "Plan updated successfully!",
      });
      setShowEditModal(false);
      setEditingPlan(null);
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
        description: "Failed to update plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/plans/${id}`);
      // DELETE returns 204 with no body
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      toast({
        title: "Success",
        description: "Plan deleted successfully!",
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
        description: "Failed to delete plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Plan slots query
  const { data: planSlots } = useQuery({
    queryKey: [`/api/plans/${selectedPlan?.id}/slots`],
    enabled: !!selectedPlan,
    retry: false,
  });

  // Create plan slot mutation
  const createSlotMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", `/api/plans/${selectedPlan.id}/slots`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/plans/${selectedPlan.id}/slots`] });
      toast({ title: "Success", description: "Slot added successfully!" });
      setShowAddSlotModal(false);
      setSlotFormData({ title: "", timeSlot: "", details: "", type: "slot" });
    },
  });

  // Delete plan slot mutation
  const deleteSlotMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/plan-slots/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/plans/${selectedPlan.id}/slots`] });
      toast({ title: "Success", description: "Slot deleted successfully!" });
    },
  });

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Plan name is required.",
        variant: "destructive",
      });
      return;
    }
    createPlanMutation.mutate(formData);
  };

  const handleEditPlan = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || "",
      icon: plan.icon || "BookOpen",
      color: plan.color || "#3b82f6",
      isTemplate: plan.isTemplate || false,
    });
    setShowEditModal(true);
  };

  const handleUpdatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !editingPlan) {
      toast({
        title: "Error",
        description: "Plan name is required.",
        variant: "destructive",
      });
      return;
    }
    updatePlanMutation.mutate({ id: editingPlan.id, data: formData });
  };

  const handleDeletePlan = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      deletePlanMutation.mutate(id);
    }
  };

  const handleViewPlanDetails = (plan: any) => {
    setSelectedPlan(plan);
    setShowDetailModal(true);
  };

  const handleAddSlot = () => {
    setEditingSlot(null);
    setSlotFormData({ title: "", timeSlot: "", details: "", type: "slot" });
    setShowAddSlotModal(true);
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotFormData.title.trim()) {
      toast({ title: "Error", description: "Title is required.", variant: "destructive" });
      return;
    }
    createSlotMutation.mutate(slotFormData);
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(opt => opt.value === iconName);
    return iconOption ? iconOption.icon : BookOpen;
  };

  const filteredPlans = Array.isArray(plans) 
    ? plans.filter((plan: any) => 
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (plan.description && plan.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

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
            <h1 className="text-3xl font-bold" data-testid="text-plans-title">Plans</h1>
            <p className="text-gray-400 mt-1">Organize your routines and schedules</p>
          </div>
          <Button
            className="bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white"
            onClick={() => setShowAddModal(true)}
            data-testid="button-add-plan"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md bg-dark-secondary border-gray-600 text-white"
            data-testid="input-search-plans"
          />
        </div>

        {/* Plans Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : filteredPlans.length === 0 ? (
          <Card className="bg-dark-secondary border-gray-700">
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Plans Yet</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm 
                  ? "No plans match your search. Try different keywords."
                  : "Create your first plan to organize your routines and schedules."}
              </p>
              {!searchTerm && (
                <Button
                  className="bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white"
                  onClick={() => setShowAddModal(true)}
                  data-testid="button-create-first-plan"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan: any) => {
              const IconComponent = getIconComponent(plan.icon);
              return (
                <Card 
                  key={plan.id} 
                  className="bg-dark-secondary border-gray-700 hover-lift transition-all"
                  data-testid={`card-plan-${plan.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${plan.color}30`, borderColor: `${plan.color}60` }}
                        >
                          <IconComponent className="h-6 w-6" style={{ color: plan.color }} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-white text-lg" data-testid={`text-plan-name-${plan.id}`}>
                            {plan.name}
                          </CardTitle>
                          {plan.isTemplate && (
                            <Badge className="mt-1 bg-purple-500/20 text-purple-400 border-purple-500/30">
                              Template
                            </Badge>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-400 hover:text-white"
                            data-testid={`button-plan-menu-${plan.id}`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-dark-tertiary border-gray-600">
                          <DropdownMenuItem 
                            onClick={() => handleViewPlanDetails(plan)}
                            className="text-gray-300 hover:bg-dark-secondary"
                            data-testid={`button-view-plan-${plan.id}`}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleEditPlan(plan)}
                            className="text-gray-300 hover:bg-dark-secondary"
                            data-testid={`button-edit-plan-${plan.id}`}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeletePlan(plan.id, plan.name)}
                            className="text-red-400 hover:bg-red-500/20"
                            data-testid={`button-delete-plan-${plan.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-400" data-testid={`text-plan-description-${plan.id}`}>
                      {plan.description || "No description provided"}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Add Plan Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-dark-secondary border-gray-700 max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Plan</DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a plan to organize your routines and schedules
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePlan} className="space-y-4">
            <div>
              <Label htmlFor="planName" className="text-white">Plan Name *</Label>
              <Input
                id="planName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Morning Routine, Study Plan"
                className="bg-dark-tertiary border-gray-600 text-white mt-1"
                data-testid="input-plan-name"
                required
              />
            </div>

            <div>
              <Label htmlFor="planDescription" className="text-white">Description</Label>
              <Textarea
                id="planDescription"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description..."
                className="bg-dark-tertiary border-gray-600 text-white mt-1"
                rows={3}
                data-testid="textarea-plan-description"
              />
            </div>

            <div>
              <Label className="text-white">Icon</Label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {iconOptions.map((iconOpt) => {
                  const IconComp = iconOpt.icon;
                  return (
                    <button
                      key={iconOpt.value}
                      type="button"
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.icon === iconOpt.value 
                          ? "border-primary-500 bg-primary-500/20" 
                          : "border-gray-600 hover:border-gray-500"
                      }`}
                      onClick={() => setFormData({ ...formData, icon: iconOpt.value })}
                      data-testid={`button-icon-${iconOpt.value}`}
                      title={iconOpt.label}
                    >
                      <IconComp className="h-5 w-5 text-white mx-auto" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-white">Color</Label>
              <div className="flex space-x-2 flex-wrap mt-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-10 h-10 rounded-full border-2 ${
                      formData.color === color ? "border-white ring-2 ring-primary-500" : "border-gray-600"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                    data-testid={`button-color-${color}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
                disabled={createPlanMutation.isPending}
                data-testid="button-create-plan"
              >
                {createPlanMutation.isPending ? "Creating..." : "Create Plan"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-dark-tertiary"
                onClick={() => setShowAddModal(false)}
                data-testid="button-cancel-create-plan"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-dark-secondary border-gray-700 max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Plan</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update your plan details
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdatePlan} className="space-y-4">
            <div>
              <Label htmlFor="editPlanName" className="text-white">Plan Name *</Label>
              <Input
                id="editPlanName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Morning Routine, Study Plan"
                className="bg-dark-tertiary border-gray-600 text-white mt-1"
                data-testid="input-edit-plan-name"
                required
              />
            </div>

            <div>
              <Label htmlFor="editPlanDescription" className="text-white">Description</Label>
              <Textarea
                id="editPlanDescription"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description..."
                className="bg-dark-tertiary border-gray-600 text-white mt-1"
                rows={3}
                data-testid="textarea-edit-plan-description"
              />
            </div>

            <div>
              <Label className="text-white">Icon</Label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {iconOptions.map((iconOpt) => {
                  const IconComp = iconOpt.icon;
                  return (
                    <button
                      key={iconOpt.value}
                      type="button"
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.icon === iconOpt.value 
                          ? "border-primary-500 bg-primary-500/20" 
                          : "border-gray-600 hover:border-gray-500"
                      }`}
                      onClick={() => setFormData({ ...formData, icon: iconOpt.value })}
                      data-testid={`button-edit-icon-${iconOpt.value}`}
                      title={iconOpt.label}
                    >
                      <IconComp className="h-5 w-5 text-white mx-auto" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-white">Color</Label>
              <div className="flex space-x-2 flex-wrap mt-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-10 h-10 rounded-full border-2 ${
                      formData.color === color ? "border-white ring-2 ring-primary-500" : "border-gray-600"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                    data-testid={`button-edit-color-${color}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
                disabled={updatePlanMutation.isPending}
                data-testid="button-update-plan"
              >
                {updatePlanMutation.isPending ? "Updating..." : "Update Plan"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-dark-tertiary"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPlan(null);
                }}
                data-testid="button-cancel-edit-plan"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Plan Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="bg-dark-secondary border-gray-700 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {selectedPlan && getIconComponent(selectedPlan.icon) && (
                <span style={{ color: selectedPlan.color }}>
                  {(() => {
                    const Icon = getIconComponent(selectedPlan.icon);
                    return <Icon className="h-6 w-6" />;
                  })()}
                </span>
              )}
              {selectedPlan?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedPlan?.description || "Manage plan slots and schedule"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Plan Slots</h3>
              <Button
                onClick={handleAddSlot}
                className="bg-primary-500 hover:bg-primary-600"
                size="sm"
                data-testid="button-add-plan-slot"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Slot
              </Button>
            </div>

            {planSlots && planSlots.length > 0 ? (
              <div className="space-y-2">
                {planSlots.map((slot: any) => (
                  <Card key={slot.id} className="bg-dark-tertiary border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {slot.type === "slot" ? (
                              <Clock className="h-4 w-4 text-primary-400" />
                            ) : (
                              <FileText className="h-4 w-4 text-purple-400" />
                            )}
                            <h4 className="font-medium text-white">{slot.title}</h4>
                          </div>
                          {slot.timeSlot && (
                            <p className="text-sm text-gray-400 mt-1">⏰ {slot.timeSlot}</p>
                          )}
                          {slot.details && (
                            <p className="text-sm text-gray-300 mt-2">{slot.details}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSlotMutation.mutate(slot.id)}
                          className="text-red-400 hover:text-red-300"
                          data-testid={`button-delete-slot-${slot.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No slots added yet</p>
                <p className="text-sm text-gray-500">Add time slots or notes to organize this plan</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Slot Modal */}
      <Dialog open={showAddSlotModal} onOpenChange={setShowAddSlotModal}>
        <DialogContent className="bg-dark-secondary border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Add Plan Slot</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add a time slot or note to your plan
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveSlot} className="space-y-4">
            <div>
              <Label className="text-white">Type</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant={slotFormData.type === "slot" ? "default" : "outline"}
                  onClick={() => setSlotFormData({ ...slotFormData, type: "slot" })}
                  className="flex-1"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Time Slot
                </Button>
                <Button
                  type="button"
                  variant={slotFormData.type === "note" ? "default" : "outline"}
                  onClick={() => setSlotFormData({ ...slotFormData, type: "note" })}
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Note
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="slotTitle" className="text-white">Title *</Label>
              <Input
                id="slotTitle"
                value={slotFormData.title}
                onChange={(e) => setSlotFormData({ ...slotFormData, title: e.target.value })}
                placeholder="e.g., Morning Study, Exercise"
                className="bg-dark-tertiary border-gray-600 text-white mt-1"
                data-testid="input-slot-title"
                required
              />
            </div>

            {slotFormData.type === "slot" && (
              <div>
                <Label htmlFor="slotTime" className="text-white">Time Slot</Label>
                <Input
                  id="slotTime"
                  value={slotFormData.timeSlot}
                  onChange={(e) => setSlotFormData({ ...slotFormData, timeSlot: e.target.value })}
                  placeholder="e.g., 9:00 AM - 10:00 AM"
                  className="bg-dark-tertiary border-gray-600 text-white mt-1"
                  data-testid="input-slot-time"
                />
              </div>
            )}

            <div>
              <Label htmlFor="slotDetails" className="text-white">Details</Label>
              <Textarea
                id="slotDetails"
                value={slotFormData.details}
                onChange={(e) => setSlotFormData({ ...slotFormData, details: e.target.value })}
                placeholder="Additional details or notes..."
                className="bg-dark-tertiary border-gray-600 text-white mt-1"
                rows={3}
                data-testid="textarea-slot-details"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
                disabled={createSlotMutation.isPending}
                data-testid="button-save-slot"
              >
                {createSlotMutation.isPending ? "Adding..." : "Add Slot"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-dark-tertiary"
                onClick={() => setShowAddSlotModal(false)}
                data-testid="button-cancel-add-slot"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
