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
import { Shield, CheckCircle } from "lucide-react";

interface StaffPinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StaffPinModal({ open, onOpenChange }: StaffPinModalProps) {
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
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Premium Features Unlocked!
              </h3>
              <p className="text-gray-400">
                You have unlocked all premium features. They will be available soon, sorry for the inconvenience.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}