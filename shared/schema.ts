import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  date,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  displayName: varchar("display_name"),
  bio: text("bio"),
  academicYear: varchar("academic_year"),
  major: varchar("major"),
  schoolName: varchar("school_name"),
  theme: varchar("theme").default("default"),
  animationsEnabled: boolean("animations_enabled").default(true),
  compactMode: boolean("compact_mode").default(false),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Classes table
export const classes = pgTable("classes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  code: varchar("code"),
  instructor: varchar("instructor"),
  color: varchar("color").default("#3b82f6"),
  schedule: text("schedule"), // JSON string for schedule data
  room: varchar("room"),
  credits: integer("credits"),
  description: text("description"),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Homework/Assignments table
export const assignments = pgTable("assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  classId: varchar("class_id").references(() => classes.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  priority: varchar("priority").default("medium"), // low, medium, high
  status: varchar("status").default("pending"), // pending, in_progress, completed
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours"),
  completedAt: timestamp("completed_at"),
  color: varchar("color").default("#3b82f6"), // Color for calendar display
  repeatPattern: varchar("repeat_pattern"), // none, daily, weekly, monthly, yearly
  repeatDays: text("repeat_days"), // JSON array for weekly repeats [0,1,2,3,4,5,6] (Sunday=0)
  repeatUntil: timestamp("repeat_until"), // End date for repeating events
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activity log table
export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(), // assignment_completed, class_added, etc.
  description: text("description").notNull(),
  metadata: jsonb("metadata"), // Additional data about the activity
  createdAt: timestamp("created_at").defaultNow(),
});

// Calendar notes table
export const calendarNotes = pgTable("calendar_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  note: text("note").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ChronoPlan plans table (for managing multiple plans)
export const chronoPlans = pgTable("chrono_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon"),
  color: varchar("color").default("#3b82f6"),
  isTemplate: boolean("is_template").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ChronoPlan time slots table
export const chronoTimeSlots = pgTable("chrono_time_slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  planId: varchar("plan_id").references(() => chronoPlans.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  title: varchar("title").notNull(),
  startTime: varchar("start_time").notNull(),
  endTime: varchar("end_time").notNull(),
  category: varchar("category").default("work"),
  notes: text("notes"),
  color: varchar("color"),
  priority: varchar("priority").default("medium"),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  classes: many(classes),
  assignments: many(assignments),
  activities: many(activities),
  calendarNotes: many(calendarNotes),
  chronoPlans: many(chronoPlans),
  chronoTimeSlots: many(chronoTimeSlots),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  user: one(users, {
    fields: [classes.userId],
    references: [users.id],
  }),
  assignments: many(assignments),
}));

export const assignmentsRelations = relations(assignments, ({ one }) => ({
  user: one(users, {
    fields: [assignments.userId],
    references: [users.id],
  }),
  class: one(classes, {
    fields: [assignments.classId],
    references: [classes.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

export const calendarNotesRelations = relations(calendarNotes, ({ one }) => ({
  user: one(users, {
    fields: [calendarNotes.userId],
    references: [users.id],
  }),
}));

export const chronoPlansRelations = relations(chronoPlans, ({ one, many }) => ({
  user: one(users, {
    fields: [chronoPlans.userId],
    references: [users.id],
  }),
  timeSlots: many(chronoTimeSlots),
}));

export const chronoTimeSlotsRelations = relations(chronoTimeSlots, ({ one }) => ({
  user: one(users, {
    fields: [chronoTimeSlots.userId],
    references: [users.id],
  }),
  plan: one(chronoPlans, {
    fields: [chronoTimeSlots.planId],
    references: [chronoPlans.id],
  }),
}));

// Auth schemas
export const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
}).extend({
  dueDate: z.union([z.date(), z.string().transform((str) => new Date(str))]).optional(),
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertCalendarNoteSchema = createInsertSchema(calendarNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChronoPlanSchema = createInsertSchema(chronoPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChronoTimeSlotSchema = createInsertSchema(chronoTimeSlots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Update schemas
export const updateUserSchema = insertUserSchema.partial();
export const updateClassSchema = insertClassSchema.partial().omit({ userId: true });
export const updateAssignmentSchema = insertAssignmentSchema.partial().omit({ userId: true }).extend({
  estimatedHours: z.union([z.number(), z.string().transform((str) => Number(str))]).optional(),
});
export const updateCalendarNoteSchema = insertCalendarNoteSchema.partial().omit({ userId: true });
export const updateChronoPlanSchema = insertChronoPlanSchema.partial().omit({ userId: true });
export const updateChronoTimeSlotSchema = insertChronoTimeSlotSchema.partial().omit({ userId: true });

// Types
export type SignUp = z.infer<typeof signUpSchema>;
export type SignIn = z.infer<typeof signInSchema>;
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type Class = typeof classes.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type Assignment = typeof assignments.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type UpdateClass = z.infer<typeof updateClassSchema>;
export type UpdateAssignment = z.infer<typeof updateAssignmentSchema>;
export type InsertCalendarNote = z.infer<typeof insertCalendarNoteSchema>;
export type CalendarNote = typeof calendarNotes.$inferSelect;
export type UpdateCalendarNote = z.infer<typeof updateCalendarNoteSchema>;
export type InsertChronoPlan = z.infer<typeof insertChronoPlanSchema>;
export type ChronoPlan = typeof chronoPlans.$inferSelect;
export type UpdateChronoPlan = z.infer<typeof updateChronoPlanSchema>;
export type InsertChronoTimeSlot = z.infer<typeof insertChronoTimeSlotSchema>;
export type ChronoTimeSlot = typeof chronoTimeSlots.$inferSelect;
export type UpdateChronoTimeSlot = z.infer<typeof updateChronoTimeSlotSchema>;
