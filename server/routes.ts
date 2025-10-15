import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import {
  insertClassSchema,
  insertAssignmentSchema,
  updateUserSchema,
  updateClassSchema,
  updateAssignmentSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // User routes
  app.patch('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const updates = updateUserSchema.parse(req.body);
      const updatedUser = await storage.updateUser(userId, updates);
      
      // Log activity
      await storage.createActivity({
        userId,
        type: 'profile_updated',
        description: 'Updated profile information',
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Class routes
  app.get('/api/classes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const classes = await storage.getClasses(userId);
      res.json(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  app.post('/api/classes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const classData = insertClassSchema.parse({ ...req.body, userId });
      const newClass = await storage.createClass(classData);
      
      // Log activity
      await storage.createActivity({
        userId,
        type: 'class_added',
        description: `Added new class: ${newClass.name}`,
        metadata: { classId: newClass.id },
      });
      
      res.json(newClass);
    } catch (error) {
      console.error("Error creating class:", error);
      res.status(500).json({ message: "Failed to create class" });
    }
  });

  app.patch('/api/classes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = updateClassSchema.parse(req.body);
      const updatedClass = await storage.updateClass(id, updates);
      res.json(updatedClass);
    } catch (error) {
      console.error("Error updating class:", error);
      res.status(500).json({ message: "Failed to update class" });
    }
  });

  app.delete('/api/classes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;
      
      const classData = await storage.getClass(id);
      await storage.deleteClass(id);
      
      // Log activity
      await storage.createActivity({
        userId,
        type: 'class_deleted',
        description: `Deleted class: ${classData?.name || 'Unknown'}`,
      });
      
      res.json({ message: "Class deleted successfully" });
    } catch (error) {
      console.error("Error deleting class:", error);
      res.status(500).json({ message: "Failed to delete class" });
    }
  });

  app.post('/api/classes/reorder', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const { classIds } = z.object({ classIds: z.array(z.string()) }).parse(req.body);
      await storage.reorderClasses(userId, classIds);
      res.json({ message: "Classes reordered successfully" });
    } catch (error) {
      console.error("Error reordering classes:", error);
      res.status(500).json({ message: "Failed to reorder classes" });
    }
  });

  // Assignment routes
  app.get('/api/assignments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const assignments = await storage.getAssignments(userId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.get('/api/assignments/upcoming', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const assignments = await storage.getUpcomingAssignments(userId, limit);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching upcoming assignments:", error);
      res.status(500).json({ message: "Failed to fetch upcoming assignments" });
    }
  });

  app.post('/api/assignments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const assignmentData = insertAssignmentSchema.parse({ ...req.body, userId });
      const newAssignment = await storage.createAssignment(assignmentData);
      
      // Log activity
      await storage.createActivity({
        userId,
        type: 'assignment_added',
        description: `Added new assignment: ${newAssignment.title}`,
        metadata: { assignmentId: newAssignment.id },
      });
      
      res.json(newAssignment);
    } catch (error) {
      console.error("Error creating assignment:", error);
      res.status(500).json({ message: "Failed to create assignment" });
    }
  });

  app.patch('/api/assignments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = updateAssignmentSchema.parse(req.body);
      const updatedAssignment = await storage.updateAssignment(id, updates);
      res.json(updatedAssignment);
    } catch (error) {
      console.error("Error updating assignment:", error);
      res.status(500).json({ message: "Failed to update assignment" });
    }
  });

  app.patch('/api/assignments/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;
      const completedAssignment = await storage.completeAssignment(id);
      
      // Log activity
      await storage.createActivity({
        userId,
        type: 'assignment_completed',
        description: `Completed assignment: ${completedAssignment.title}`,
        metadata: { assignmentId: completedAssignment.id },
      });
      
      res.json(completedAssignment);
    } catch (error) {
      console.error("Error completing assignment:", error);
      res.status(500).json({ message: "Failed to complete assignment" });
    }
  });

  app.delete('/api/assignments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;
      
      const assignment = await storage.getAssignment(id);
      await storage.deleteAssignment(id);
      
      // Log activity
      await storage.createActivity({
        userId,
        type: 'assignment_deleted',
        description: `Deleted assignment: ${assignment?.title || 'Unknown'}`,
      });
      
      res.json({ message: "Assignment deleted successfully" });
    } catch (error) {
      console.error("Error deleting assignment:", error);
      res.status(500).json({ message: "Failed to delete assignment" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get('/api/activities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const activities = await storage.getActivities(userId, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const notifications = [];
      
      // Get all assignments and classes
      const assignments = await storage.getAssignments(userId);
      const classes = await storage.getClasses(userId);
      const classMap = new Map(classes.map(c => [c.id, c]));
      const now = new Date();
      
      // Check for overdue assignments
      assignments.forEach((assignment: any) => {
        if (assignment.status !== 'completed' && assignment.dueDate) {
          const dueDate = new Date(assignment.dueDate);
          const timeDiff = now.getTime() - dueDate.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
          
          const classInfo = assignment.classId ? classMap.get(assignment.classId) : null;
          const className = classInfo?.name || 'Unknown Class';
          
          if (daysDiff > 0) {
            // Assignment is overdue
            notifications.push({
              id: `overdue-${assignment.id}`,
              type: 'assignment_overdue',
              title: 'Assignment Overdue',
              message: `${assignment.title} for ${className} was due ${daysDiff === 1 ? 'yesterday' : `${daysDiff} days ago`}`,
              read: false,
              createdAt: new Date().toISOString(),
              metadata: {
                assignmentId: assignment.id,
                dueDate: assignment.dueDate,
                daysPastDue: daysDiff,
                className
              }
            });
          } else if (daysDiff === 0) {
            // Assignment is due today
            notifications.push({
              id: `due-today-${assignment.id}`,
              type: 'assignment_due',
              title: 'Assignment Due Today',
              message: `${assignment.title} for ${className} is due today`,
              read: false,
              createdAt: new Date().toISOString(),
              metadata: {
                assignmentId: assignment.id,
                dueDate: assignment.dueDate,
                className
              }
            });
          } else if (daysDiff === -1) {
            // Assignment is due tomorrow
            notifications.push({
              id: `due-tomorrow-${assignment.id}`,
              type: 'assignment_due',
              title: 'Due Tomorrow',
              message: `${assignment.title} for ${className} is due tomorrow`,
              read: false,
              createdAt: new Date().toISOString(),
              metadata: {
                assignmentId: assignment.id,
                dueDate: assignment.dueDate,
                className
              }
            });
          }
        }
      });
      
      // Get recent activities for other notifications
      const activities = await storage.getActivities(userId, 5);
      activities.forEach((activity: any) => {
        // Only include certain activity types as notifications
        if (['assignment_completed', 'class_added'].includes(activity.type)) {
          notifications.push({
            id: `activity-${activity.id}`,
            type: activity.type === 'assignment_completed' ? 'achievement' : 'class_reminder',
            title: activity.type === 'assignment_completed' ? 'Achievement Unlocked' : 'New Class Added',
            message: activity.description,
            read: true, // Mark activities as read by default
            createdAt: activity.createdAt,
            metadata: {
              activityId: activity.id
            }
          });
        }
      });
      
      // Sort notifications by priority and creation date
      notifications.sort((a, b) => {
        // Prioritize overdue assignments
        if (a.type === 'assignment_overdue' && b.type !== 'assignment_overdue') return -1;
        if (b.type === 'assignment_overdue' && a.type !== 'assignment_overdue') return 1;
        
        // Then due today
        if (a.type === 'assignment_due' && b.type !== 'assignment_due') return -1;
        if (b.type === 'assignment_due' && a.type !== 'assignment_due') return 1;
        
        // Finally by creation date
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
