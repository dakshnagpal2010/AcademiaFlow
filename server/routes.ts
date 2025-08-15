import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
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

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.patch('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const classes = await storage.getClasses(userId);
      res.json(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  app.post('/api/classes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      
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

  // Assignment routes
  app.get('/api/assignments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const assignments = await storage.getAssignments(userId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.get('/api/assignments/upcoming', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get('/api/activities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const activities = await storage.getActivities(userId, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
