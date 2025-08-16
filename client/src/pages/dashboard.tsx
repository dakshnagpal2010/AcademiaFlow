import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Flame, 
  Plus,
  Calendar as CalendarIcon,
  Settings,
  PencilLine,
  Bell,
  Crown,
  ExternalLink
} from "lucide-react";
import { useState } from "react";
import AddClassModal from "@/components/add-class-modal";
import AddHomeworkModal from "@/components/add-homework-modal";
import PremiumUpgradeModal from "@/components/premium-upgrade-modal";
import { format, isToday, isTomorrow, isPast } from "date-fns";

export default function Dashboard() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAddHomeworkModal, setShowAddHomeworkModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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

  // Dashboard stats query
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Upcoming assignments query
  const { data: upcomingAssignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["/api/assignments/upcoming"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Recent activities query
  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/activities"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Classes query for progress
  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ["/api/classes"],
    enabled: isAuthenticated,
    retry: false,
  });

  // All assignments query for progress calculation
  const { data: allAssignments, isLoading: allAssignmentsLoading } = useQuery({
    queryKey: ["/api/assignments"],
    enabled: isAuthenticated,
    retry: false,
  });

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isToday(date)) return "Due Today";
    if (isTomorrow(date)) return "Due Tomorrow";
    if (isPast(date)) return "Overdue";
    return `Due ${format(date, "MMM d")}`;
  };

  const getDueDateColor = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isPast(date)) return "text-red-400";
    if (isToday(date)) return "text-orange-400";
    if (isTomorrow(date)) return "text-yellow-400";
    return "text-green-400";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/20 text-red-400";
      case "medium": return "bg-yellow-500/20 text-yellow-400";
      case "low": return "bg-green-500/20 text-green-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Calculate real progress for each class
  const calculateClassProgress = (classId: string) => {
    if (!allAssignments || !Array.isArray(allAssignments)) return 0;
    
    const classAssignments = allAssignments.filter((assignment: any) => assignment.classId === classId);
    if (classAssignments.length === 0) return 0;
    
    const completedAssignments = classAssignments.filter((assignment: any) => assignment.status === "completed");
    return Math.round((completedAssignments.length / classAssignments.length) * 100);
  };

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
            <h2 className="text-2xl font-bold" data-testid="text-dashboard-greeting">
              {getGreeting()}! 👋
            </h2>
            <p className="text-gray-400 mt-1" data-testid="text-dashboard-date">
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white relative"
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Button>
            
            <Button
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 premium-glow"
              onClick={() => setShowUpgradeModal(true)}
              data-testid="button-upgrade-header"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-dark-secondary border-gray-700 hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Classes</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold mt-1" data-testid="stat-total-classes">
                      {stats?.totalClasses || 0}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-secondary border-gray-700 hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pending Tasks</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold mt-1 text-orange-400" data-testid="stat-pending-tasks">
                      {stats?.pendingTasks || 0}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-secondary border-gray-700 hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Completed Today</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold mt-1 text-green-400" data-testid="stat-completed-today">
                      {stats?.completedToday || 0}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-secondary border-gray-700 hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Study Streak</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-20 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold mt-1 text-purple-400" data-testid="stat-study-streak">
                      {stats?.studyStreak || 0} days
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Flame className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Assignments */}
          <div className="lg:col-span-2">
            <Card className="bg-dark-secondary border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Upcoming Assignments</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary-500 hover:text-primary-400"
                    data-testid="button-view-all-assignments"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {assignmentsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 bg-dark-tertiary rounded-lg">
                      <Skeleton className="h-5 w-5" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))
                ) : upcomingAssignments && upcomingAssignments.length > 0 ? (
                  upcomingAssignments.map((assignment: any) => (
                    <div 
                      key={assignment.id}
                      className="flex items-center space-x-4 p-4 bg-dark-tertiary rounded-lg border border-gray-600 hover:border-primary-500/50 transition-colors"
                    >
                      <Checkbox 
                        checked={assignment.status === "completed"}
                        data-testid={`checkbox-assignment-${assignment.id}`}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-white" data-testid={`text-assignment-title-${assignment.id}`}>
                          {assignment.title}
                        </h4>
                        <p className="text-sm text-gray-400" data-testid={`text-assignment-class-${assignment.id}`}>
                          {assignment.class?.name || "No class"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getDueDateColor(assignment.dueDate)}`}>
                          {formatDueDate(assignment.dueDate)}
                        </p>
                        <Badge className={getPriorityColor(assignment.priority)}>
                          {assignment.priority} priority
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No upcoming assignments</p>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full border-dashed border-gray-600 text-gray-400 hover:border-primary-500 hover:text-primary-500"
                  onClick={() => setShowAddHomeworkModal(true)}
                  data-testid="button-add-assignment"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Assignment
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* AI Assistant (Premium) */}
            <div className="gradient-border premium-glow">
              <div className="gradient-border-inner">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Crown className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-semibold">AI Study Assistant</h3>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">PRO</Badge>
                </div>
                
                <div className="w-full h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <Crown className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-sm text-purple-300">AI Assistant Preview</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-400 mb-4">
                  Get personalized study recommendations, homework help, and schedule optimization powered by AI.
                </p>
                
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                  onClick={() => setShowUpgradeModal(true)}
                  data-testid="button-unlock-ai"
                >
                  Unlock AI Features
                </Button>
              </div>
            </div>

            {/* Progress Overview */}
            <Card className="bg-dark-secondary border-gray-700">
              <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {classesLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))
                ) : classes && classes.length > 0 ? (
                  classes.slice(0, 3).map((classItem: any, index: number) => {
                    const progress = calculateClassProgress(classItem.id);
                    return (
                      <div key={classItem.id}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-white">{classItem.name}</span>
                          <span className="text-green-400">
                            {progress}%
                          </span>
                        </div>
                        <Progress 
                          value={progress} 
                          className="h-2"
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No classes added yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-dark-secondary border-gray-700">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-20 bg-primary-500/20 border-primary-500/30 hover:bg-primary-500/30 flex-col"
                    onClick={() => setShowAddClassModal(true)}
                    data-testid="button-quick-add-class"
                  >
                    <Plus className="h-5 w-5 text-primary-500 mb-2" />
                    <span className="text-sm">Add Class</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-20 bg-orange-500/20 border-orange-500/30 hover:bg-orange-500/30 flex-col"
                    onClick={() => setShowAddHomeworkModal(true)}
                    data-testid="button-quick-add-task"
                  >
                    <PencilLine className="h-5 w-5 text-orange-500 mb-2" />
                    <span className="text-sm">New Task</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-20 bg-green-500/20 border-green-500/30 hover:bg-green-500/30 flex-col"
                    data-testid="button-quick-calendar"
                  >
                    <CalendarIcon className="h-5 w-5 text-green-500 mb-2" />
                    <span className="text-sm">Calendar</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-20 bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/30 flex-col"
                    data-testid="button-quick-settings"
                  >
                    <Settings className="h-5 w-5 text-purple-500 mb-2" />
                    <span className="text-sm">Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="bg-dark-secondary border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-500 hover:text-primary-400"
                data-testid="button-view-all-activity"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="w-full h-32 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BookOpen className="h-8 w-8 text-primary-400 mx-auto mb-2" />
                    <p className="text-sm text-primary-300">Study Activity</p>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <div className="space-y-3">
                  {activitiesLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 p-3 bg-dark-tertiary rounded-lg">
                        <Skeleton className="h-2 w-2 rounded-full" />
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    ))
                  ) : activities && activities.length > 0 ? (
                    activities.slice(0, 3).map((activity: any) => (
                      <div key={activity.id} className="flex items-center space-x-3 p-3 bg-dark-tertiary rounded-lg">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm flex-1" data-testid={`text-activity-${activity.id}`}>
                          {activity.description}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(activity.createdAt), "MMM d")}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-400">
                      <p className="text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Modals */}
      <AddClassModal open={showAddClassModal} onOpenChange={setShowAddClassModal} />
      <AddHomeworkModal open={showAddHomeworkModal} onOpenChange={setShowAddHomeworkModal} />
      <PremiumUpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </div>
  );
}
