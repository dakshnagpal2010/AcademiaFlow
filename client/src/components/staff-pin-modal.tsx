import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, CheckCircle, Crown } from "lucide-react";

interface StaffPinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStaffModeActivated?: () => void;
}

export default function StaffPinModal({ open, onOpenChange, onStaffModeActivated }: StaffPinModalProps) {
  const { toast } = useToast();
  const [pin, setPin] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin === "unlock12345") {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onOpenChange(false);
        setPin("");
        if (onStaffModeActivated) {
          onStaffModeActivated();
        }
      }, 3000);
    } else {
      toast({
        title: "Invalid PIN",
        description: "The PIN you entered is incorrect. Please try again.",
        variant: "destructive",
      });
      setPin("");
    }
  };

  const handleClose = () => {
    setPin("");
    setShowSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-dark-secondary border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-yellow-500" />
            Staff Access Required
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            This feature is restricted to staff members only.
          </DialogDescription>
        </DialogHeader>

        {!showSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="staffPin" className="text-white">
                Enter Staff PIN
              </Label>
              <Input
                id="staffPin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN to proceed"
                className="bg-dark-tertiary border-gray-600 text-white mt-1"
                maxLength={20}
                autoFocus
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
                disabled={!pin.trim()}
              >
                Verify PIN
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-dark-tertiary"
                onClick={handleClose}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-4 py-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                You have entered staff mode
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                AI mode and other premium features have still not been released.
              </p>
            </div>
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg p-4 mt-4">
              <h4 className="font-medium text-orange-300 mb-2">Features in Development:</h4>
              <ul className="text-sm text-gray-300 space-y-1 text-left">
                <li>• AI-powered study assistant</li>
                <li>• Advanced progress analytics</li>
                <li>• Smart study recommendations</li>
                <li>• Automated scheduling optimization</li>
              </ul>
              <p className="text-xs text-gray-400 mt-3">
                Thank you for your understanding. All current features remain fully functional.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}