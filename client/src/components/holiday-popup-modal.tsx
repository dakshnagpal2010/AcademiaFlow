import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Flag } from "lucide-react";

interface HolidayPopupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holidayName: string;
  onComplete: () => void;
}

export default function HolidayPopupModal({ 
  open, 
  onOpenChange, 
  holidayName,
  onComplete
}: HolidayPopupModalProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (open) {
      // Trigger confetti animation
      const duration = 5000;
      const end = Date.now() + duration;

      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();

      // Start countdown
      setCountdown(5);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onOpenChange(false);
            // Small delay before showing notes modal
            setTimeout(() => {
              onComplete();
            }, 100);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    }
  }, [open, onOpenChange, onComplete]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark-secondary border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2 justify-center text-2xl">
            <Flag className="h-8 w-8 text-red-500" />
            {holidayName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="text-6xl">🎉</div>
            <Badge variant="outline" className="border-red-500/50 text-red-400 text-lg px-4 py-2">
              Holiday Celebration!
            </Badge>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Opening notes in <span className="text-primary-500 font-bold text-xl">{countdown}</span> seconds...
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
