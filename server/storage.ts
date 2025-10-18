import {
  users,
  classes,
  assignments,
  activities,
  calendarNotes,
  chronoPlans,
  chronoTimeSlots,
  planSlots,
  type User,
  type UpsertUser,
  type Class,
  type InsertClass,
  type UpdateClass,
  type Assignment,
  type InsertAssignment,
  type UpdateAssignment,
  type Activity,
  type InsertActivity,
  type UpdateUser,
  type CalendarNote,
  type InsertCalendarNote,
  type UpdateCalendarNote,
  type ChronoPlan,
  type InsertChronoPlan,
  type UpdateChronoPlan,
  type ChronoTimeSlot,
  type InsertChronoTimeSlot,
  type UpdateChronoTimeSlot,
  type PlanSlot,
  type InsertPlanSlot,
  type UpdatePlanSlot,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, or, asc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: UpdateUser): Promise<User>;

  // Class operations
  getClasses(userId: string): Promise<Class[]>;
  getClass(id: string): Promise<Class | undefined>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: string, updates: UpdateClass): Promise<Class>;
  deleteClass(id: string): Promise<void>;
  reorderClasses(userId: string, classIds: string[]): Promise<void>;

  // Assignment operations
  getAssignments(userId: string): Promise<Assignment[]>;
  getAssignmentsByClass(classId: string): Promise<Assignment[]>;
  getUpcomingAssignments(userId: string, limit?: number): Promise<Assignment[]>;
  getAssignment(id: string): Promise<Assignment | undefined>;
  createAssignment(assignmentData: InsertAssignment): Promise<Assignment>;
  updateAssignment(id: string, updates: UpdateAssignment): Promise<Assignment>;
  deleteAssignment(id: string): Promise<void>;
  completeAssignment(id: string): Promise<Assignment>;

  // Activity operations
  getActivities(userId: string, limit?: number): Promise<Activity[]>;
  createActivity(activityData: InsertActivity): Promise<Activity>;

  // Calendar notes operations
  getCalendarNotes(userId: string): Promise<CalendarNote[]>;
  getCalendarNoteByDate(userId: string, date: string): Promise<CalendarNote | undefined>;
  createCalendarNote(noteData: InsertCalendarNote): Promise<CalendarNote>;
  updateCalendarNote(id: string, updates: UpdateCalendarNote): Promise<CalendarNote>;
  deleteCalendarNote(id: string): Promise<void>;

  // ChronoPlan operations
  getChronoPlans(userId: string): Promise<ChronoPlan[]>;
  getChronoPlan(id: string): Promise<ChronoPlan | undefined>;
  createChronoPlan(planData: InsertChronoPlan): Promise<ChronoPlan>;
  updateChronoPlan(id: string, updates: UpdateChronoPlan): Promise<ChronoPlan>;
  deleteChronoPlan(id: string): Promise<void>;

  // ChronoTimeSlot operations
  getChronoTimeSlots(userId: string, date?: string): Promise<ChronoTimeSlot[]>;
  getChronoTimeSlot(id: string): Promise<ChronoTimeSlot | undefined>;
  createChronoTimeSlot(slotData: InsertChronoTimeSlot): Promise<ChronoTimeSlot>;
  updateChronoTimeSlot(id: string, updates: UpdateChronoTimeSlot): Promise<ChronoTimeSlot>;
  deleteChronoTimeSlot(id: string): Promise<void>;

  // PlanSlot operations
  getPlanSlots(planId: string): Promise<PlanSlot[]>;
  getPlanSlot(id: string): Promise<PlanSlot | undefined>;
  createPlanSlot(slotData: InsertPlanSlot): Promise<PlanSlot>;
  updatePlanSlot(id: string, updates: UpdatePlanSlot): Promise<PlanSlot>;
  deletePlanSlot(id: string): Promise<void>;

  // Dashboard stats
  getDashboardStats(userId: string): Promise<{
    totalClasses: number;
    pendingTasks: number;
    completedToday: number;
    studyStreak: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: UpdateUser): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Class operations
  async getClasses(userId: string): Promise<Class[]> {
    return await db
      .select()
      .from(classes)
      .where(eq(classes.userId, userId))
      .orderBy(asc(classes.displayOrder), asc(classes.name));
  }

  async getClass(id: string): Promise<Class | undefined> {
    const [classData] = await db.select().from(classes).where(eq(classes.id, id));
    return classData;
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const [newClass] = await db.insert(classes).values(classData).returning();
    return newClass;
  }

  async updateClass(id: string, updates: UpdateClass): Promise<Class> {
    const [updatedClass] = await db
      .update(classes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(classes.id, id))
      .returning();
    return updatedClass;
  }

  async deleteClass(id: string): Promise<void> {
    await db.delete(classes).where(eq(classes.id, id));
  }

  async reorderClasses(userId: string, classIds: string[]): Promise<void> {
    // Update display order for each class
    await Promise.all(
      classIds.map((classId, index) =>
        db
          .update(classes)
          .set({ displayOrder: index, updatedAt: new Date() })
          .where(and(eq(classes.id, classId), eq(classes.userId, userId)))
      )
    );
  }

  // Assignment operations
  async getAssignments(userId: string): Promise<Assignment[]> {
    return await db
      .select()
      .from(assignments)
      .where(eq(assignments.userId, userId))
      .orderBy(desc(assignments.createdAt));
  }

  async getAssignmentsByClass(classId: string): Promise<Assignment[]> {
    return await db
      .select()
      .from(assignments)
      .where(eq(assignments.classId, classId))
      .orderBy(asc(assignments.dueDate));
  }

  async getUpcomingAssignments(userId: string, limit = 10): Promise<Assignment[]> {
    return await db
      .select()
      .from(assignments)
      .where(
        and(
          eq(assignments.userId, userId),
          or(
            eq(assignments.status, "pending"),
            eq(assignments.status, "in_progress")
          )
        )
      )
      .orderBy(asc(assignments.dueDate))
      .limit(limit);
  }

  async getAssignment(id: string): Promise<Assignment | undefined> {
    const [assignment] = await db
      .select()
      .from(assignments)
      .where(eq(assignments.id, id));
    return assignment;
  }

  async createAssignment(assignmentData: InsertAssignment): Promise<Assignment> {
    const [newAssignment] = await db
      .insert(assignments)
      .values(assignmentData)
      .returning();
    return newAssignment;
  }

  async updateAssignment(id: string, updates: UpdateAssignment): Promise<Assignment> {
    const [updatedAssignment] = await db
      .update(assignments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(assignments.id, id))
      .returning();
    return updatedAssignment;
  }

  async deleteAssignment(id: string): Promise<void> {
    await db.delete(assignments).where(eq(assignments.id, id));
  }

  async completeAssignment(id: string): Promise<Assignment> {
    const [completedAssignment] = await db
      .update(assignments)
      .set({
        status: "completed",
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(assignments.id, id))
      .returning();
    return completedAssignment;
  }

  // Activity operations
  async getActivities(userId: string, limit = 20): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const [newActivity] = await db
      .insert(activities)
      .values(activityData)
      .returning();
    return newActivity;
  }

  // Calendar notes operations
  async getCalendarNotes(userId: string): Promise<CalendarNote[]> {
    return await db
      .select()
      .from(calendarNotes)
      .where(eq(calendarNotes.userId, userId))
      .orderBy(desc(calendarNotes.date));
  }

  async getCalendarNoteByDate(userId: string, date: string): Promise<CalendarNote | undefined> {
    const [note] = await db
      .select()
      .from(calendarNotes)
      .where(
        and(
          eq(calendarNotes.userId, userId),
          eq(calendarNotes.date, date)
        )
      );
    return note;
  }

  async createCalendarNote(noteData: InsertCalendarNote): Promise<CalendarNote> {
    const [newNote] = await db
      .insert(calendarNotes)
      .values(noteData)
      .returning();
    return newNote;
  }

  async updateCalendarNote(id: string, updates: UpdateCalendarNote): Promise<CalendarNote> {
    const [updatedNote] = await db
      .update(calendarNotes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(calendarNotes.id, id))
      .returning();
    return updatedNote;
  }

  async deleteCalendarNote(id: string): Promise<void> {
    await db.delete(calendarNotes).where(eq(calendarNotes.id, id));
  }

  // Dashboard stats
  async getDashboardStats(userId: string): Promise<{
    totalClasses: number;
    pendingTasks: number;
    completedToday: number;
    studyStreak: number;
  }> {
    // Get total classes
    const [classCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(classes)
      .where(eq(classes.userId, userId));

    // Get pending tasks
    const [pendingCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(assignments)
      .where(
        and(
          eq(assignments.userId, userId),
          or(
            eq(assignments.status, "pending"),
            eq(assignments.status, "in_progress")
          )
        )
      );

    // Get completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [completedTodayCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(assignments)
      .where(
        and(
          eq(assignments.userId, userId),
          eq(assignments.status, "completed"),
          sql`${assignments.completedAt} >= ${today}`,
          sql`${assignments.completedAt} < ${tomorrow}`
        )
      );

    // Calculate study streak (simplified - count consecutive days with completed tasks)
    const recentActivities = await db
      .select()
      .from(assignments)
      .where(
        and(
          eq(assignments.userId, userId),
          eq(assignments.status, "completed")
        )
      )
      .orderBy(desc(assignments.completedAt))
      .limit(30);

    let studyStreak = 0;
    if (recentActivities.length > 0) {
      const dates = new Set();
      for (const activity of recentActivities) {
        if (activity.completedAt) {
          const date = activity.completedAt.toISOString().split('T')[0];
          dates.add(date);
        }
      }

      const sortedDates = Array.from(dates).sort().reverse();
      const todayStr = new Date().toISOString().split('T')[0];
      
      for (let i = 0; i < sortedDates.length; i++) {
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        const expectedDateStr = expectedDate.toISOString().split('T')[0];
        
        if (sortedDates[i] === expectedDateStr) {
          studyStreak++;
        } else {
          break;
        }
      }
    }

    return {
      totalClasses: classCount.count,
      pendingTasks: pendingCount.count,
      completedToday: completedTodayCount.count,
      studyStreak,
    };
  }

  // ChronoPlan operations
  async getChronoPlans(userId: string): Promise<ChronoPlan[]> {
    return await db
      .select()
      .from(chronoPlans)
      .where(eq(chronoPlans.userId, userId))
      .orderBy(desc(chronoPlans.createdAt));
  }

  async getChronoPlan(id: string): Promise<ChronoPlan | undefined> {
    const [plan] = await db.select().from(chronoPlans).where(eq(chronoPlans.id, id));
    return plan;
  }

  async createChronoPlan(planData: InsertChronoPlan): Promise<ChronoPlan> {
    const [newPlan] = await db.insert(chronoPlans).values(planData).returning();
    return newPlan;
  }

  async updateChronoPlan(id: string, updates: UpdateChronoPlan): Promise<ChronoPlan> {
    const [updatedPlan] = await db
      .update(chronoPlans)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(chronoPlans.id, id))
      .returning();
    return updatedPlan;
  }

  async deleteChronoPlan(id: string): Promise<void> {
    await db.delete(chronoPlans).where(eq(chronoPlans.id, id));
  }

  // ChronoTimeSlot operations
  async getChronoTimeSlots(userId: string, date?: string): Promise<ChronoTimeSlot[]> {
    if (date) {
      return await db
        .select()
        .from(chronoTimeSlots)
        .where(and(eq(chronoTimeSlots.userId, userId), eq(chronoTimeSlots.date, date)))
        .orderBy(asc(chronoTimeSlots.displayOrder), asc(chronoTimeSlots.startTime));
    }
    return await db
      .select()
      .from(chronoTimeSlots)
      .where(eq(chronoTimeSlots.userId, userId))
      .orderBy(desc(chronoTimeSlots.date), asc(chronoTimeSlots.displayOrder));
  }

  async getChronoTimeSlot(id: string): Promise<ChronoTimeSlot | undefined> {
    const [slot] = await db.select().from(chronoTimeSlots).where(eq(chronoTimeSlots.id, id));
    return slot;
  }

  async createChronoTimeSlot(slotData: InsertChronoTimeSlot): Promise<ChronoTimeSlot> {
    const [newSlot] = await db.insert(chronoTimeSlots).values(slotData).returning();
    return newSlot;
  }

  async updateChronoTimeSlot(id: string, updates: UpdateChronoTimeSlot): Promise<ChronoTimeSlot> {
    const [updatedSlot] = await db
      .update(chronoTimeSlots)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(chronoTimeSlots.id, id))
      .returning();
    return updatedSlot;
  }

  async deleteChronoTimeSlot(id: string): Promise<void> {
    await db.delete(chronoTimeSlots).where(eq(chronoTimeSlots.id, id));
  }

  // PlanSlot operations
  async getPlanSlots(planId: string): Promise<PlanSlot[]> {
    return await db
      .select()
      .from(planSlots)
      .where(eq(planSlots.planId, planId))
      .orderBy(asc(planSlots.displayOrder));
  }

  async getPlanSlot(id: string): Promise<PlanSlot | undefined> {
    const [slot] = await db.select().from(planSlots).where(eq(planSlots.id, id));
    return slot;
  }

  async createPlanSlot(slotData: InsertPlanSlot): Promise<PlanSlot> {
    const [newSlot] = await db.insert(planSlots).values(slotData).returning();
    return newSlot;
  }

  async updatePlanSlot(id: string, updates: UpdatePlanSlot): Promise<PlanSlot> {
    const [updatedSlot] = await db
      .update(planSlots)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(planSlots.id, id))
      .returning();
    return updatedSlot;
  }

  async deletePlanSlot(id: string): Promise<void> {
    await db.delete(planSlots).where(eq(planSlots.id, id));
  }
}

export const storage = new DatabaseStorage();
