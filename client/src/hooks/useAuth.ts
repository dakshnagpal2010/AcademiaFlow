import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const signOut = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/signout");
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signOut: signOut.mutate,
    isSigningOut: signOut.isPending,
  };
}
