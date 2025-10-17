import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Save, X } from "lucide-react";
import { format } from "date-fns";

interface CalendarNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
}

export default function CalendarNoteModal({ 
  open, 
  onOpenChange, 
  selectedDate 
}: CalendarNoteModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");

  const dateStr = selectedDate ? selectedDate.toISOString().split('T')[0] : '';

  // Fetch existing note for the selected date
  const { data: existingNote } = useQuery<{ note: string } | null>({
    queryKey: [`/api/calendar-notes/${dateStr}`],
    enabled: open && !!selectedDate && !!dateStr,
  });

  // Set note when existing note is loaded
  useEffect(() => {
    if (existingNote && open) {
      setNote(existingNote.note || "");
    } else if (open && selectedDate) {
      setNote("");
    }
  }, [existingNote, open, selectedDate]);

  const saveNoteMutation = useMutation({
    mutationFn: async (data: { date: string; note: string }) => {
      const response = await apiRequest('POST', '/api/calendar-notes', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Note Saved",
        description: "Your calendar note has been saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/calendar-notes'] });
      queryClient.invalidateQueries({ queryKey: [`/api/calendar-notes/${dateStr}`] });
      onOpenChange(false);
      setNote("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!selectedDate) return;
    
    const dateStr = selectedDate.toISOString().split('T')[0];
    saveNoteMutation.mutate({
      date: dateStr,
      note: note.trim(),
    });
  };

  const handleClose = () => {
    setNote("");
    onOpenChange(false);
  };

  if (!selectedDate) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-dark-secondary border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary-500" />
            Add Note for {format(selectedDate, "MMMM d, yyyy")}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Add a personal note or reminder for this date.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary-500/50 text-primary-400">
              {format(selectedDate, "EEEE")}
            </Badge>
            <Badge variant="outline" className="border-gray-600 text-gray-300">
              {format(selectedDate, "MMM d, yyyy")}
            </Badge>
          </div>

          <div>
            <Label htmlFor="calendarNote" className="text-white">
              Note
            </Label>
            <Textarea
              id="calendarNote"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add your note, reminder, or thoughts for this date..."
              className="bg-dark-tertiary border-gray-600 text-white mt-1 min-h-[120px]"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {note.length}/500 characters
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              onClick={handleSave}
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
              disabled={!note.trim() || saveNoteMutation.isPending}
            >
              {saveNoteMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Note
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-dark-tertiary"
              onClick={handleClose}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}