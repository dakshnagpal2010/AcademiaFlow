import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  AlertCircle
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO, getDay } from "date-fns";
import AddHomeworkModal from "@/components/add-homework-modal";

export default function Calendar() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

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

  // Classes query
  const { data: classes } = useQuery({
    queryKey: ["/api/classes"],
    enabled: isAuthenticated,
    retry: false,
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add padding days to start the calendar on Sunday
  const firstDayOfWeek = getDay(monthStart);
  const paddingDays = Array.from({ length: firstDayOfWeek }, (_, i) => {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (firstDayOfWeek - i));
    return date;
  });

  // Add padding days to end the calendar
  const lastDayOfWeek = getDay(monthEnd);
  const endPaddingDays = Array.from({ length: 6 - lastDayOfWeek }, (_, i) => {
    const date = new Date(monthEnd);
    date.setDate(date.getDate() + (i + 1));
    return date;
  });

  const allCalendarDays = [...paddingDays, ...calendarDays, ...endPaddingDays];

  const getAssignmentsForDate = (date: Date) => {
    if (!assignments) return [];
    return assignments.filter((assignment: any) => {
      if (!assignment.dueDate) return false;
      return isSameDay(parseISO(assignment.dueDate), date);
    });
  };

  const getClassById = (classId: string) => {
    return classes?.find((c: any) => c.id === classId);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
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
            <h1 className="text-3xl font-bold" data-testid="text-calendar-title">Calendar</h1>
            <p className="text-gray-400 mt-1">View your assignments and schedule</p>
          </div>
          <Button
            className="bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white"
            onClick={() => setShowAddModal(true)}
            data-testid="button-add-assignment-calendar"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Assignment
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <Card className="bg-dark-secondary border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-white" data-testid="text-current-month">
                    {format(currentDate, "MMMM yyyy")}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToToday}
                      className="border-gray-600 text-gray-300 hover:bg-dark-tertiary"
                      data-testid="button-go-to-today"
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('prev')}
                      className="border-gray-600 text-gray-300 hover:bg-dark-tertiary"
                      data-testid="button-prev-month"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('next')}
                      className="border-gray-600 text-gray-300 hover:bg-dark-tertiary"
                      data-testid="button-next-month"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-400">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                {isLoading ? (
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 35 }).map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-1">
                    {allCalendarDays.map((date, index) => {
                      const dayAssignments = getAssignmentsForDate(date);
                      const isCurrentMonth = isSameMonth(date, currentDate);
                      const isTodayDate = isToday(date);
                      
                      return (
                        <div
                          key={index}
                          className={`h-24 p-1 border border-gray-600 rounded-lg transition-colors ${
                            isCurrentMonth 
                              ? "bg-dark-tertiary hover:bg-dark-secondary" 
                              : "bg-dark-primary opacity-50"
                          } ${
                            isTodayDate ? "ring-2 ring-primary-500" : ""
                          }`}
                          data-testid={`calendar-day-${format(date, 'yyyy-MM-dd')}`}
                        >
                          <div className={`text-sm font-medium mb-1 ${
                            isTodayDate 
                              ? "text-primary-400" 
                              : isCurrentMonth 
                              ? "text-white" 
                              : "text-gray-500"
                          }`}>
                            {format(date, 'd')}
                          </div>
                          
                          <div className="space-y-1 overflow-hidden">
                            {dayAssignments.slice(0, 2).map((assignment: any) => {
                              const classInfo = getClassById(assignment.classId);
                              return (
                                <div
                                  key={assignment.id}
                                  className="text-xs p-1 rounded bg-primary-500/20 text-primary-300 truncate"
                                  title={`${assignment.title} - ${classInfo?.name || 'No class'}`}
                                  data-testid={`calendar-assignment-${assignment.id}`}
                                >
                                  {assignment.title}
                                </div>
                              );
                            })}
                            {dayAssignments.length > 2 && (
                              <div className="text-xs text-gray-400 text-center">
                                +{dayAssignments.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Assignments */}
            <Card className="bg-dark-secondary border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Today's Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {getAssignmentsForDate(new Date()).length > 0 ? (
                      getAssignmentsForDate(new Date()).map((assignment: any) => {
                        const classInfo = getClassById(assignment.classId);
                        return (
                          <div
                            key={assignment.id}
                            className="p-3 bg-dark-tertiary rounded-lg border border-gray-600"
                            data-testid={`today-assignment-${assignment.id}`}
                          >
                            <h4 className="font-medium text-white text-sm">{assignment.title}</h4>
                            {classInfo && (
                              <p className="text-xs text-gray-400 mt-1">{classInfo.name}</p>
                            )}
                            <Badge 
                              className={`mt-1 text-xs ${
                                assignment.priority === "high" 
                                  ? "bg-red-500/20 text-red-400"
                                  : assignment.priority === "medium"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-green-500/20 text-green-400"
                              }`}
                            >
                              {assignment.priority} priority
                            </Badge>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-4">
                        <CalendarIcon className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No assignments today</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card className="bg-dark-secondary border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {assignments && assignments
                      .filter((a: any) => a.status !== "completed" && a.dueDate)
                      .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                      .slice(0, 5)
                      .map((assignment: any) => {
                        const classInfo = getClassById(assignment.classId);
                        return (
                          <div
                            key={assignment.id}
                            className="p-3 bg-dark-tertiary rounded-lg border border-gray-600"
                            data-testid={`upcoming-assignment-${assignment.id}`}
                          >
                            <h4 className="font-medium text-white text-sm">{assignment.title}</h4>
                            {classInfo && (
                              <p className="text-xs text-gray-400 mt-1">{classInfo.name}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {format(parseISO(assignment.dueDate), "MMM d, yyyy")}
                            </p>
                          </div>
                        );
                      })
                    }
                    {(!assignments || assignments.filter((a: any) => a.status !== "completed" && a.dueDate).length === 0) && (
                      <div className="text-center py-4">
                        <AlertCircle className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No upcoming deadlines</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Add */}
            <Card className="bg-gradient-to-br from-primary-500/20 to-purple-500/20 border-primary-500/30">
              <CardContent className="p-6 text-center">
                <CalendarIcon className="h-12 w-12 text-primary-400 mx-auto mb-4" />
                <h3 className="font-semibold text-white mb-2">Add Assignment</h3>
                <p className="text-sm text-gray-300 mb-4">
                  Quickly add a new assignment to your calendar
                </p>
                <Button
                  className="w-full bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white"
                  onClick={() => setShowAddModal(true)}
                  data-testid="button-quick-add-assignment"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Assignment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Add Assignment Modal */}
      <AddHomeworkModal open={showAddModal} onOpenChange={setShowAddModal} />
    </div>
  );
}
