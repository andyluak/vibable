import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  role: text("role").notNull().default("user").$type<"user" | "assistant">(),
  type: text("type").notNull().default("").$type<"result" | "error">(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const fragments = pgTable("fragments", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id")
    .references(() => messages.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  sandboxUrl: text("sandbox_url").notNull(),
  title: text("title").notNull(),
  files: jsonb("files").$type<Record<string, string>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const projectsRelations = relations(projects, ({ many }) => ({
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  project: one(projects, {
    fields: [messages.projectId],
    references: [projects.id],
  }),
  fragment: one(fragments, {
    fields: [messages.id],
    references: [fragments.messageId],
  }),
}));

export const fragmentsRelations = relations(fragments, ({ one }) => ({
  message: one(messages, {
    fields: [fragments.messageId],
    references: [messages.id],
  }),
}));
