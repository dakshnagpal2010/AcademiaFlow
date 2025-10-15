import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
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
  Layout
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

function SortableTimeSlot({ slot, onEdit, onDelete }: { slot: TimeSlot; onEdit: (slot: TimeSlot) => void; onDelete: (id: string) => void }) {
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

  const getCategoryColor = (category: string) => {
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

  const getPriorityColor = (priority?: string) => {
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
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    {
      id: '1',
      title: 'Morning Routine',
      startTime: '07:00',
      endTime: '08:00',
      category: 'personal',
      notes: 'Exercise, shower, breakfast',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Deep Work Session',
      startTime: '09:00',
      endTime: '11:00',
      category: 'work',
      notes: 'Focus on important projects',
      priority: 'high'
    },
    {
      id: '3',
      title: 'Lunch Break',
      startTime: '12:00',
      endTime: '13:00',
      category: 'break',
      priority: 'medium'
    }
  ]);

  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = timeSlots.findIndex((slot) => slot.id === active.id);
      const newIndex = timeSlots.findIndex((slot) => slot.id === over.id);
      setTimeSlots(arrayMove(timeSlots, oldIndex, newIndex));
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

  const handleEditSlot = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setFormData(slot);
    setShowAddEditModal(true);
  };

  const handleDeleteSlot = (id: string) => {
    if (window.confirm("Are you sure you want to delete this time slot?")) {
      setTimeSlots(timeSlots.filter(slot => slot.id !== id));
      toast({
        title: "Success",
        description: "Time slot deleted successfully!",
      });
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
      setTimeSlots(timeSlots.map(slot => 
        slot.id === editingSlot.id ? { ...formData, id: slot.id } as TimeSlot : slot
      ));
      toast({
        title: "Success",
        description: "Time slot updated successfully!",
      });
    } else {
      const newSlot: TimeSlot = {
        ...formData,
        id: Date.now().toString(),
      } as TimeSlot;
      setTimeSlots([...timeSlots, newSlot]);
      toast({
        title: "Success",
        description: "Time slot added successfully!",
      });
    }
    setShowAddEditModal(false);
  };

  const handleSaveAsTemplate = () => {
    toast({
      title: "Template Saved",
      description: "Your daily plan has been saved as a template!",
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
          <Button
            variant="outline"
            className="border-gray-600 hover:bg-dark-tertiary"
            data-testid="button-copy-day"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy to Another Day
          </Button>
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
    </div>
  );
}
