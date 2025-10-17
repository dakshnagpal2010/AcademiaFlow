import { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Check, X, Clock, BookOpen, AlertTriangle, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format, isToday, isTomorrow, parseISO } from "date-fns";

interface Notification {
  id: string;
  type: "assignment_due" | "assignment_overdue" | "class_reminder" | "achievement";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: {
    assignmentId?: string;
    classId?: string;
    dueDate?: string;
  };
}

export default function NotificationsPopover() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // In a real app, this would fetch from an API
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: isAuthenticated,
    retry: false,
  });

  const displayNotifications: Notification[] = Array.isArray(notifications) ? notifications : [];
  const unreadCount = displayNotifications.filter((n: Notification) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "assignment_due":
        return <Clock className="h-4 w-4 text-orange-500" />;
      case "assignment_overdue":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "class_reminder":
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case "achievement":
        return <Check className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "assignment_due":
        return "border-l-orange-500";
      case "assignment_overdue":
        return "border-l-red-500";
      case "class_reminder":
        return "border-l-blue-500";
      case "achievement":
        return "border-l-green-500";
      default:
        return "border-l-gray-500";
    }
  };

  const formatNotificationTime = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) {
      return format(date, "h:mm a");
    } else if (isTomorrow(date)) {
      return "Tomorrow";
    } else {
      return format(date, "MMM d");
    }
  };

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
      if (response.status === 204) return;
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", "/api/notifications/mark-all-read");
      if (response.status === 204) return;
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleReload = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    // Add a small delay for visual feedback
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative text-gray-400 hover:text-white hover:bg-dark-tertiary"
          data-testid="notifications-trigger"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 bg-dark-secondary border-gray-700" align="end">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Notifications</h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReload}
                disabled={isRefreshing}
                className="text-gray-400 hover:text-white hover:bg-dark-tertiary"
                data-testid="button-reload-notifications"
                title="Reload notifications"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs text-primary-400 hover:text-primary-300"
                  data-testid="button-mark-all-read"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-400 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <ScrollArea className="h-[500px]">
          {isLoading ? (
            <div className="p-6 text-center text-gray-400">
              <Bell className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Loading notifications...</p>
            </div>
          ) : displayNotifications.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Bell className="h-16 w-16 mx-auto mb-6 opacity-50" />
              <h4 className="font-semibold text-lg mb-3 text-white">No notifications at this time</h4>
              <p className="text-sm leading-relaxed">
                You're all caught up! We'll notify you about upcoming assignments,<br />
                overdue tasks, and important updates here.
              </p>
            </div>
          ) : (
            <div className="p-2">
              {displayNotifications.map((notification: Notification, index: number) => (
                <div key={notification.id}>
                  <div
                    className={`p-3 rounded-lg border-l-4 ${getNotificationColor(
                      notification.type
                    )} ${
                      !notification.read
                        ? "bg-dark-tertiary/50"
                        : "bg-dark-tertiary/20"
                    } cursor-pointer hover:bg-dark-tertiary/80 transition-colors`}
                    onClick={() => markAsRead(notification.id)}
                    data-testid={`notification-${notification.id}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`text-sm font-medium ${
                              !notification.read ? "text-white" : "text-gray-300"
                            }`}
                          >
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p
                          className={`text-sm mt-1 ${
                            !notification.read ? "text-gray-300" : "text-gray-400"
                          }`}
                        >
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatNotificationTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {index < displayNotifications.length - 1 && (
                    <Separator className="my-2 bg-gray-700" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {displayNotifications.length > 0 && (
          <div className="p-3 border-t border-gray-700">
            <Button
              variant="ghost"
              className="w-full text-primary-400 hover:text-primary-300 hover:bg-dark-tertiary"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}