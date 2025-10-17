import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddClassModal({ 
  open, 
  onOpenChange 
}: AddClassModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    instructor: "",
    room: "",
    credits: "",
    description: "",
    color: "#3b82f6",
    gpaScale: "5.0",
  });

  const addClassMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/classes", {
        ...data,
        credits: data.credits ? parseInt(data.credits) : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Class added successfully!",
      });
      onOpenChange(false);
      setFormData({
        name: "",
        code: "",
        instructor: "",
        room: "",
        credits: "",
        description: "",
        color: "#3b82f6",
        gpaScale: "5.0",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add class. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Class name is required.",
        variant: "destructive",
      });
      return;
    }
    addClassMutation.mutate(formData);
  };

  const colorOptions = [
    "#3b82f6", // Blue
    "#a855f7", // Purple
    "#10b981", // Green
    "#f59e0b", // Orange
    "#ef4444", // Red
    "#8b5cf6", // Violet
    "#06b6d4", // Cyan
    "#f97316", // Orange-600
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark-secondary border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Class</DialogTitle>
          <DialogDescription className="text-gray-400">
            Add a new class to your schedule
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="className" className="text-white">Class Name *</Label>
            <Input
              id="className"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Introduction to Computer Science"
              className="bg-dark-tertiary border-gray-600 text-white mt-1"
              data-testid="input-class-name"
              required
            />
          </div>

          <div>
            <Label htmlFor="classCode" className="text-white">Course Code</Label>
            <Input
              id="classCode"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g., CS 101"
              className="bg-dark-tertiary border-gray-600 text-white mt-1"
              data-testid="input-class-code"
            />
          </div>

          <div>
            <Label htmlFor="instructor" className="text-white">Instructor</Label>
            <Input
              id="instructor"
              value={formData.instructor}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              placeholder="e.g., Dr. Smith"
              className="bg-dark-tertiary border-gray-600 text-white mt-1"
              data-testid="input-instructor"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="room" className="text-white">Room</Label>
              <Input
                id="room"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="e.g., Room 101"
                className="bg-dark-tertiary border-gray-600 text-white mt-1"
                data-testid="input-room"
              />
            </div>
            <div>
              <Label htmlFor="credits" className="text-white">Credits</Label>
              <Input
                id="credits"
                type="number"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                placeholder="3"
                min="1"
                max="6"
                className="bg-dark-tertiary border-gray-600 text-white mt-1"
                data-testid="input-credits"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="gpaScale" className="text-white">GPA Scale</Label>
            <Select value={formData.gpaScale} onValueChange={(value) => setFormData({ ...formData, gpaScale: value })}>
              <SelectTrigger className="bg-dark-tertiary border-gray-600 text-white mt-1" data-testid="select-gpa-scale">
                <SelectValue placeholder="Select GPA Scale" />
              </SelectTrigger>
              <SelectContent className="bg-dark-secondary border-gray-700">
                <SelectItem value="NA" className="text-white hover:bg-dark-tertiary">NA (Not Graded)</SelectItem>
                <SelectItem value="5.0" className="text-white hover:bg-dark-tertiary">5.0 (On-Level)</SelectItem>
                <SelectItem value="5.5" className="text-white hover:bg-dark-tertiary">5.5 (Pre-AP/Advanced)</SelectItem>
                <SelectItem value="6.0" className="text-white hover:bg-dark-tertiary">6.0 (AP/Honors)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white mb-2 block">Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    formData.color === color
                      ? "border-white scale-110"
                      : "border-gray-600 hover:border-gray-400"
                  }`}
                  style={{ backgroundColor: color }}
                  data-testid={`button-color-${color}`}
                />
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional class description..."
              className="bg-dark-tertiary border-gray-600 text-white mt-1"
              rows={3}
              data-testid="textarea-description"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
              disabled={addClassMutation.isPending}
              data-testid="button-add-class"
            >
              {addClassMutation.isPending ? "Adding..." : "Add Class"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-dark-tertiary"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-add-class"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
