import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  CheckSquare, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Clock,
  Calendar as CalendarIcon,
  Filter,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import AddHomeworkModal from "@/components/add-homework-modal";
import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";

export default function Homework() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

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

  // Assignments query
  const { data: assignments, isLoading } = useQuery({
    queryKey: ["/api/assignments"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Classes query for assignment context
  const { data: classes } = useQuery({
    queryKey: ["/api/classes"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Complete assignment mutation
  const completeAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      await apiRequest("PATCH", `/api/assignments/${assignmentId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Assignment marked as completed!",
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
        description: "Failed to update assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update assignment status mutation
  const updateAssignmentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/assignments/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
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
        description: "Failed to update assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete assignment mutation
  const deleteAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      await apiRequest("DELETE", `/api/assignments/${assignmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Assignment deleted successfully!",
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
        description: "Failed to delete assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggleComplete = (assignmentId: string, currentStatus: string) => {
    if (currentStatus === "completed") {
      updateAssignmentMutation.mutate({ id: assignmentId, status: "pending" });
    } else {
      completeAssignmentMutation.mutate(assignmentId);
    }
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      deleteAssignmentMutation.mutate(assignmentId);
    }
  };

  const formatDueDate = (dueDate: string) => {
    const date = parseISO(dueDate);
    if (isToday(date)) return "Due Today";
    if (isTomorrow(date)) return "Due Tomorrow";
    if (isPast(date)) return "Overdue";
    return `Due ${format(date, "MMM d")}`;
  };

  const getDueDateColor = (dueDate: string) => {
    const date = parseISO(dueDate);
    if (isPast(date)) return "text-red-400";
    if (isToday(date)) return "text-orange-400";
    if (isTomorrow(date)) return "text-yellow-400";
    return "text-green-400";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "in_progress": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "pending": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const filterAssignments = (assignments: any[]) => {
    if (!assignments) return [];

    let filtered = assignments.filter((assignment: any) =>
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (activeTab) {
      case "pending":
        return filtered.filter((a: any) => a.status === "pending");
      case "in_progress":
        return filtered.filter((a: any) => a.status === "in_progress");
      case "completed":
        return filtered.filter((a: any) => a.status === "completed");
      case "overdue":
        return filtered.filter((a: any) => 
          a.status !== "completed" && a.dueDate && isPast(parseISO(a.dueDate))
        );
      default:
        return filtered;
    }
  };

  const getClassById = (classId: string) => {
    return classes?.find((c: any) => c.id === classId);
  };

  const filteredAssignments = filterAssignments(assignments || []);

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
            <h1 className="text-3xl font-bold" data-testid="text-homework-title">Homework & Assignments</h1>
            <p className="text-gray-400 mt-1">Track and manage your academic tasks</p>
          </div>
          <Button
            className="bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white"
            onClick={() => setShowAddModal(true)}
            data-testid="button-add-assignment-header"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Assignment
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Search and Tabs */}
        <div className="mb-6 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-dark-secondary border-gray-600 text-white"
              data-testid="input-search-assignments"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-dark-secondary border-gray-600">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary-500" data-testid="tab-all">
                All
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-primary-500" data-testid="tab-pending">
                Pending
              </TabsTrigger>
              <TabsTrigger value="in_progress" className="data-[state=active]:bg-primary-500" data-testid="tab-in-progress">
                In Progress
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-primary-500" data-testid="tab-completed">
                Completed
              </TabsTrigger>
              <TabsTrigger value="overdue" className="data-[state=active]:bg-red-500" data-testid="tab-overdue">
                Overdue
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Assignments List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="bg-dark-secondary border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-5 w-5" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAssignments.length > 0 ? (
          <div className="space-y-4">
            {filteredAssignments.map((assignment: any) => {
              const classInfo = getClassById(assignment.classId);
              return (
                <Card 
                  key={assignment.id} 
                  className={`bg-dark-secondary border-gray-700 hover-lift transition-all ${
                    assignment.status === "completed" ? "opacity-75" : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Checkbox
                        checked={assignment.status === "completed"}
                        onCheckedChange={() => handleToggleComplete(assignment.id, assignment.status)}
                        className="h-5 w-5"
                        data-testid={`checkbox-assignment-${assignment.id}`}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold text-white ${
                              assignment.status === "completed" ? "line-through" : ""
                            }`} data-testid={`text-assignment-title-${assignment.id}`}>
                              {assignment.title}
                            </h3>
                            
                            <div className="flex items-center space-x-4 mt-1">
                              {classInfo && (
                                <span className="text-sm text-gray-400" data-testid={`text-assignment-class-${assignment.id}`}>
                                  {classInfo.name}
                                </span>
                              )}
                              
                              {assignment.dueDate && (
                                <div className="flex items-center space-x-1">
                                  <CalendarIcon className="h-3 w-3 text-gray-500" />
                                  <span className={`text-sm ${getDueDateColor(assignment.dueDate)}`}>
                                    {formatDueDate(assignment.dueDate)}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {assignment.description && (
                              <p className="text-sm text-gray-400 mt-2 line-clamp-2" data-testid={`text-assignment-description-${assignment.id}`}>
                                {assignment.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Badge className={getPriorityColor(assignment.priority)}>
                              {assignment.priority}
                            </Badge>
                            
                            <Badge className={getStatusColor(assignment.status)}>
                              {assignment.status.replace("_", " ")}
                            </Badge>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-400 hover:text-white"
                                  data-testid={`button-assignment-menu-${assignment.id}`}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-dark-tertiary border-gray-600">
                                <DropdownMenuItem 
                                  className="text-white hover:bg-dark-secondary"
                                  data-testid={`menu-edit-assignment-${assignment.id}`}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Assignment
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-400 hover:bg-dark-secondary"
                                  onClick={() => handleDeleteAssignment(assignment.id)}
                                  data-testid={`menu-delete-assignment-${assignment.id}`}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Assignment
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-dark-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              {activeTab === "completed" ? (
                <CheckCircle className="h-12 w-12 text-green-500" />
              ) : activeTab === "overdue" ? (
                <AlertCircle className="h-12 w-12 text-red-500" />
              ) : (
                <CheckSquare className="h-12 w-12 text-gray-500" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {activeTab === "completed" 
                ? "No Completed Assignments" 
                : activeTab === "overdue"
                ? "No Overdue Assignments"
                : searchTerm
                ? "No Assignments Found"
                : "No Assignments Yet"
              }
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {activeTab === "completed" 
                ? "Complete some assignments to see them here."
                : activeTab === "overdue"
                ? "Great! You have no overdue assignments."
                : searchTerm 
                ? "No assignments match your search criteria. Try adjusting your search terms."
                : "Get started by adding your first assignment to begin tracking your homework."
              }
            </p>
            {(activeTab === "all" || activeTab === "pending") && (
              <Button
                className="bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white"
                onClick={() => setShowAddModal(true)}
                data-testid="button-add-first-assignment"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Assignment
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Add Assignment Modal */}
      <AddHomeworkModal open={showAddModal} onOpenChange={setShowAddModal} />
    </div>
  );
}
