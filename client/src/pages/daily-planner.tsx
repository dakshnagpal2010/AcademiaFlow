import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useStaffMode } from "@/contexts/staff-mode-context";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Plus, 
  Edit, 
  Trash2,
  Save,
  Calendar,
  Copy,
  Star,
  GripVertical,
  Sparkles,
  Layout,
  ArrowUpDown
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from "date-fns";
import type { ChronoTimeSlot } from "@shared/schema";

interface TimeSlot {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  category: 'work' | 'personal' | 'fitness' | 'learning' | 'break' | 'meeting' | 'other';
  notes?: string;
  color?: string;
  priority?: 'high' | 'medium' | 'low';
}

function SortableTimeSlot({ slot, onEdit, onDelete }: { slot: ChronoTimeSlot; onEdit: (slot: ChronoTimeSlot) => void; onDelete: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'work': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'personal': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'fitness': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'learning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'break': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'meeting': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
    }
  };

  const getPriorityColor = (priority?: string | null) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const calculateDuration = () => {
    const [startH, startM] = slot.startTime.split(':').map(Number);
    const [endH, endM] = slot.endTime.split(':').map(Number);
    const durationMins = (endH * 60 + endM) - (startH * 60 + startM);
    const hours = Math.floor(durationMins / 60);
    const mins = durationMins % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`bg-dark-secondary border-gray-700 hover-lift border-l-4 ${getPriorityColor(slot.priority)}`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300"
              data-testid={`drag-handle-${slot.id}`}
            >
              <GripVertical className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white" data-testid={`slot-title-${slot.id}`}>
                  {slot.title}
                </h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(slot)}
                    className="text-gray-400 hover:text-white h-8 w-8 p-0"
                    data-testid={`button-edit-slot-${slot.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(slot.id)}
                    className="text-red-400 hover:text-red-300 h-8 w-8 p-0"
                    data-testid={`button-delete-slot-${slot.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center text-gray-400">
                  <Clock className="h-3 w-3 mr-1" />
                  {slot.startTime} - {slot.endTime}
                  <span className="ml-2 text-gray-500">({calculateDuration()})</span>
                </div>
                <Badge className={getCategoryColor(slot.category)}>
                  {slot.category}
                </Badge>
              </div>

              {slot.notes && (
                <p className="text-sm text-gray-400 mt-2 line-clamp-2" data-testid={`slot-notes-${slot.id}`}>
                  {slot.notes}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DailyPlanner() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isStaffMode } = useStaffMode();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyToDate, setCopyToDate] = useState('');
  const [editingSlot, setEditingSlot] = useState<ChronoTimeSlot | null>(null);
  const [formData, setFormData] = useState<Partial<TimeSlot>>({
    title: '',
    startTime: '',
    endTime: '',
    category: 'work',
    notes: '',
    priority: 'medium'
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Fetch time slots for the selected date
  const { data: timeSlots = [], isLoading: slotsLoading } = useQuery<ChronoTimeSlot[]>({
    queryKey: ['/api/chrono-slots', selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/chrono-slots?date=${selectedDate}`);
      if (!response.ok) throw new Error('Failed to fetch slots');
      return response.json();
    },
    enabled: isAuthenticated && isStaffMode,
  });

  // Create slot mutation
  const createSlotMutation = useMutation({
    mutationFn: async (data: Partial<TimeSlot>) => {
      return await apiRequest('POST', '/api/chrono-slots', {
        ...data,
        date: selectedDate,
        displayOrder: timeSlots.length,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chrono-slots', selectedDate] });
      toast({
        title: "Success",
        description: "Time slot added successfully!",
      });
      setShowAddEditModal(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create time slot. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update slot mutation
  const updateSlotMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TimeSlot> }) => {
      return await apiRequest('PATCH', `/api/chrono-slots/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chrono-slots', selectedDate] });
      toast({
        title: "Success",
        description: "Time slot updated successfully!",
      });
      setShowAddEditModal(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update time slot. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete slot mutation
  const deleteSlotMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/chrono-slots/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chrono-slots', selectedDate] });
      toast({
        title: "Success",
        description: "Time slot deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete time slot. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Reorder slots mutation
  const reorderSlotsMutation = useMutation({
    mutationFn: async (slots: { id: string; displayOrder: number }[]) => {
      return await apiRequest('POST', '/api/chrono-slots/reorder', { slots });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chrono-slots', selectedDate] });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = timeSlots.findIndex((slot) => slot.id === active.id);
      const newIndex = timeSlots.findIndex((slot) => slot.id === over.id);
      const reorderedSlots = arrayMove(timeSlots, oldIndex, newIndex);
      
      // Update display order
      const updates = reorderedSlots.map((slot, index) => ({
        id: slot.id,
        displayOrder: index
      }));
      reorderSlotsMutation.mutate(updates);
    }
  };

  const handleAddSlot = () => {
    setEditingSlot(null);
    setFormData({
      title: '',
      startTime: '',
      endTime: '',
      category: 'work',
      notes: '',
      priority: 'medium'
    });
    setShowAddEditModal(true);
  };

  const handleEditSlot = (slot: ChronoTimeSlot) => {
    setEditingSlot(slot);
    setFormData({
      title: slot.title,
      startTime: slot.startTime,
      endTime: slot.endTime,
      category: slot.category as any,
      notes: slot.notes || '',
      priority: slot.priority as any,
    });
    setShowAddEditModal(true);
  };

  const handleDeleteSlot = (id: string) => {
    if (window.confirm("Are you sure you want to delete this time slot?")) {
      deleteSlotMutation.mutate(id);
    }
  };

  const handleSaveSlot = () => {
    if (!formData.title || !formData.startTime || !formData.endTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (editingSlot) {
      updateSlotMutation.mutate({
        id: editingSlot.id,
        data: formData
      });
    } else {
      createSlotMutation.mutate(formData);
    }
  };

  const handleSaveAsTemplate = () => {
    toast({
      title: "Template Saved",
      description: "Your daily plan has been saved as a template!",
    });
  };

  // Copy slots to another date
  const copySlotsMutation = useMutation({
    mutationFn: async ({ slots, targetDate }: { slots: ChronoTimeSlot[]; targetDate: string }) => {
      const slotsToCreate = slots.map((slot, index) => ({
        title: slot.title,
        startTime: slot.startTime,
        endTime: slot.endTime,
        category: slot.category,
        notes: slot.notes,
        priority: slot.priority,
        color: slot.color,
        date: targetDate,
        displayOrder: index,
      }));

      return await apiRequest('POST', '/api/chrono-slots/bulk', { slots: slotsToCreate });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chrono-slots'] });
      toast({
        title: "Success",
        description: `Successfully copied ${variables.slots.length} time slot(s) to ${format(new Date(variables.targetDate), 'MMM d, yyyy')}`,
      });
      setShowCopyModal(false);
      setCopyToDate('');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to copy time slots. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCopyToDay = () => {
    if (!copyToDate) {
      toast({
        title: "Error",
        description: "Please select a date to copy to.",
        variant: "destructive",
      });
      return;
    }

    if (timeSlots.length === 0) {
      toast({
        title: "Error",
        description: "No time slots to copy.",
        variant: "destructive",
      });
      return;
    }

    copySlotsMutation.mutate({
      slots: timeSlots,
      targetDate: copyToDate
    });
  };

  const handleSortChronologically = () => {
    const sorted = [...timeSlots].sort((a, b) => {
      const [aHour, aMin] = a.startTime.split(':').map(Number);
      const [bHour, bMin] = b.startTime.split(':').map(Number);
      return (aHour * 60 + aMin) - (bHour * 60 + bMin);
    });
    
    // Update display order in database
    const updates = sorted.map((slot, index) => ({
      id: slot.id,
      displayOrder: index
    }));
    reorderSlotsMutation.mutate(updates);
    
    toast({
      title: "Success",
      description: "Time slots sorted chronologically by start time.",
    });
  };

  const calculateTotalTime = () => {
    let totalMins = 0;
    timeSlots.forEach(slot => {
      const [startH, startM] = slot.startTime.split(':').map(Number);
      const [endH, endM] = slot.endTime.split(':').map(Number);
      totalMins += (endH * 60 + endM) - (startH * 60 + startM);
    });
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return { hours, mins, total: totalMins };
  };

  const totalTime = calculateTotalTime();

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

  if (!isStaffMode) {
    return (
      <div className="min-h-screen bg-dark-primary text-white flex items-center justify-center">
        <Card className="bg-dark-secondary border-gray-700 max-w-md w-full mx-4">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Premium Feature Locked</h2>
            <p className="text-gray-400 mb-6">
              ChronoPlan is a premium feature that requires staff access. Enter staff mode to unlock this powerful daily planning tool.
            </p>
            <p className="text-sm text-gray-500">
              Use the staff access button in the sidebar to enter the correct passcode.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary text-white">
      {/* Header */}
      <header className="bg-dark-secondary/80 glass-effect border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center" data-testid="text-planner-title">
              <Sparkles className="inline-block mr-3 h-8 w-8 text-primary-500" />
              ChronoPlan
            </h1>
            <p className="text-gray-400 mt-1">Master your time with intelligent daily planning</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              className="border-purple-500/30 hover:bg-purple-500/20 text-purple-400"
              onClick={handleSaveAsTemplate}
              data-testid="button-save-template"
            >
              <Star className="h-4 w-4 mr-2" />
              Save Template
            </Button>
            <Button
              className="bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white"
              onClick={handleAddSlot}
              data-testid="button-add-time-slot"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Time Slot
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-dark-secondary/50 border-b border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-7xl mx-auto">
          <Card className="bg-dark-tertiary border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Layout className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{timeSlots.length}</p>
                  <p className="text-xs text-gray-400">Time Slots</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-tertiary border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalTime.hours}h {totalTime.mins}m</p>
                  <p className="text-xs text-gray-400">Total Scheduled</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-tertiary border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{format(new Date(selectedDate), 'MMM d')}</p>
                  <p className="text-xs text-gray-400">Selected Date</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-tertiary border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-red-500/20 p-2 rounded-lg">
                  <Star className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{timeSlots.filter(s => s.priority === 'high').length}</p>
                  <p className="text-xs text-gray-400">High Priority</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6 max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Label className="text-white">Select Date:</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-dark-secondary border-gray-600 text-white w-48"
              data-testid="input-select-date"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-gray-600 hover:bg-dark-tertiary"
              onClick={handleSortChronologically}
              data-testid="button-sort-chronologically"
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Sort Chronologically
            </Button>
            <Button
              variant="outline"
              className="border-gray-600 hover:bg-dark-tertiary"
              onClick={() => setShowCopyModal(true)}
              data-testid="button-copy-day"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy to Another Day
            </Button>
          </div>
        </div>

        {/* Time Slots List */}
        {timeSlots.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={timeSlots.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {timeSlots.map((slot) => (
                  <SortableTimeSlot
                    key={slot.id}
                    slot={slot}
                    onEdit={handleEditSlot}
                    onDelete={handleDeleteSlot}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-dark-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="h-12 w-12 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Time Slots Yet</h3>
            <p className="text-gray-400 mb-6">Start planning your day by adding time slots</p>
            <Button
              className="bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white"
              onClick={handleAddSlot}
              data-testid="button-add-first-slot"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Time Slot
            </Button>
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      <Dialog open={showAddEditModal} onOpenChange={setShowAddEditModal}>
        <DialogContent className="bg-dark-secondary border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingSlot ? 'Edit Time Slot' : 'Add Time Slot'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingSlot ? 'Update your time slot details' : 'Create a new time slot for your day'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-white">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Morning Workout"
                className="bg-dark-tertiary border-gray-600 text-white mt-1"
                data-testid="input-slot-title"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Category</Label>
                <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="bg-dark-tertiary border-gray-600 text-white mt-1" data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-tertiary border-gray-600">
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="break">Break</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Priority</Label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger className="bg-dark-tertiary border-gray-600 text-white mt-1" data-testid="select-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-tertiary border-gray-600">
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-white">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes..."
                className="bg-dark-tertiary border-gray-600 text-white mt-1"
                rows={3}
                data-testid="textarea-notes"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleSaveSlot}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
                data-testid="button-save-slot"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingSlot ? 'Update' : 'Add'} Slot
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-dark-tertiary"
                onClick={() => setShowAddEditModal(false)}
                data-testid="button-cancel-slot"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Copy to Another Day Modal */}
      <Dialog open={showCopyModal} onOpenChange={setShowCopyModal}>
        <DialogContent className="bg-dark-secondary border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Copy to Another Day</DialogTitle>
            <DialogDescription className="text-gray-400">
              Select a date to copy all {timeSlots.length} time slot(s) from {format(new Date(selectedDate), 'MMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="copyToDate" className="text-white">Select Date *</Label>
              <Input
                id="copyToDate"
                type="date"
                value={copyToDate}
                onChange={(e) => setCopyToDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="bg-dark-tertiary border-gray-600 text-white mt-1"
                data-testid="input-copy-to-date"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleCopyToDay}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
                data-testid="button-confirm-copy"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Time Slots
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-dark-tertiary"
                onClick={() => {
                  setShowCopyModal(false);
                  setCopyToDate('');
                }}
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
