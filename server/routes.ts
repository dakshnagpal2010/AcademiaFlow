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
  insertCalendarNoteSchema,
  updateCalendarNoteSchema,
  insertChronoPlanSchema,
  updateChronoPlanSchema,
  insertChronoTimeSlotSchema,
  updateChronoTimeSlotSchema,
  insertPlanSlotSchema,
  updatePlanSlotSchema,
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
      const notifications: any[] = [];
      
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

  // Calendar notes routes
  app.get('/api/calendar-notes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const notes = await storage.getCalendarNotes(userId);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching calendar notes:", error);
      res.status(500).json({ message: "Failed to fetch calendar notes" });
    }
  });

  app.get('/api/calendar-notes/:date', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const { date } = req.params;
      const note = await storage.getCalendarNoteByDate(userId, date);
      res.json(note || null);
    } catch (error) {
      console.error("Error fetching calendar note:", error);
      res.status(500).json({ message: "Failed to fetch calendar note" });
    }
  });

  app.post('/api/calendar-notes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const noteData = insertCalendarNoteSchema.parse({ ...req.body, userId });
      
      // Check if note already exists for this date
      const existingNote = await storage.getCalendarNoteByDate(userId, noteData.date);
      if (existingNote) {
        // Update existing note
        const updatedNote = await storage.updateCalendarNote(existingNote.id, { note: noteData.note });
        res.json(updatedNote);
      } else {
        // Create new note
        const newNote = await storage.createCalendarNote(noteData);
        res.json(newNote);
      }
    } catch (error) {
      console.error("Error saving calendar note:", error);
      res.status(500).json({ message: "Failed to save calendar note" });
    }
  });

  app.patch('/api/calendar-notes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = updateCalendarNoteSchema.parse(req.body);
      const updatedNote = await storage.updateCalendarNote(id, updates);
      res.json(updatedNote);
    } catch (error) {
      console.error("Error updating calendar note:", error);
      res.status(500).json({ message: "Failed to update calendar note" });
    }
  });

  app.delete('/api/calendar-notes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCalendarNote(id);
      res.json({ message: "Calendar note deleted successfully" });
    } catch (error) {
      console.error("Error deleting calendar note:", error);
      res.status(500).json({ message: "Failed to delete calendar note" });
    }
  });

  // Chrono Plans routes
  app.get('/api/plans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const plans = await storage.getChronoPlans(userId);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });

  app.get('/api/plans/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const plan = await storage.getChronoPlan(id);
      res.json(plan);
    } catch (error) {
      console.error("Error fetching plan:", error);
      res.status(500).json({ message: "Failed to fetch plan" });
    }
  });

  app.post('/api/plans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const planData = insertChronoPlanSchema.parse({ ...req.body, userId });
      const newPlan = await storage.createChronoPlan(planData);
      
      // Log activity
      await storage.createActivity({
        userId,
        type: 'plan_created',
        description: `Created new plan: ${newPlan.name}`,
        metadata: { planId: newPlan.id },
      });
      
      res.json(newPlan);
    } catch (error) {
      console.error("Error creating plan:", error);
      res.status(500).json({ message: "Failed to create plan" });
    }
  });

  app.patch('/api/plans/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = updateChronoPlanSchema.parse(req.body);
      const updatedPlan = await storage.updateChronoPlan(id, updates);
      res.json(updatedPlan);
    } catch (error) {
      console.error("Error updating plan:", error);
      res.status(500).json({ message: "Failed to update plan" });
    }
  });

  app.delete('/api/plans/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;
      
      const plan = await storage.getChronoPlan(id);
      await storage.deleteChronoPlan(id);
      
      // Log activity
      await storage.createActivity({
        userId,
        type: 'plan_deleted',
        description: `Deleted plan: ${plan?.name || 'Unknown'}`,
      });
      
      res.json({ message: "Plan deleted successfully" });
    } catch (error) {
      console.error("Error deleting plan:", error);
      res.status(500).json({ message: "Failed to delete plan" });
    }
  });

  // ChronoPlan Time Slots routes
  app.get('/api/chrono-slots', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const { date } = req.query;
      const slots = await storage.getChronoTimeSlots(userId, date as string | undefined);
      res.json(slots);
    } catch (error) {
      console.error("Error fetching chrono time slots:", error);
      res.status(500).json({ message: "Failed to fetch time slots" });
    }
  });

  app.post('/api/chrono-slots', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const slotData = insertChronoTimeSlotSchema.parse({ ...req.body, userId });
      const newSlot = await storage.createChronoTimeSlot(slotData);
      res.json(newSlot);
    } catch (error) {
      console.error("Error creating chrono time slot:", error);
      res.status(500).json({ message: "Failed to create time slot" });
    }
  });

  app.patch('/api/chrono-slots/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = updateChronoTimeSlotSchema.parse(req.body);
      const updatedSlot = await storage.updateChronoTimeSlot(id, updates);
      res.json(updatedSlot);
    } catch (error) {
      console.error("Error updating chrono time slot:", error);
      res.status(500).json({ message: "Failed to update time slot" });
    }
  });

  app.delete('/api/chrono-slots/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteChronoTimeSlot(id);
      res.json({ message: "Time slot deleted successfully" });
    } catch (error) {
      console.error("Error deleting chrono time slot:", error);
      res.status(500).json({ message: "Failed to delete time slot" });
    }
  });

  app.post('/api/chrono-slots/bulk', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const { slots } = z.object({
        slots: z.array(insertChronoTimeSlotSchema)
      }).parse(req.body);

      const createdSlots = await Promise.all(
        slots.map(slot => storage.createChronoTimeSlot({ ...slot, userId }))
      );

      res.json(createdSlots);
    } catch (error) {
      console.error("Error bulk creating chrono time slots:", error);
      res.status(500).json({ message: "Failed to create time slots" });
    }
  });

  app.post('/api/chrono-slots/reorder', isAuthenticated, async (req: any, res) => {
    try {
      const { slots } = z.object({
        slots: z.array(z.object({
          id: z.string(),
          displayOrder: z.number()
        }))
      }).parse(req.body);

      await Promise.all(
        slots.map(({ id, displayOrder }) => 
          storage.updateChronoTimeSlot(id, { displayOrder })
        )
      );

      res.json({ message: "Time slots reordered successfully" });
    } catch (error) {
      console.error("Error reordering chrono time slots:", error);
      res.status(500).json({ message: "Failed to reorder time slots" });
    }
  });

  // Plan slots routes
  app.get('/api/plans/:planId/slots', isAuthenticated, async (req: any, res) => {
    try {
      const { planId } = req.params;
      const slots = await storage.getPlanSlots(planId);
      res.json(slots);
    } catch (error) {
      console.error("Error fetching plan slots:", error);
      res.status(500).json({ message: "Failed to fetch plan slots" });
    }
  });

  app.post('/api/plans/:planId/slots', isAuthenticated, async (req: any, res) => {
    try {
      const { planId } = req.params;
      const userId = req.userId;
      const slotData = insertPlanSlotSchema.parse({ ...req.body, planId, userId });
      const newSlot = await storage.createPlanSlot(slotData);
      res.json(newSlot);
    } catch (error) {
      console.error("Error creating plan slot:", error);
      res.status(500).json({ message: "Failed to create plan slot" });
    }
  });

  app.patch('/api/plan-slots/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = updatePlanSlotSchema.parse(req.body);
      const updatedSlot = await storage.updatePlanSlot(id, updates);
      res.json(updatedSlot);
    } catch (error) {
      console.error("Error updating plan slot:", error);
      res.status(500).json({ message: "Failed to update plan slot" });
    }
  });

  app.delete('/api/plan-slots/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deletePlanSlot(id);
      res.json({ message: "Plan slot deleted successfully" });
    } catch (error) {
      console.error("Error deleting plan slot:", error);
      res.status(500).json({ message: "Failed to delete plan slot" });
    }
  });

  // AI Assistant routes
  app.post('/api/ai/chat', isAuthenticated, async (req: any, res) => {
    try {
      const { messages } = z.object({
        messages: z.array(z.object({
          role: z.enum(["user", "assistant", "system"]),
          content: z.string()
        }))
      }).parse(req.body);

      // Reference: blueprint:javascript_gemini
      // Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

      const systemInstruction = "You are a helpful AI study assistant. You help students with their academic questions, provide study tips, explain concepts, and offer educational support. Be friendly, encouraging, and informative.";
      
      const conversationHistory = messages
        .filter((msg: any) => msg.role !== "system")
        .map((msg: any) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }]
        }));

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: systemInstruction,
        },
        contents: conversationHistory,
      });

      const text = response.text;
      
      const assistantMessage = {
        role: "assistant" as const,
        content: text || "I'm sorry, I couldn't generate a response."
      };

      res.json({ message: assistantMessage });
    } catch (error) {
      console.error("Error in AI chat:", error);
      res.status(500).json({ message: "Failed to get AI response" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
