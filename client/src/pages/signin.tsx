import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignIn } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, GraduationCap, Users, Sparkles, BookOpen } from "lucide-react";

export default function SignInPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<SignIn>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signInMutation = useMutation({
    mutationFn: async (data: SignIn) => {
      return await apiRequest("POST", "/api/auth/signin", data);
    },
    onSuccess: () => {
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in to AcademiaFlow.",
      });
      // Wait 1 second then redirect to dashboard
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Sign in failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignIn) => {
    signInMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AcademiaFlow
            </h1>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Welcome back</h2>
            <p className="text-gray-400">
              Continue your academic journey with AcademiaFlow
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto">
              <BookOpen className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-xs text-gray-400">Track Progress</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xs text-gray-400">Organize Classes</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto">
              <Sparkles className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-xs text-gray-400">AI Assistant</p>
          </div>
        </div>

        {/* Sign In Form */}
        <Card className="bg-gray-950 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Email</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-email"
                          type="email"
                          placeholder="john@example.com"
                          {...field}
                          className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Password</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-password"
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-purple-400 hover:text-purple-300 underline"
                    onClick={() => {
                      toast({
                        title: "Password Reset",
                        description: "Password reset functionality will be added soon.",
                      });
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  data-testid="button-signin"
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  disabled={signInMutation.isPending}
                >
                  {signInMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
                <div className="text-center text-sm text-gray-400">
                  Don't have an account?{" "}
                  <Link href="/signup">
                    <button
                      data-testid="link-signup"
                      type="button"
                      className="text-purple-400 hover:text-purple-300 underline"
                    >
                      Sign up for free
                    </button>
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {/* Demo credentials */}
        <Card className="bg-gray-950/50 border-gray-800">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="text-sm font-medium text-gray-300">Demo Account</h3>
              <p className="text-xs text-gray-500">
                Try AcademiaFlow with demo credentials:<br />
                Email: demo@academiaflow.com<br />
                Password: demo123
              </p>
              <Button
                data-testid="button-demo"
                variant="outline"
                size="sm"
                className="mt-2 border-gray-700 text-gray-300 hover:bg-gray-800"
                onClick={() => {
                  form.setValue("email", "demo@academiaflow.com");
                  form.setValue("password", "demo123");
                }}
              >
                Use Demo Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          Secure sign in powered by AcademiaFlow authentication
        </div>
      </div>
    </div>
  );
}