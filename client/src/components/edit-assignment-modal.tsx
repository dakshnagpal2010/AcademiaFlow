import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateAssignmentSchema, type UpdateAssignment } from "@shared/schema";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, Palette, Repeat } from "lucide-react";
import { format } from "date-fns";

interface EditAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: string | null;
}

export default function EditAssignmentModal({ 
  open, 
  onOpenChange,
  assignmentId
}: EditAssignmentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Classes query for the dropdown
  const { data: classes } = useQuery({
    queryKey: ["/api/classes"],
    retry: false,
  });

  // Get assignment data
  const { data: assignments } = useQuery({
    queryKey: ["/api/assignments"],
    retry: false,
  });

  const assignment = Array.isArray(assignments) ? assignments.find((a: any) => a.id === assignmentId) : undefined;

  const [color, setColor] = useState("#3b82f6");
  const [showOnCalendar, setShowOnCalendar] = useState(true);
  const [repeatPattern, setRepeatPattern] = useState("none");
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [repeatUntil, setRepeatUntil] = useState<Date | undefined>(undefined);

  const form = useForm<UpdateAssignment>({
    resolver: zodResolver(updateAssignmentSchema),
    defaultValues: {
      title: "",
      description: "",
      classId: "none",
      priority: "medium",
      estimatedHours: "",
      dueDate: undefined,
    },
  });

  // Update form when assignment data changes
  useEffect(() => {
    if (assignment) {
      form.reset({
        title: assignment.title || "",
        description: assignment.description || "",
        classId: assignment.classId || "none",
        priority: assignment.priority || "medium",
        estimatedHours: assignment.estimatedHours ? String(assignment.estimatedHours) : "",
        dueDate: assignment.dueDate ? new Date(assignment.dueDate) : undefined,
      });
      setColor(assignment.color || "#3b82f6");
      setShowOnCalendar(assignment.showOnCalendar !== undefined ? assignment.showOnCalendar : true);
      setRepeatPattern(assignment.repeatPattern || "none");
      setRepeatDays(assignment.repeatDays ? JSON.parse(assignment.repeatDays) : []);
      setRepeatUntil(assignment.repeatUntil ? new Date(assignment.repeatUntil) : undefined);
    }
  }, [assignment, form]);

  const updateAssignmentMutation = useMutation({
    mutationFn: async (data: UpdateAssignment) => {
      if (!assignmentId) throw new Error("No assignment ID");
      
      const updateData = {
        ...data,
        classId: data.classId === "none" ? null : data.classId,
        estimatedHours: data.estimatedHours ? Number(data.estimatedHours) : undefined,
        color,
        showOnCalendar,
        repeatPattern: repeatPattern === "none" ? null : repeatPattern,
        repeatDays: repeatPattern === "weekly" ? JSON.stringify(repeatDays) : null,
        repeatUntil: repeatPattern !== "none" ? repeatUntil : null,
      };

      const response = await apiRequest("PATCH", `/api/assignments/${assignmentId}`, updateData);
      if (response.status === 204) return;
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assignments/upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Assignment updated successfully!",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateAssignment) => {
    updateAssignmentMutation.mutate(data);
  };

  if (!assignment && assignmentId) {
    return null; // Assignment not found
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark-secondary border-gray-700 max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Assignment</DialogTitle>
          <DialogDescription className="text-gray-400">
            Update your assignment details
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Assignment Title *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="e.g., Math Homework Chapter 5"
                      className="bg-dark-tertiary border-gray-600 text-white"
                      data-testid="input-edit-assignment-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Class</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger 
                        className="bg-dark-tertiary border-gray-600 text-white" 
                        data-testid="select-edit-class"
                      >
                        <SelectValue placeholder="Select a class (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-dark-tertiary border-gray-600">
                      <SelectItem value="none">No class</SelectItem>
                      {Array.isArray(classes) && classes.map((classItem: any) => (
                        <SelectItem key={classItem.id} value={classItem.id}>
                          {classItem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder="Optional description of the assignment..."
                      className="bg-dark-tertiary border-gray-600 text-white"
                      rows={3}
                      data-testid="textarea-edit-assignment-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger 
                          className="bg-dark-tertiary border-gray-600 text-white" 
                          data-testid="select-edit-priority"
                        >
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-dark-tertiary border-gray-600">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Estimated Hours</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        type="number"
                        placeholder="e.g., 2"
                        min="0.5"
                        step="0.5"
                        className="bg-dark-tertiary border-gray-600 text-white"
                        data-testid="input-edit-estimated-hours"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left bg-dark-tertiary border-gray-600 text-white hover:bg-dark-secondary"
                          data-testid="button-edit-due-date"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : "Select due date (optional)"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-dark-tertiary border-gray-600" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="text-white"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  ].map((colorOption) => (
                    <button
                      key={colorOption}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        color === colorOption ? "border-white" : "border-gray-600"
                      }`}
                      style={{ backgroundColor: colorOption }}
                      onClick={() => setColor(colorOption)}
                      data-testid={`edit-color-option-${colorOption}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Calendar Visibility */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-showOnCalendar"
                checked={showOnCalendar}
                onCheckedChange={(checked) => setShowOnCalendar(!!checked)}
                data-testid="checkbox-edit-show-on-calendar"
              />
              <Label htmlFor="edit-showOnCalendar" className="text-white cursor-pointer">
                Show on Calendar
              </Label>
            </div>

            {/* Repeat Pattern */}
            <div>
              <Label className="text-white">Repeat Pattern</Label>
              <Select
                value={repeatPattern}
                onValueChange={(value) => {
                  setRepeatPattern(value);
                  setRepeatDays([]);
                }}
              >
                <SelectTrigger className="bg-dark-tertiary border-gray-600 text-white mt-1" data-testid="select-edit-repeat-pattern">
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
            {repeatPattern === "weekly" && (
              <div>
                <Label className="text-white">Repeat on Days</Label>
                <div className="grid grid-cols-7 gap-2 mt-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                    <div key={day} className="flex items-center">
                      <Checkbox
                        checked={repeatDays.includes(index)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setRepeatDays([...repeatDays, index].sort());
                          } else {
                            setRepeatDays(repeatDays.filter(d => d !== index));
                          }
                        }}
                        className="mr-1"
                        data-testid={`edit-checkbox-day-${index}`}
                      />
                      <Label className="text-xs text-gray-300">{day}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Repeat Until */}
            {repeatPattern !== "none" && (
              <div>
                <Label className="text-white">Repeat Until (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left bg-dark-tertiary border-gray-600 text-white hover:bg-dark-secondary mt-1"
                      data-testid="button-edit-repeat-until"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {repeatUntil ? format(repeatUntil, "PPP") : "Select end date (optional)"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-dark-tertiary border-gray-600" align="start">
                    <Calendar
                      mode="single"
                      selected={repeatUntil}
                      onSelect={(date) => setRepeatUntil(date)}
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
                disabled={updateAssignmentMutation.isPending}
                data-testid="button-save-assignment"
              >
                {updateAssignmentMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-dark-tertiary"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-edit-assignment"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}