import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, type SignUp } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, GraduationCap, Users, Sparkles } from "lucide-react";

export default function SignUpPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<SignUp>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUp) => {
      return await apiRequest("POST", "/api/auth/signup", data);
    },
    onSuccess: () => {
      toast({
        title: "Welcome to AcademiaFlow!",
        description: "Your account has been created successfully.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Sign up failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignUp) => {
    signUpMutation.mutate(data);
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
            <h2 className="text-2xl font-semibold">Create your account</h2>
            <p className="text-gray-400">
              Join thousands of students excelling in their academic journey
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto">
              <GraduationCap className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-xs text-gray-400">Smart Homework Tracking</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xs text-gray-400">Class Management</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto">
              <Sparkles className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-xs text-gray-400">AI Study Assistant</p>
          </div>
        </div>

        {/* Sign Up Form */}
        <Card className="bg-gray-950 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Sign Up</CardTitle>
            <CardDescription>
              Create your AcademiaFlow account to get started
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">First Name</FormLabel>
                        <FormControl>
                          <Input
                            data-testid="input-first-name"
                            placeholder="John"
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
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Last Name</FormLabel>
                        <FormControl>
                          <Input
                            data-testid="input-last-name"
                            placeholder="Doe"
                            {...field}
                            className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  data-testid="button-signup"
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  disabled={signUpMutation.isPending}
                >
                  {signUpMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
                <div className="text-center text-sm text-gray-400">
                  Already have an account?{" "}
                  <Link href="/signin">
                    <button
                      data-testid="link-signin"
                      type="button"
                      className="text-purple-400 hover:text-purple-300 underline"
                    >
                      Sign in
                    </button>
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
}