import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Role enum
export const roleEnum = pgEnum("role", ["admin", "ceo", "manager", "employee"]);

// Project status enum
export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "pending_approval",
  "active",
  "completed",
  "archived",
]);

// Task/SubTask status enum
export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "review",
  "completed",
]);

// Priority enum
export const priorityEnum = pgEnum("priority", [
  "critical",
  "high",
  "medium",
  "low",
]);

// Pipeline status enum
export const pipelineStatusEnum = pgEnum("pipeline_status", [
  "pending",
  "approved",
  "rejected",
]);

/* ==================== USERS ==================== */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: roleEnum("role").notNull().default("employee"),
  avatar: varchar("avatar", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* ==================== PROJECTS ==================== */
export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: projectStatusEnum("status").notNull().default("draft"),
  ownerId: uuid("owner_id").notNull().references(() => users.id),
  priority: priorityEnum("priority").notNull().default("medium"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* ==================== TASKS ==================== */
export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: taskStatusEnum("status").notNull().default("todo"),
  priority: priorityEnum("priority").notNull().default("medium"),
  assigneeId: uuid("assignee_id").references(() => users.id),
  deadline: timestamp("deadline"),
  progress: integer("progress").default(0),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* ==================== SUBTASKS ==================== */
export const subtasks = pgTable("subtasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskId: uuid("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: taskStatusEnum("status").notNull().default("todo"),
  priority: priorityEnum("priority").notNull().default("medium"),
  assigneeId: uuid("assignee_id").references(() => users.id),
  deadline: timestamp("deadline"),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* ==================== PIPELINE (CEO APPROVAL) ==================== */
export const pipelineItems = pgTable("pipeline_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectName: varchar("project_name", { length: 255 }).notNull(),
  description: text("description"),
  scope: text("scope").notNull(),
  impact: text("impact").notNull(),
  estimatedTimeline: varchar("estimated_timeline", { length: 100 }),
  submittedBy: uuid("submitted_by").notNull().references(() => users.id),
  status: pipelineStatusEnum("status").notNull().default("pending"),
  notes: text("notes"),
  approvedBy: uuid("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* ==================== ACTIVITY LOG ==================== */
export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  action: varchar("action", { length: 255 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: uuid("entity_id"),
  description: text("description"),
  changes: text("changes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ==================== RELATIONS ==================== */

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  tasks: many(tasks),
  subtasks: many(subtasks),
  pipelineItems: many(pipelineItems),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, { fields: [projects.ownerId], references: [users.id] }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  assignee: one(users, { fields: [tasks.assigneeId], references: [users.id] }),
  subtasks: many(subtasks),
}));

export const subtasksRelations = relations(subtasks, ({ one }) => ({
  task: one(tasks, { fields: [subtasks.taskId], references: [tasks.id] }),
  assignee: one(users, { fields: [subtasks.assigneeId], references: [users.id] }),
}));

export const pipelineItemsRelations = relations(pipelineItems, ({ one }) => ({
  submitter: one(users, { fields: [pipelineItems.submittedBy], references: [users.id] }),
  approver: one(users, { fields: [pipelineItems.approvedBy], references: [users.id] }),
}));

/* ==================== ZOD SCHEMAS ==================== */

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type User = z.infer<typeof selectUserSchema>;

export const insertProjectSchema = createInsertSchema(projects);
export const selectProjectSchema = createSelectSchema(projects);
export type Project = z.infer<typeof selectProjectSchema>;

export const insertTaskSchema = createInsertSchema(tasks);
export const selectTaskSchema = createSelectSchema(tasks);
export type Task = z.infer<typeof selectTaskSchema>;

export const insertSubtaskSchema = createInsertSchema(subtasks);
export const selectSubtaskSchema = createSelectSchema(subtasks);
export type Subtask = z.infer<typeof selectSubtaskSchema>;

export const insertPipelineItemSchema = createInsertSchema(pipelineItems);
export const selectPipelineItemSchema = createSelectSchema(pipelineItems);
export type PipelineItem = z.infer<typeof selectPipelineItemSchema>;

export const insertActivityLogSchema = createInsertSchema(activityLogs);
export const selectActivityLogSchema = createSelectSchema(activityLogs);
export type ActivityLog = z.infer<typeof selectActivityLogSchema>;
