import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Crown, 
  Sparkles, 
  Brain, 
  TrendingUp, 
  Calendar,
  Bot,
  CheckCircle,
  Zap
} from "lucide-react";

interface PremiumUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PremiumUpgradeModal({ open, onOpenChange }: PremiumUpgradeModalProps) {
  const { toast } = useToast();

  const handleUpgrade = () => {
    toast({
      title: "Premium Upgrade",
      description: "Premium upgrade functionality will be available soon! Stay tuned for AI-powered features.",
    });
    onOpenChange(false);
  };

  const premiumFeatures = [
    {
      icon: Brain,
      title: "AI Study Assistant",
      description: "Get personalized study recommendations and insights",
      highlight: true,
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      description: "Deep insights into your study patterns and performance",
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "AI-powered optimal study schedule generation",
    },
    {
      icon: Bot,
      title: "24/7 AI Tutor",
      description: "Ask questions and get instant academic help",
    },
    {
      icon: Zap,
      title: "Priority Support",
      description: "Get help faster with premium support",
    },
    {
      icon: Sparkles,
      title: "Exclusive Features",
      description: "Early access to new features and beta testing",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-gray-950 border-gray-800 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Crown className="h-6 w-6 text-yellow-400" />
            <span>Upgrade to AcademiaFlow Pro</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Unlock AI-powered features and advanced analytics to supercharge your academic success.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Free Plan */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-300">Free Plan</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="text-2xl font-bold text-white">$0<span className="text-sm font-normal">/month</span></div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Basic homework tracking</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Class management</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Calendar integration</span>
                </div>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/50 relative">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                Most Popular
              </Badge>
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  <span>Pro Plan</span>
                </CardTitle>
                <CardDescription>AI-powered academic excellence</CardDescription>
                <div className="text-3xl font-bold text-white">
                  $9.99<span className="text-sm font-normal">/month</span>
                </div>
                <p className="text-xs text-gray-400">Everything in Free, plus:</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {premiumFeatures.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>{feature.title}</span>
                  </div>
                ))}
                <p className="text-xs text-purple-400 mt-2">+ 3 more premium features</p>
              </CardContent>
            </Card>
          </div>

          {/* Premium Features Grid */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <span>Premium Features</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {premiumFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border transition-colors ${
                    feature.highlight 
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/50' 
                      : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      feature.highlight ? 'bg-purple-500/20' : 'bg-gray-800'
                    }`}>
                      <feature.icon className={`h-5 w-5 ${
                        feature.highlight ? 'text-purple-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{feature.title}</h4>
                      <p className="text-sm text-gray-400 mt-1">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center space-y-4 p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
            <h3 className="text-xl font-semibold text-white">Ready to supercharge your studies?</h3>
            <p className="text-gray-400">Join thousands of students who are already excelling with AcademiaFlow Pro.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                data-testid="button-upgrade-now"
                onClick={handleUpgrade}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                size="lg"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
                size="lg"
              >
                Maybe Later
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              30-day money-back guarantee • Cancel anytime
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}