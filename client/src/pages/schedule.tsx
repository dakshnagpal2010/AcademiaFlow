import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Plus, 
  Bell,
  BookOpen,
  MapPin,
  Edit,
  Trash2,
  Umbrella,
  Copy,
  Check
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
  const { toast } = useToast();
  const [selectedDay, setSelectedDay] = useState('monday');
  const [isHolidayMode, setIsHolidayMode] = useState<Record<string, boolean>>({});
  const [savedSchedules, setSavedSchedules] = useState<Record<string, ScheduleItem[]>>({});
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    endTime: '',
    location: '',
    type: 'class' as 'class' | 'break' | 'lunch' | 'activity',
    color: 'blue'
  });
  const [selectedDaysToCopy, setSelectedDaysToCopy] = useState<string[]>([]);
  
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
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: []
  });

  const days = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
  ];

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
    }
  }, [isAuthenticated, authLoading, toast]);

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
    
    for (const item of todaySchedule) {
      const startMinutes = getTimeInMinutes(item.startTime);
      if (currentMinutes < startMinutes) {
        return { ...item, isNext: true };
      }
    }
    
    return null;
  };

  const currentPeriod = getCurrentPeriod();

  const generateHolidaySchedule = (): ScheduleItem[] => {
    const schedule: ScheduleItem[] = [];
    for (let hour = 10; hour < 22; hour++) {
      schedule.push({
        id: `holiday-${hour}`,
        name: `${hour}:00 - ${hour + 1}:00`,
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        type: 'activity',
        color: 'gray'
      });
    }
    return schedule;
  };

  const toggleHolidayMode = () => {
    const currentMode = isHolidayMode[selectedDay] || false;
    
    if (!currentMode) {
      if (!savedSchedules[selectedDay]) {
        setSavedSchedules({
          ...savedSchedules,
          [selectedDay]: bellSchedule[selectedDay] || []
        });
      }
      setBellSchedule({
        ...bellSchedule,
        [selectedDay]: generateHolidaySchedule()
      });
      toast({
        title: "Holiday Mode Activated",
        description: `${days.find(d => d.value === selectedDay)?.label} is now in holiday mode`,
      });
    } else {
      const savedSchedule = savedSchedules[selectedDay] || [];
      setBellSchedule({
        ...bellSchedule,
        [selectedDay]: savedSchedule
      });
      toast({
        title: "Holiday Mode Deactivated",
        description: `Restored school schedule for ${days.find(d => d.value === selectedDay)?.label}`,
      });
    }
    
    setIsHolidayMode({
      ...isHolidayMode,
      [selectedDay]: !currentMode
    });
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      startTime: '',
      endTime: '',
      location: '',
      type: 'class',
      color: 'blue'
    });
    setShowAddEditModal(true);
  };

  const handleEditItem = (item: ScheduleItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      startTime: item.startTime,
      endTime: item.endTime,
      location: item.location || '',
      type: item.type,
      color: item.color || 'blue'
    });
    setShowAddEditModal(true);
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm("Are you sure you want to delete this schedule item?")) {
      const currentSchedule = bellSchedule[selectedDay] || [];
      setBellSchedule({
        ...bellSchedule,
        [selectedDay]: currentSchedule.filter(item => item.id !== id)
      });
      toast({
        title: "Success",
        description: "Schedule item deleted successfully!",
      });
    }
  };

  const handleSaveItem = () => {
    if (!formData.name || !formData.startTime || !formData.endTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const currentSchedule = bellSchedule[selectedDay] || [];
    
    if (editingItem) {
      setBellSchedule({
        ...bellSchedule,
        [selectedDay]: currentSchedule.map(item => 
          item.id === editingItem.id 
            ? { ...formData, id: item.id }
            : item
        )
      });
      toast({
        title: "Success",
        description: "Schedule item updated successfully!",
      });
    } else {
      const newItem: ScheduleItem = {
        ...formData,
        id: Date.now().toString()
      };
      setBellSchedule({
        ...bellSchedule,
        [selectedDay]: [...currentSchedule, newItem].sort((a, b) => 
          getTimeInMinutes(a.startTime) - getTimeInMinutes(b.startTime)
        )
      });
      toast({
        title: "Success",
        description: "Schedule item added successfully!",
      });
    }
    setShowAddEditModal(false);
  };

  const handleCopySchedule = () => {
    setSelectedDaysToCopy([]);
    setShowCopyModal(true);
  };

  const handleConfirmCopy = () => {
    if (selectedDaysToCopy.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one day to copy to.",
        variant: "destructive",
      });
      return;
    }

    const sourceSchedule = bellSchedule[selectedDay] || [];
    const updates: Record<string, ScheduleItem[]> = {};
    
    selectedDaysToCopy.forEach(day => {
      updates[day] = sourceSchedule.map(item => ({
        ...item,
        id: `${day}-${Date.now()}-${Math.random()}`
      }));
    });

    setBellSchedule({
      ...bellSchedule,
      ...updates
    });

    toast({
      title: "Success",
      description: `Schedule copied to ${selectedDaysToCopy.length} day(s)!`,
    });
    setShowCopyModal(false);
  };

  const toggleDaySelection = (day: string) => {
    if (selectedDaysToCopy.includes(day)) {
      setSelectedDaysToCopy(selectedDaysToCopy.filter(d => d !== day));
    } else {
      setSelectedDaysToCopy([...selectedDaysToCopy, day]);
    }
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
            <p className="text-gray-400 mt-1">Manage your daily class schedule and periods</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              className={`border-yellow-500/30 ${
                isHolidayMode[selectedDay] 
                  ? 'bg-yellow-500/20 text-yellow-400' 
                  : 'hover:bg-yellow-500/20 text-yellow-400'
              }`}
              onClick={toggleHolidayMode}
              data-testid="button-holiday-mode"
            >
              <Umbrella className="h-4 w-4 mr-2" />
              {isHolidayMode[selectedDay] ? 'Exit Holiday Mode' : 'Holiday Mode'}
            </Button>
            <Button
              variant="outline"
              className="border-primary-500/30 hover:bg-primary-500/20"
              onClick={() => setShowAddEditModal(true)}
              data-testid="button-add-schedule"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Period
            </Button>
          </div>
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
              <CardDescription>Choose a day to view and edit the bell schedule</CardDescription>
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
                    {isHolidayMode[day.value] && (
                      <Umbrella className="h-3 w-3 ml-2 text-yellow-400" />
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Schedule Display */}
          <Card className="bg-dark-secondary border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    {days.find(d => d.value === selectedDay)?.label} Schedule
                  </CardTitle>
                  <CardDescription>
                    {isHolidayMode[selectedDay] 
                      ? 'Holiday schedule - hourly time slots' 
                      : `Bell schedule for ${days.find(d => d.value === selectedDay)?.label}`
                    }
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 hover:bg-dark-tertiary"
                  onClick={handleCopySchedule}
                  disabled={!bellSchedule[selectedDay] || bellSchedule[selectedDay].length === 0}
                  data-testid="button-copy-schedule"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Days
                </Button>
              </div>
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
                      
                      {item.type === 'class' && item.color && (
                        <div 
                          className={`w-4 h-4 rounded-full bg-${item.color}-500`}
                          title={`${item.color} class`}
                        ></div>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditItem(item)}
                        className="text-gray-400 hover:text-white"
                        data-testid={`button-edit-${item.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-400 hover:text-red-300"
                        data-testid={`button-delete-${item.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
                      onClick={handleAddItem}
                      data-testid="button-add-first-schedule"
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

      {/* Add/Edit Modal */}
      <Dialog open={showAddEditModal} onOpenChange={setShowAddEditModal}>
        <DialogContent className="bg-dark-secondary border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingItem ? 'Edit Schedule Item' : 'Add Schedule Item'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingItem ? 'Update the schedule item details' : 'Add a new period to your schedule'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Period 1"
                className="bg-dark-tertiary border-gray-600 text-white mt-1"
                data-testid="input-schedule-name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime" className="text-white">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="bg-dark-tertiary border-gray-600 text-white mt-1"
                  data-testid="input-start-time"
                />
              </div>
              <div>
                <Label htmlFor="endTime" className="text-white">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="bg-dark-tertiary border-gray-600 text-white mt-1"
                  data-testid="input-end-time"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location" className="text-white">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Room 101"
                className="bg-dark-tertiary border-gray-600 text-white mt-1"
                data-testid="input-location"
              />
            </div>

            <div>
              <Label className="text-white">Type</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="bg-dark-tertiary border-gray-600 text-white mt-1" data-testid="select-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-dark-tertiary border-gray-600">
                  <SelectItem value="class">Class</SelectItem>
                  <SelectItem value="break">Break</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="activity">Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleSaveItem}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
                data-testid="button-save-schedule-item"
              >
                {editingItem ? 'Update' : 'Add'} Item
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-dark-tertiary"
                onClick={() => setShowAddEditModal(false)}
                data-testid="button-cancel-schedule-item"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Copy Schedule Modal */}
      <Dialog open={showCopyModal} onOpenChange={setShowCopyModal}>
        <DialogContent className="bg-dark-secondary border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Copy Schedule</DialogTitle>
            <DialogDescription className="text-gray-400">
              Select which days to copy the current schedule to
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-3">
              {days
                .filter(day => day.value !== selectedDay)
                .map((day) => (
                  <div key={day.value} className="flex items-center space-x-3">
                    <Checkbox
                      id={`copy-${day.value}`}
                      checked={selectedDaysToCopy.includes(day.value)}
                      onCheckedChange={() => toggleDaySelection(day.value)}
                      data-testid={`checkbox-copy-${day.value}`}
                    />
                    <Label 
                      htmlFor={`copy-${day.value}`}
                      className="text-white cursor-pointer flex-1"
                    >
                      {day.label}
                    </Label>
                  </div>
                ))}
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleConfirmCopy}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
                data-testid="button-confirm-copy"
              >
                <Check className="h-4 w-4 mr-2" />
                Copy Schedule
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-dark-tertiary"
                onClick={() => setShowCopyModal(false)}
                data-testid="button-cancel-copy"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
