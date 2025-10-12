import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
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
  ExternalLink,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { useState } from "react";
import AddClassModal from "@/components/add-class-modal";
import AddHomeworkModal from "@/components/add-homework-modal";
import PremiumUpgradeModal from "@/components/premium-upgrade-modal";
import NotificationsPopover from "@/components/notifications";
import { format, isToday, isTomorrow, isPast } from "date-fns";

export default function Dashboard() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAddHomeworkModal, setShowAddHomeworkModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAllActivityModal, setShowAllActivityModal] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Inspirational quotes from famous people
  const quotes = [
    { quote: "Genius is one percent inspiration, ninety-nine percent perspiration.", author: "Thomas Edison" },
    { quote: "Imagination is more important than knowledge.", author: "Albert Einstein" },
    { quote: "I've failed over and over and over again in my life. And that is why I succeed.", author: "Michael Jordan" },
    { quote: "You have to believe in the long term plan you have but you need the short term goals to motivate and inspire you.", author: "Roger Federer" },
    { quote: "Never let the fear of striking out keep you from playing the game.", author: "Babe Ruth" },
    { quote: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { quote: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { quote: "Life is what happens to you while you're busy making other plans.", author: "John Lennon" },
    { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { quote: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
    { quote: "Champions aren't made in the gyms. Champions are made from something deep inside them - a desire, a dream, a vision.", author: "Muhammad Ali" },
    { quote: "The difference between ordinary and extraordinary is that little extra.", author: "Jimmy Johnson" }
  ];

  const nextQuote = () => {
    setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
  };

  // Complete assignment mutation
  const completeAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      await apiRequest("PATCH", `/api/assignments/${assignmentId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assignments/upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Assignment marked as completed!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to complete assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  // All activities query for modal
  const { data: allActivities, isLoading: allActivitiesLoading } = useQuery({
    queryKey: ["/api/activities", "all"],
    queryFn: () => fetch("/api/activities?limit=50").then(res => res.json()),
    enabled: isAuthenticated && showAllActivityModal,
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
            <NotificationsPopover />
            
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
        {/* Inspirational Quote Section */}
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <blockquote className="text-lg font-medium text-white mb-2">
                "{quotes[currentQuoteIndex].quote}"
              </blockquote>
              <p className="text-gray-400 text-sm">— {quotes[currentQuoteIndex].author}</p>
            </div>
            <div className="flex items-center ml-4 bg-purple-500/10 rounded-lg border border-purple-500/20 p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentQuoteIndex(prev => prev === 0 ? quotes.length - 1 : prev - 1)}
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 h-8 w-8 p-0"
                data-testid="button-prev-quote"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="w-px h-6 bg-purple-500/30 mx-1"></div>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextQuote}
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 h-8 w-8 p-0"
                data-testid="button-next-quote"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/classes">
            <Card className="bg-dark-secondary border-gray-700 hover-lift cursor-pointer hover:bg-dark-tertiary transition-colors">
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
          </Link>

          <Link href="/homework">
            <Card className="bg-dark-secondary border-gray-700 hover-lift cursor-pointer hover:bg-dark-tertiary transition-colors">
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
          </Link>

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
                <div className="flex-1">
                  <p className="text-gray-400 text-sm">Next Event</p>
                  {assignmentsLoading ? (
                    <Skeleton className="h-8 w-32 mt-1" />
                  ) : upcomingAssignments && upcomingAssignments.length > 0 ? (
                    <>
                      <p className="text-lg font-bold mt-1 text-purple-400 truncate" data-testid="stat-next-event-title">
                        {upcomingAssignments[0].title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1" data-testid="stat-next-event-date">
                        {format(new Date(upcomingAssignments[0].dueDate), "MMM d, h:mm a")}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-medium mt-1 text-gray-400">No upcoming events</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CalendarIcon className="h-6 w-6 text-purple-500" />
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
                        onCheckedChange={() => {
                          if (assignment.status !== "completed") {
                            completeAssignmentMutation.mutate(assignment.id);
                          }
                        }}
                        disabled={assignment.status === "completed" || completeAssignmentMutation.isPending}
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
                  
                  <Link href="/calendar">
                    <Button
                      variant="outline"
                      className="h-20 bg-green-500/20 border-green-500/30 hover:bg-green-500/30 flex-col w-full"
                      data-testid="button-quick-calendar"
                    >
                      <CalendarIcon className="h-5 w-5 text-green-500 mb-2" />
                      <span className="text-sm">Calendar</span>
                    </Button>
                  </Link>
                  
                  <Link href="/settings">
                    <Button
                      variant="outline"
                      className="h-20 bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/30 flex-col w-full"
                      data-testid="button-quick-settings"
                    >
                      <Settings className="h-5 w-5 text-purple-500 mb-2" />
                      <span className="text-sm">Settings</span>
                    </Button>
                  </Link>
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
                onClick={() => setShowAllActivityModal(true)}
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

      {/* All Activity Modal */}
      {showAllActivityModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAllActivityModal(false)}>
          <div className="bg-dark-secondary border border-gray-700 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">All Recent Activity</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllActivityModal(false)}
                className="text-gray-400 hover:text-white"
                data-testid="button-close-activity-modal"
              >
                ✕
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {allActivitiesLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-4 bg-dark-tertiary rounded-lg">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ))
              ) : allActivities && Array.isArray(allActivities) && allActivities.length > 0 ? (
                allActivities.map((activity: any) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 bg-dark-tertiary rounded-lg hover:bg-dark-primary/50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${
                        activity.type === 'assignment_completed' 
                          ? 'bg-green-400' 
                          : activity.type === 'class_added'
                          ? 'bg-blue-400'
                          : activity.type === 'assignment_created'
                          ? 'bg-yellow-400'
                          : 'bg-purple-400'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white" data-testid={`activity-description-${activity.id}`}>
                        {activity.description}
                      </p>
                      {activity.metadata && (
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.type === 'assignment_completed' && 'Assignment completed'}
                          {activity.type === 'class_added' && 'New class added'}
                          {activity.type === 'assignment_created' && 'New assignment created'}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="text-xs text-gray-400">
                        {format(new Date(activity.createdAt), "MMM d, yyyy")}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(activity.createdAt), "h:mm a")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h4 className="text-lg font-medium mb-2">No Activity Yet</h4>
                  <p className="text-sm">
                    Your activity history will appear here as you complete assignments, add classes, and interact with the platform.
                  </p>
                </div>
              )}
            </div>
            
            {allActivities && Array.isArray(allActivities) && allActivities.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-600">
                <p className="text-center text-sm text-gray-400">
                  Showing {allActivities.length} recent activities
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
