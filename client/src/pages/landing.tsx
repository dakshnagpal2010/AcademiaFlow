import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Users, 
  Sparkles, 
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  ArrowRight
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Logo and Brand */}
          <div className="flex items-center justify-center space-x-3">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AcademiaFlow
            </h1>
          </div>

          {/* Hero Headline */}
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold leading-tight">
              The Future of
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {" "}Student Productivity
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Revolutionize your academic journey with intelligent homework tracking, 
              seamless class management, and AI-powered study assistance.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup">
              <Button 
                data-testid="button-get-started"
                size="lg" 
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-lg px-8 py-6"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/signin">
              <Button 
                data-testid="button-sign-in"
                variant="outline" 
                size="lg" 
                className="border-gray-700 text-white hover:bg-gray-800 text-lg px-8 py-6"
              >
                Sign In
              </Button>
            </Link>
          </div>

        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-12">
          <div className="space-y-4">
            <h3 className="text-3xl font-bold">Powerful Features for Academic Success</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Everything you need to stay organized, motivated, and ahead in your studies.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Smart Homework Tracking */}
            <Card className="bg-gray-950 border-gray-800 hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">Smart Homework Tracking</CardTitle>
                <CardDescription>
                  Never miss a deadline with intelligent assignment management and priority sorting.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Automatic deadline reminders</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Priority-based organization</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Progress tracking</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Class Management */}
            <Card className="bg-gray-950 border-gray-800 hover:border-blue-500/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <CardTitle className="text-white">Class Management</CardTitle>
                <CardDescription>
                  Organize all your courses with detailed information and visual schedules.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Course details & schedules</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Color-coded organization</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Quick assignment creation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Calendar Integration */}
            <Card className="bg-gray-950 border-gray-800 hover:border-green-500/50 transition-colors md:col-span-2 lg:col-span-1">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-green-400" />
                </div>
                <CardTitle className="text-white">Calendar Integration</CardTitle>
                <CardDescription>
                  Visualize your academic schedule with an intuitive calendar view.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Monthly & weekly views</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Assignment visualization</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Deadline tracking</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* AI Study Assistant */}
            <Card className="bg-gray-950 border-gray-800 hover:border-yellow-500/50 transition-colors md:col-span-2 lg:col-span-1">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                  </div>
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    Premium
                  </Badge>
                </div>
                <CardTitle className="text-white">AI Study Assistant</CardTitle>
                <CardDescription>
                  Get personalized study recommendations and academic insights powered by AI.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Personalized study plans</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Performance analytics</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Smart recommendations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Analytics & Insights */}
            <Card className="bg-gray-950 border-gray-800 hover:border-cyan-500/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-cyan-400" />
                </div>
                <CardTitle className="text-white">Analytics & Insights</CardTitle>
                <CardDescription>
                  Track your academic progress with detailed analytics and performance metrics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Study streak tracking</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Completion statistics</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Progress visualizations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Customization */}
            <Card className="bg-gray-950 border-gray-800 hover:border-pink-500/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-pink-400" />
                </div>
                <CardTitle className="text-white">Full Customization</CardTitle>
                <CardDescription>
                  Personalize your AcademiaFlow experience with extensive customization options.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Custom themes & colors</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Profile personalization</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Layout preferences</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20 max-w-4xl mx-auto">
          <CardContent className="text-center space-y-6 py-12">
            <h3 className="text-3xl font-bold">Ready to Transform Your Study Experience?</h3>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Join thousands of students who have already revolutionized their academic journey with AcademiaFlow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button 
                  data-testid="button-start-free"
                  size="lg" 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-lg px-8 py-6"
                >
                  Start Free Today
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/signin">
                <Button 
                  data-testid="button-sign-in-footer"
                  variant="outline" 
                  size="lg" 
                  className="border-gray-700 text-white hover:bg-gray-800 text-lg px-8 py-6"
                >
                  Already have an account?
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>&copy; 2024 AcademiaFlow. Empowering student success through intelligent productivity.</p>
        </div>
      </footer>
    </div>
  );
}