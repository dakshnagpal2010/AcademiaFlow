import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Palette, Repeat } from "lucide-react";
import { format } from "date-fns";

interface AddHomeworkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddHomeworkModal({ 
  open, 
  onOpenChange 
}: AddHomeworkModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    classId: "none",
    priority: "medium",
    estimatedHours: "",
    dueDate: undefined as Date | undefined,
    color: "#3b82f6",
    showOnCalendar: true,
    repeatPattern: "none",
    repeatDays: [] as number[],
    repeatUntil: undefined as Date | undefined,
  });

  // Classes query for the dropdown
  const { data: classes } = useQuery({
    queryKey: ["/api/classes"],
    retry: false,
  });

  const addAssignmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/assignments", {
        ...data,
        classId: data.classId === "none" ? null : data.classId,
        estimatedHours: data.estimatedHours ? parseInt(data.estimatedHours) : undefined,
        dueDate: data.dueDate || undefined,
        repeatDays: data.repeatPattern === "weekly" ? JSON.stringify(data.repeatDays) : null,
        repeatUntil: data.repeatPattern !== "none" && data.repeatUntil ? data.repeatUntil.toISOString() : null,
        repeatPattern: data.repeatPattern === "none" ? null : data.repeatPattern,
      });
      if (response.status === 204) return;
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assignments/upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Assignment added successfully!",
      });
      onOpenChange(false);
      setFormData({
        title: "",
        description: "",
        classId: "none",
        priority: "medium",
        estimatedHours: "",
        dueDate: undefined,
        color: "#3b82f6",
        showOnCalendar: true,
        repeatPattern: "none",
        repeatDays: [],
        repeatUntil: undefined,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Assignment title is required.",
        variant: "destructive",
      });
      return;
    }
    addAssignmentMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark-secondary border-gray-700 max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Assignment</DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a new homework assignment or task
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="assignmentTitle" className="text-white">Assignment Title *</Label>
            <Input
              id="assignmentTitle"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Math Homework Chapter 5"
              className="bg-dark-tertiary border-gray-600 text-white mt-1"
              data-testid="input-assignment-title"
              required
            />
          </div>

          <div>
            <Label htmlFor="class" className="text-white">Class</Label>
            <Select
              value={formData.classId}
              onValueChange={(value) => setFormData({ ...formData, classId: value })}
            >
              <SelectTrigger className="bg-dark-tertiary border-gray-600 text-white mt-1" data-testid="select-class">
                <SelectValue placeholder="Select a class (optional)" />
              </SelectTrigger>
              <SelectContent className="bg-dark-tertiary border-gray-600">
                <SelectItem value="none">No class</SelectItem>
                {Array.isArray(classes) && classes.map((classItem: any) => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description of the assignment..."
              className="bg-dark-tertiary border-gray-600 text-white mt-1"
              rows={3}
              data-testid="textarea-assignment-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority" className="text-white">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger className="bg-dark-tertiary border-gray-600 text-white mt-1" data-testid="select-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-dark-tertiary border-gray-600">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="estimatedHours" className="text-white">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                placeholder="e.g., 2"
                min="0.5"
                step="0.5"
                className="bg-dark-tertiary border-gray-600 text-white mt-1"
                data-testid="input-estimated-hours"
              />
            </div>
          </div>

          <div>
            <Label className="text-white">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left bg-dark-tertiary border-gray-600 text-white hover:bg-dark-secondary mt-1"
                  data-testid="button-due-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dueDate ? format(formData.dueDate, "PPP") : "Select due date (optional)"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-dark-tertiary border-gray-600" align="start">
                <Calendar
                  mode="single"
                  selected={formData.dueDate}
                  onSelect={(date) => setFormData({ ...formData, dueDate: date })}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="text-white"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Color Picker */}
          <div>
            <Label className="text-white">Event Color</Label>
            <div className="flex items-center space-x-3 mt-2">
              <Palette className="h-4 w-4 text-gray-400" />
              <div className="flex space-x-2 flex-wrap">
                {[
                  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", 
                  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
                  "#f97316", "#6366f1", "#14b8a6", "#eab308"
                ].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? "border-white" : "border-gray-600"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                    data-testid={`color-option-${color}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Calendar Visibility */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showOnCalendar"
              checked={formData.showOnCalendar}
              onCheckedChange={(checked) => setFormData({ ...formData, showOnCalendar: !!checked })}
              data-testid="checkbox-show-on-calendar"
            />
            <Label htmlFor="showOnCalendar" className="text-white cursor-pointer">
              Show on Calendar
            </Label>
          </div>

          {/* Repeat Pattern */}
          <div>
            <Label className="text-white">Repeat Pattern</Label>
            <Select
              value={formData.repeatPattern}
              onValueChange={(value) => setFormData({ ...formData, repeatPattern: value, repeatDays: [] })}
            >
              <SelectTrigger className="bg-dark-tertiary border-gray-600 text-white mt-1" data-testid="select-repeat-pattern">
                <Repeat className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-tertiary border-gray-600">
                <SelectItem value="none">No Repeat</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Weekly Repeat Days */}
          {formData.repeatPattern === "weekly" && (
            <div>
              <Label className="text-white">Repeat on Days</Label>
              <div className="grid grid-cols-7 gap-2 mt-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                  <div key={day} className="flex items-center">
                    <Checkbox
                      checked={formData.repeatDays.includes(index)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            repeatDays: [...formData.repeatDays, index].sort()
                          });
                        } else {
                          setFormData({
                            ...formData,
                            repeatDays: formData.repeatDays.filter(d => d !== index)
                          });
                        }
                      }}
                      className="mr-1"
                      data-testid={`checkbox-day-${index}`}
                    />
                    <Label className="text-xs text-gray-300">{day}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Repeat Until */}
          {formData.repeatPattern !== "none" && (
            <div>
              <Label className="text-white">Repeat Until (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left bg-dark-tertiary border-gray-600 text-white hover:bg-dark-secondary mt-1"
                    data-testid="button-repeat-until"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.repeatUntil ? format(formData.repeatUntil, "PPP") : "Select end date (optional)"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-dark-tertiary border-gray-600" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.repeatUntil}
                    onSelect={(date) => setFormData({ ...formData, repeatUntil: date })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
              disabled={addAssignmentMutation.isPending}
              data-testid="button-add-assignment"
            >
              {addAssignmentMutation.isPending ? "Adding..." : "Add Assignment"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-dark-tertiary"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-add-assignment"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
