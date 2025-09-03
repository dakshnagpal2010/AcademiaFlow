import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Plus, 
  Bell,
  BookOpen,
  MapPin,
  Edit,
  Trash2
} from "lucide-react";
import { format, addMinutes, parse } from "date-fns";

interface ScheduleItem {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  location?: string;
  type: 'class' | 'break' | 'lunch' | 'activity';
  color?: string;
}

export default function Schedule() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedDay, setSelectedDay] = useState('monday');
  
  // Sample bell schedule data - this would come from backend/settings in real implementation
  const [bellSchedule, setBellSchedule] = useState<Record<string, ScheduleItem[]>>({
    monday: [
      { id: '1', name: 'Period 1', startTime: '08:00', endTime: '08:50', type: 'class', color: 'blue' },
      { id: '2', name: 'Period 2', startTime: '09:00', endTime: '09:50', type: 'class', color: 'green' },
      { id: '3', name: 'Break', startTime: '09:50', endTime: '10:10', type: 'break' },
      { id: '4', name: 'Period 3', startTime: '10:10', endTime: '11:00', type: 'class', color: 'purple' },
      { id: '5', name: 'Period 4', startTime: '11:10', endTime: '12:00', type: 'class', color: 'orange' },
      { id: '6', name: 'Lunch', startTime: '12:00', endTime: '12:45', type: 'lunch' },
      { id: '7', name: 'Period 5', startTime: '12:45', endTime: '13:35', type: 'class', color: 'red' },
      { id: '8', name: 'Period 6', startTime: '13:45', endTime: '14:35', type: 'class', color: 'teal' },
    ],
    tuesday: [
      { id: '9', name: 'Period 1', startTime: '08:30', endTime: '09:20', type: 'class', color: 'blue' },
      { id: '10', name: 'Period 2', startTime: '09:30', endTime: '10:20', type: 'class', color: 'green' },
      { id: '11', name: 'Assembly', startTime: '10:20', endTime: '11:00', type: 'activity' },
      { id: '12', name: 'Period 3', startTime: '11:10', endTime: '12:00', type: 'class', color: 'purple' },
      { id: '13', name: 'Lunch', startTime: '12:00', endTime: '12:45', type: 'lunch' },
      { id: '14', name: 'Period 4', startTime: '12:45', endTime: '13:35', type: 'class', color: 'orange' },
      { id: '15', name: 'Period 5', startTime: '13:45', endTime: '14:35', type: 'class', color: 'red' },
    ],
    wednesday: [
      { id: '16', name: 'Period 1', startTime: '08:00', endTime: '08:50', type: 'class', color: 'blue' },
      { id: '17', name: 'Period 2', startTime: '09:00', endTime: '09:50', type: 'class', color: 'green' },
      { id: '18', name: 'Break', startTime: '09:50', endTime: '10:10', type: 'break' },
      { id: '19', name: 'Period 3', startTime: '10:10', endTime: '11:00', type: 'class', color: 'purple' },
      { id: '20', name: 'Period 4', startTime: '11:10', endTime: '12:00', type: 'class', color: 'orange' },
      { id: '21', name: 'Lunch', startTime: '12:00', endTime: '12:45', type: 'lunch' },
      { id: '22', name: 'Period 5', startTime: '12:45', endTime: '13:35', type: 'class', color: 'red' },
      { id: '23', name: 'Period 6', startTime: '13:45', endTime: '14:35', type: 'class', color: 'teal' },
    ],
    thursday: [
      { id: '24', name: 'Period 1', startTime: '08:30', endTime: '09:20', type: 'class', color: 'blue' },
      { id: '25', name: 'Period 2', startTime: '09:30', endTime: '10:20', type: 'class', color: 'green' },
      { id: '26', name: 'Break', startTime: '10:20', endTime: '10:40', type: 'break' },
      { id: '27', name: 'Period 3', startTime: '10:40', endTime: '11:30', type: 'class', color: 'purple' },
      { id: '28', name: 'Period 4', startTime: '11:40', endTime: '12:30', type: 'class', color: 'orange' },
      { id: '29', name: 'Lunch', startTime: '12:30', endTime: '13:15', type: 'lunch' },
      { id: '30', name: 'Period 5', startTime: '13:15', endTime: '14:05', type: 'class', color: 'red' },
      { id: '31', name: 'Study Hall', startTime: '14:15', endTime: '15:00', type: 'activity' },
    ],
    friday: [
      { id: '32', name: 'Period 1', startTime: '08:00', endTime: '08:45', type: 'class', color: 'blue' },
      { id: '33', name: 'Period 2', startTime: '08:55', endTime: '09:40', type: 'class', color: 'green' },
      { id: '34', name: 'Period 3', startTime: '09:50', endTime: '10:35', type: 'class', color: 'purple' },
      { id: '35', name: 'Break', startTime: '10:35', endTime: '10:55', type: 'break' },
      { id: '36', name: 'Period 4', startTime: '10:55', endTime: '11:40', type: 'class', color: 'orange' },
      { id: '37', name: 'Period 5', startTime: '11:50', endTime: '12:35', type: 'class', color: 'red' },
      { id: '38', name: 'Lunch', startTime: '12:35', endTime: '13:20', type: 'lunch' },
      { id: '39', name: 'Period 6', startTime: '13:20', endTime: '14:05', type: 'class', color: 'teal' },
    ]
  });

  const days = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'class': return 'bg-primary-500/20 text-primary-400 border-primary-500/30';
      case 'break': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'lunch': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'activity': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTimeInMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getCurrentPeriod = () => {
    const now = new Date();
    const today = format(now, 'eeee').toLowerCase();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const todaySchedule = bellSchedule[today] || [];
    
    for (const item of todaySchedule) {
      const startMinutes = getTimeInMinutes(item.startTime);
      const endMinutes = getTimeInMinutes(item.endTime);
      
      if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
        return item;
      }
    }
    
    // Find next period
    for (const item of todaySchedule) {
      const startMinutes = getTimeInMinutes(item.startTime);
      if (currentMinutes < startMinutes) {
        return { ...item, isNext: true };
      }
    }
    
    return null;
  };

  const currentPeriod = getCurrentPeriod();

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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-primary text-white">
      {/* Header */}
      <header className="bg-dark-secondary/80 glass-effect border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-schedule-title">
              <Clock className="inline-block mr-3 h-8 w-8" />
              Bell Schedule
            </h1>
            <p className="text-gray-400 mt-1">View your daily class schedule and periods</p>
          </div>
          <Button
            variant="outline"
            className="border-primary-500/30 hover:bg-primary-500/20"
            data-testid="button-edit-schedule"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Schedule
          </Button>
        </div>
      </header>

      {/* Current Period Alert */}
      {currentPeriod && (
        <div className="p-6">
          <Card className={`border-2 ${currentPeriod.isNext ? 'border-yellow-500 bg-yellow-500/10' : 'border-green-500 bg-green-500/10'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className={`h-6 w-6 ${currentPeriod.isNext ? 'text-yellow-400' : 'text-green-400'}`} />
                  <div>
                    <h3 className="font-semibold text-white">
                      {currentPeriod.isNext ? 'Next Period' : 'Current Period'}
                    </h3>
                    <p className="text-gray-300">
                      {currentPeriod.name} • {currentPeriod.startTime} - {currentPeriod.endTime}
                    </p>
                  </div>
                </div>
                <Badge className={getTypeColor(currentPeriod.type)}>
                  {currentPeriod.type.charAt(0).toUpperCase() + currentPeriod.type.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Day Selection */}
          <Card className="bg-dark-secondary border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Select Day</CardTitle>
              <CardDescription>Choose a day to view the bell schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {days.map((day) => (
                  <Button
                    key={day.value}
                    variant={selectedDay === day.value ? "default" : "outline"}
                    onClick={() => setSelectedDay(day.value)}
                    className={selectedDay === day.value 
                      ? "bg-primary-500 hover:bg-primary-600" 
                      : "border-gray-600 hover:bg-dark-tertiary"
                    }
                    data-testid={`button-day-${day.value}`}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Schedule Display */}
          <Card className="bg-dark-secondary border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                {days.find(d => d.value === selectedDay)?.label} Schedule
              </CardTitle>
              <CardDescription>Bell schedule for {days.find(d => d.value === selectedDay)?.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bellSchedule[selectedDay]?.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-dark-tertiary rounded-lg hover:bg-dark-primary/50 transition-colors"
                    data-testid={`schedule-item-${item.id}`}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="text-center min-w-[100px]">
                        <div className="text-lg font-semibold text-white">
                          {item.startTime}
                        </div>
                        <div className="text-sm text-gray-400">
                          {item.endTime}
                        </div>
                      </div>
                      
                      <div className="w-px h-12 bg-gray-600"></div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-lg" data-testid={`period-name-${item.id}`}>
                          {item.name}
                        </h3>
                        {item.location && (
                          <p className="text-gray-400 flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {item.location}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge className={getTypeColor(item.type)}>
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </Badge>
                      
                      {item.type === 'class' && (
                        <div 
                          className={`w-4 h-4 rounded-full bg-${item.color}-500`}
                          title={`${item.color} class`}
                        ></div>
                      )}
                    </div>
                  </div>
                ))}
                
                {(!bellSchedule[selectedDay] || bellSchedule[selectedDay].length === 0) && (
                  <div className="text-center py-12 text-gray-400">
                    <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h4 className="text-lg font-medium mb-2">No Schedule Set</h4>
                    <p className="text-sm">
                      No bell schedule has been configured for {days.find(d => d.value === selectedDay)?.label}.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4 border-primary-500/30 hover:bg-primary-500/20"
                      data-testid="button-add-schedule"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Schedule
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Schedule Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-dark-secondary border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-500/20 p-3 rounded-full">
                    <BookOpen className="h-6 w-6 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {bellSchedule[selectedDay]?.filter(item => item.type === 'class').length || 0}
                    </p>
                    <p className="text-gray-400">Class Periods</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-secondary border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500/20 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {(() => {
                        const schedule = bellSchedule[selectedDay] || [];
                        if (schedule.length === 0) return "0:00";
                        const firstStart = getTimeInMinutes(schedule[0].startTime);
                        const lastEnd = getTimeInMinutes(schedule[schedule.length - 1].endTime);
                        const totalMinutes = lastEnd - firstStart;
                        const hours = Math.floor(totalMinutes / 60);
                        const minutes = totalMinutes % 60;
                        return `${hours}:${minutes.toString().padStart(2, '0')}`;
                      })()}
                    </p>
                    <p className="text-gray-400">Total Duration</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-secondary border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-500/20 p-3 rounded-full">
                    <Bell className="h-6 w-6 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {bellSchedule[selectedDay]?.filter(item => item.type === 'break' || item.type === 'lunch').length || 0}
                    </p>
                    <p className="text-gray-400">Break Periods</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}