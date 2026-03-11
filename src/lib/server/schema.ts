/**
 * Drizzle table definitions for the thea database.
 */
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const issues = sqliteTable("issues", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  priority: text("priority", { enum: ["low", "medium", "high", "critical"] })
    .notNull()
    .default("medium"),
  status: text("status", { enum: ["open", "in_progress", "done", "closed"] })
    .notNull()
    .default("open"),
  agentSession: text("agent_session"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const issueLabels = sqliteTable("issue_labels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  issueId: integer("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
});

export const issueEvents = sqliteTable("issue_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  issueId: integer("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  type: text("type", {
    enum: [
      "created",
      "status_changed",
      "priority_changed",
      "agent_assigned",
      "agent_unassigned",
      "edited",
      "comment",
    ],
  }).notNull(),
  detail: text("detail").notNull().default("{}"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});
