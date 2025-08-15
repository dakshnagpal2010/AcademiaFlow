import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Calendar, CheckCircle, Brain, BarChart3, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-primary text-white">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-purple-500/20 to-transparent"></div>
        <div className="relative container mx-auto px-6 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent">
                StudyFlow
              </h1>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Smart Student
              <br />
              <span className="bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent">
                Productivity Platform
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Transform your academic journey with AI-powered homework tracking, intelligent class management, 
              and personalized study insights that help you excel.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white px-8 py-3 text-lg font-semibold"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-get-started"
              >
                Get Started Free
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white px-8 py-3 text-lg"
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-dark-secondary/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">Everything You Need to Succeed</h3>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Powerful tools designed specifically for modern students who want to stay organized and achieve their academic goals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-dark-secondary border-gray-700 hover-lift">
              <CardHeader>
                <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-primary-500" />
                </div>
                <CardTitle className="text-white">Smart Homework Tracking</CardTitle>
                <CardDescription className="text-gray-400">
                  Never miss a deadline with intelligent assignment management and priority-based organization.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-dark-secondary border-gray-700 hover-lift">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle className="text-white">Class Management</CardTitle>
                <CardDescription className="text-gray-400">
                  Organize your courses, track schedules, and manage all your academic commitments in one place.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-dark-secondary border-gray-700 hover-lift">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle className="text-white">Progress Analytics</CardTitle>
                <CardDescription className="text-gray-400">
                  Visualize your academic progress with detailed insights and performance tracking.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 hover-lift premium-glow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/30 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-purple-400" />
                </div>
                <CardTitle className="text-white flex items-center gap-2">
                  AI Study Assistant
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full">PRO</span>
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Get personalized study recommendations and AI-powered homework help to maximize your learning.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-dark-secondary border-gray-700 hover-lift">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle className="text-white">Quick Actions</CardTitle>
                <CardDescription className="text-gray-400">
                  Streamlined interface with shortcuts for adding classes, assignments, and accessing key features.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-dark-secondary border-gray-700 hover-lift">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="h-6 w-6 text-orange-500" />
                </div>
                <CardTitle className="text-white">Custom Themes</CardTitle>
                <CardDescription className="text-gray-400">
                  Personalize your workspace with multiple themes and customization options to match your style.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500/10 to-purple-500/10">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-4xl font-bold mb-6">Ready to Transform Your Studies?</h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already using StudyFlow to achieve their academic goals.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white px-12 py-4 text-xl font-semibold"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-start-free-trial"
          >
            Start Your Free Trial
          </Button>
          <p className="text-sm text-gray-400 mt-4">No credit card required • 7-day free trial</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-dark-secondary border-t border-gray-700">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent">
              StudyFlow
            </span>
          </div>
          <p className="text-gray-400">
            © 2024 StudyFlow. All rights reserved. Empowering students worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}
