import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, X, Brain, Lightbulb, BarChart3, Sparkles } from "lucide-react";

interface PremiumUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PremiumUpgradeModal({ 
  open, 
  onOpenChange 
}: PremiumUpgradeModalProps) {
  
  const handleStartTrial = () => {
    // TODO: Implement trial signup
    console.log("Starting trial...");
    onOpenChange(false);
  };

  const handleUpgradeNow = () => {
    // TODO: Implement payment flow
    console.log("Upgrading to pro...");
    onOpenChange(false);
  };

  const freeFeatures = [
    "Up to 5 classes",
    "Basic homework tracking",
    "Calendar integration",
    "Simple progress tracking",
  ];

  const proFeatures = [
    "Unlimited classes",
    "Advanced homework tracking",
    "Smart calendar with AI scheduling",
    "AI Study Assistant",
    "Performance Analytics",
    "Custom Study Plans",
    "Priority Support",
    "Advanced Customization",
  ];

  const aiFeatures = [
    {
      icon: Brain,
      title: "Smart Study Plans",
      description: "AI creates personalized study schedules based on your workload",
    },
    {
      icon: Lightbulb,
      title: "Homework Help",
      description: "Get instant explanations and study guidance",
    },
    {
      icon: BarChart3,
      title: "Performance Insights",
      description: "Track your progress with detailed analytics",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark-secondary border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center mb-8">
          <DialogTitle className="text-3xl font-bold text-white mb-2">
            Upgrade to StudyFlow Pro
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-lg">
            Unlock powerful AI features and advanced study tools
          </DialogDescription>
        </DialogHeader>

        {/* Hero Image Placeholder */}
        <div className="w-full h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl mb-8 flex items-center justify-center">
          <div className="text-center">
            <Sparkles className="h-16 w-16 text-purple-400 mx-auto mb-4" />
            <p className="text-purple-300 text-lg font-semibold">Advanced AI Interface</p>
            <p className="text-purple-200 text-sm">Experience the future of studying</p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Free Plan */}
          <div className="bg-dark-tertiary rounded-xl p-6 border border-gray-600">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">Free</h3>
              <div className="text-3xl font-bold text-white mb-2">
                $0<span className="text-lg text-gray-400">/month</span>
              </div>
              <p className="text-gray-400">Perfect for getting started</p>
            </div>
            
            <ul className="space-y-3 mb-6">
              {freeFeatures.map((feature, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300">{feature}</span>
                </li>
              ))}
              <li className="flex items-center space-x-3 opacity-50">
                <X className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-500">AI Study Assistant</span>
              </li>
              <li className="flex items-center space-x-3 opacity-50">
                <X className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-500">Advanced Analytics</span>
              </li>
            </ul>
            
            <Button 
              variant="outline" 
              className="w-full border-gray-600 text-gray-400" 
              disabled
              data-testid="button-current-plan"
            >
              Current Plan
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 border-2 border-purple-500 relative premium-glow">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                Most Popular
              </Badge>
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
              <div className="text-3xl font-bold text-white mb-2">
                $9.99<span className="text-lg text-gray-400">/month</span>
              </div>
              <p className="text-gray-400">Everything you need to excel</p>
            </div>
            
            <ul className="space-y-3 mb-6">
              {proFeatures.map((feature, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <Check className={`h-4 w-4 flex-shrink-0 ${
                    index < 4 ? "text-green-400" : "text-purple-400"
                  }`} />
                  <span className="text-sm text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
              onClick={handleStartTrial}
              data-testid="button-start-trial"
            >
              <Crown className="h-4 w-4 mr-2" />
              Start 7-Day Free Trial
            </Button>
          </div>
        </div>

        {/* AI Features Showcase */}
        <div className="bg-dark-tertiary rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 text-center flex items-center justify-center">
            <Brain className="h-5 w-5 mr-2 text-purple-400" />
            AI Study Assistant Features
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {aiFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <Icon className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <h4 className="font-medium text-white mb-2">{feature.title}</h4>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-dark-tertiary px-6"
            onClick={() => onOpenChange(false)}
            data-testid="button-maybe-later"
          >
            Maybe Later
          </Button>
          <Button
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 px-8"
            onClick={handleUpgradeNow}
            data-testid="button-upgrade-now"
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
