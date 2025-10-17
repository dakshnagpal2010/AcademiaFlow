import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  AlertCircle,
  Flag
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO, getDay } from "date-fns";
import AddHomeworkModal from "@/components/add-homework-modal";
import CalendarNoteModal from "@/components/calendar-note-modal";
import HolidayPopupModal from "@/components/holiday-popup-modal";

// Calculate holidays for any year
const getHolidaysForYear = (year: number) => {
  const holidays = [];
  
  // Fixed-date holidays (same every year)
  holidays.push({ month: 1, day: 1, name: "New Year's Day" });
  holidays.push({ month: 2, day: 14, name: "Valentine's Day" });
  holidays.push({ month: 3, day: 17, name: "St. Patrick's Day" });
  holidays.push({ month: 6, day: 19, name: "Juneteenth" });
  holidays.push({ month: 7, day: 4, name: "Independence Day" });
  holidays.push({ month: 10, day: 31, name: "Halloween" });
  holidays.push({ month: 11, day: 11, name: "Veterans Day" });
  holidays.push({ month: 12, day: 25, name: "Christmas Day" });
  holidays.push({ month: 12, day: 31, name: "New Year's Eve" });
  
  // 3rd Monday in January - MLK Day
  const mlkDay = new Date(year, 0, 1);
  mlkDay.setDate(1 + (1 - mlkDay.getDay() + 7) % 7 + 14);
  holidays.push({ month: mlkDay.getMonth() + 1, day: mlkDay.getDate(), name: "Martin Luther King Jr. Day" });
  
  // 3rd Monday in February - Presidents' Day
  const presidentsDay = new Date(year, 1, 1);
  presidentsDay.setDate(1 + (1 - presidentsDay.getDay() + 7) % 7 + 14);
  holidays.push({ month: presidentsDay.getMonth() + 1, day: presidentsDay.getDate(), name: "Presidents' Day" });
  
  // 2nd Sunday in May - Mother's Day
  const mothersDay = new Date(year, 4, 1);
  mothersDay.setDate(1 + (7 - mothersDay.getDay()) % 7 + 7);
  holidays.push({ month: mothersDay.getMonth() + 1, day: mothersDay.getDate(), name: "Mother's Day" });
  
  // Last Monday in May - Memorial Day
  const memorialDay = new Date(year, 5, 1);
  memorialDay.setDate(0);
  memorialDay.setDate(memorialDay.getDate() - (memorialDay.getDay() + 6) % 7);
  holidays.push({ month: memorialDay.getMonth() + 1, day: memorialDay.getDate(), name: "Memorial Day" });
  
  // 3rd Sunday in June - Father's Day
  const fathersDay = new Date(year, 5, 1);
  fathersDay.setDate(1 + (7 - fathersDay.getDay()) % 7 + 14);
  holidays.push({ month: fathersDay.getMonth() + 1, day: fathersDay.getDate(), name: "Father's Day" });
  
  // 1st Monday in September - Labor Day
  const laborDay = new Date(year, 8, 1);
  laborDay.setDate(1 + (1 - laborDay.getDay() + 7) % 7);
  holidays.push({ month: laborDay.getMonth() + 1, day: laborDay.getDate(), name: "Labor Day" });
  
  // 2nd Monday in October - Columbus Day
  const columbusDay = new Date(year, 9, 1);
  columbusDay.setDate(1 + (1 - columbusDay.getDay() + 7) % 7 + 7);
  holidays.push({ month: columbusDay.getMonth() + 1, day: columbusDay.getDate(), name: "Columbus Day" });
  
  // 4th Thursday in November - Thanksgiving
  const thanksgiving = new Date(year, 10, 1);
  thanksgiving.setDate(1 + (4 - thanksgiving.getDay() + 7) % 7 + 21);
  holidays.push({ month: thanksgiving.getMonth() + 1, day: thanksgiving.getDate(), name: "Thanksgiving" });
  
  return holidays;
};

export default function Calendar() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showDayEventsModal, setShowDayEventsModal] = useState(false);
  const [showHolidayPopup, setShowHolidayPopup] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showHolidays, setShowHolidays] = useState(() => {
    const saved = localStorage.getItem('calendar-show-holidays');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save holiday toggle preference to localStorage
  useEffect(() => {
    localStorage.setItem('calendar-show-holidays', JSON.stringify(showHolidays));
  }, [showHolidays]);

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
      // Only show assignments that are marked to show on calendar
      if (assignment.showOnCalendar === false) return false;
      if (!assignment.dueDate) return false;
      
      const dueDate = parseISO(assignment.dueDate);
      
      // Check if assignment repeats
      if (!assignment.repeatPattern || assignment.repeatPattern === "none") {
        // No repeat - just check if it's the same day
        return isSameDay(dueDate, date);
      }
      
      // Check if date is before the original due date
      if (date < dueDate) return false;
      
      // Check if repeat has ended
      if (assignment.repeatUntil && date > parseISO(assignment.repeatUntil)) {
        return false;
      }
      
      // Handle different repeat patterns
      switch (assignment.repeatPattern) {
        case "daily":
          return true; // Show every day after due date
          
        case "weekly": {
          // Check if it's the same day of week
          if (assignment.repeatDays) {
            const repeatDays = JSON.parse(assignment.repeatDays);
            const dayOfWeek = date.getDay();
            return repeatDays.includes(dayOfWeek);
          }
          // Fallback: repeat on the same day of week as due date
          return date.getDay() === dueDate.getDay();
        }
        
        case "monthly":
          // Same day of month
          return date.getDate() === dueDate.getDate();
          
        case "yearly":
          // Same day and month
          return date.getDate() === dueDate.getDate() && 
                 date.getMonth() === dueDate.getMonth();
          
        default:
          return isSameDay(dueDate, date);
      }
    });
  };

  const getHolidayForDate = (date: Date) => {
    if (!showHolidays) return null;
    const month = date.getMonth() + 1; // getMonth() is 0-indexed
    const day = date.getDate();
    const year = date.getFullYear();
    
    const yearHolidays = getHolidaysForYear(year);
    return yearHolidays.find(holiday => 
      holiday.month === month && holiday.day === day
    );
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
          <div className="flex items-center space-x-4">
            {/* Holiday Toggle */}
            <div className="flex items-center space-x-2 bg-dark-tertiary px-4 py-2 rounded-lg border border-gray-600">
              <Flag className="h-4 w-4 text-red-400" />
              <Label htmlFor="holiday-toggle" className="text-white cursor-pointer">
                Show US Holidays
              </Label>
              <Switch
                id="holiday-toggle"
                checked={showHolidays}
                onCheckedChange={setShowHolidays}
                data-testid="switch-show-holidays"
              />
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
                      const holiday = getHolidayForDate(date);
                      const isCurrentMonth = isSameMonth(date, currentDate);
                      const isTodayDate = isToday(date);
                      
                      return (
                        <div
                          key={index}
                          className={`h-24 p-1 border border-gray-600 rounded-lg transition-colors cursor-pointer ${
                            isCurrentMonth 
                              ? "bg-dark-tertiary hover:bg-dark-secondary" 
                              : "bg-dark-primary opacity-50"
                          } ${
                            isTodayDate ? "ring-2 ring-primary-500" : ""
                          } ${
                            holiday ? "bg-red-500/10 border-red-500/30" : ""
                          }`}
                          data-testid={`calendar-day-${format(date, 'yyyy-MM-dd')}`}
                          onClick={() => {
                            if (isCurrentMonth) {
                              setSelectedDate(date);
                              if (holiday) {
                                setSelectedHoliday(holiday.name);
                                setShowHolidayPopup(true);
                              } else {
                                setShowNoteModal(true);
                              }
                            }
                          }}
                        >
                          <div className={`text-sm font-medium mb-1 flex items-center justify-between ${
                            isTodayDate 
                              ? "text-primary-400" 
                              : isCurrentMonth 
                              ? "text-white" 
                              : "text-gray-500"
                          }`}>
                            <span>{format(date, 'd')}</span>
                            {holiday && (
                              <Flag className="h-3 w-3 text-red-400" data-testid={`holiday-flag-${format(date, 'yyyy-MM-dd')}`} />
                            )}
                          </div>
                          
                          <div className="space-y-1 overflow-hidden">
                            {holiday && (
                              <div
                                className="text-xs p-1 rounded text-white truncate bg-red-500/30 border-l-3 border-red-500"
                                style={{ borderLeftWidth: '3px' }}
                                title={holiday.name}
                                data-testid={`holiday-${format(date, 'yyyy-MM-dd')}`}
                              >
                                🎉 {holiday.name}
                              </div>
                            )}
                            {dayAssignments.slice(0, holiday ? 1 : 2).map((assignment: any) => {
                              const classInfo = getClassById(assignment.classId);
                              const eventColor = assignment.color || "#3b82f6";
                              const tooltipText = [
                                assignment.title,
                                classInfo?.name ? `Class: ${classInfo.name}` : null,
                                assignment.estimatedHours ? `Est. Time: ${assignment.estimatedHours}h` : null,
                                assignment.description ? `Description: ${assignment.description}` : null,
                              ].filter(Boolean).join('\n');
                              
                              return (
                                <div
                                  key={assignment.id}
                                  className="text-xs p-1 rounded text-white truncate"
                                  style={{ 
                                    backgroundColor: `${eventColor}80`, // 50% opacity
                                    borderLeft: `3px solid ${eventColor}`
                                  }}
                                  title={tooltipText}
                                  data-testid={`calendar-assignment-${assignment.id}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="truncate">{assignment.title}</span>
                                    {assignment.estimatedHours && (
                                      <span className="ml-1 text-[10px] opacity-70">{assignment.estimatedHours}h</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                            {dayAssignments.length > (holiday ? 1 : 2) && (
                              <button
                                className="text-xs text-blue-400 hover:text-blue-300 text-center w-full py-1 hover:bg-blue-500/10 rounded"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDate(date);
                                  setShowDayEventsModal(true);
                                }}
                                data-testid={`see-more-events-${format(date, 'yyyy-MM-dd')}`}
                              >
                                See {dayAssignments.length - (holiday ? 1 : 2)} more
                              </button>
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
      
      {/* Calendar Note Modal */}
      <CalendarNoteModal 
        open={showNoteModal} 
        onOpenChange={setShowNoteModal}
        selectedDate={selectedDate}
      />

      {/* Holiday Popup Modal */}
      <HolidayPopupModal 
        open={showHolidayPopup} 
        onOpenChange={setShowHolidayPopup}
        holidayName={selectedHoliday}
        onComplete={() => setShowNoteModal(true)}
      />

      {/* Day Events Modal */}
      {showDayEventsModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDayEventsModal(false)}>
          <div className="bg-dark-secondary border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Events for {format(selectedDate, "MMMM d, yyyy")}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDayEventsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-3">
              {getHolidayForDate(selectedDate) && (
                <div
                  className="p-3 rounded-lg border bg-red-500/20 border-red-500/60"
                >
                  <div className="flex items-center space-x-2">
                    <Flag className="h-5 w-5 text-red-400" />
                    <h4 className="font-medium text-white">🎉 {getHolidayForDate(selectedDate)?.name}</h4>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">US Holiday</p>
                </div>
              )}
              
              {getAssignmentsForDate(selectedDate).map((assignment: any) => {
                const classInfo = getClassById(assignment.classId);
                const eventColor = assignment.color || "#3b82f6";
                return (
                  <div
                    key={assignment.id}
                    className="p-3 rounded-lg border"
                    style={{ 
                      backgroundColor: `${eventColor}20`,
                      borderColor: `${eventColor}60`
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{assignment.title}</h4>
                        {classInfo && (
                          <p className="text-sm text-gray-400 mt-1">{classInfo.name}</p>
                        )}
                        {assignment.estimatedHours && (
                          <div className="flex items-center text-sm text-blue-400 mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            Estimated: {assignment.estimatedHours} hour{assignment.estimatedHours !== 1 ? 's' : ''}
                          </div>
                        )}
                        {assignment.description && (
                          <p className="text-sm text-gray-300 mt-2">{assignment.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <Badge className={`text-xs ${
                          assignment.priority === "high" 
                            ? "bg-red-500/20 text-red-400"
                            : assignment.priority === "medium"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-green-500/20 text-green-400"
                        }`}>
                          {assignment.priority}
                        </Badge>
                        <div 
                          className="w-4 h-4 rounded-full border-2 border-white"
                          style={{ backgroundColor: eventColor }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {!getHolidayForDate(selectedDate) && getAssignmentsForDate(selectedDate).length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No events scheduled for this day</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
