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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
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
    classId: "",
    priority: "medium",
    estimatedHours: "",
    dueDate: undefined as Date | undefined,
  });

  // Classes query for the dropdown
  const { data: classes } = useQuery({
    queryKey: ["/api/classes"],
    retry: false,
  });

  const addAssignmentMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/assignments", {
        ...data,
        estimatedHours: data.estimatedHours ? parseInt(data.estimatedHours) : undefined,
        dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
      });
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
        classId: "",
        priority: "medium",
        estimatedHours: "",
        dueDate: undefined,
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
                <SelectItem value="">No class</SelectItem>
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
