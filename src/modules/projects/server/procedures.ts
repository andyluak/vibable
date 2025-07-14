import { db } from "@/db/drizzle";
import { messages, projects } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { generateSlug } from "random-word-slugs";
import { INGEST_FUNCTIONS } from "@/inngest/function";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const projectsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: "Prompt is required" })
          .max(10000, { message: "Prompt is too long" }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [createdProject] = await db
        .insert(projects)
        .values({
          name: generateSlug(2, { format: "kebab" }),
          userId: ctx.auth.userId,
        })
        .returning();

      await db
        .insert(messages)
        .values({
          projectId: createdProject.id,
          content: input.value,
          role: "user",
          type: "result",
        })
        .returning();

      await inngest.send({
        name: INGEST_FUNCTIONS.CODE_AGENT.trigger,
        data: {
          value: input.value,
          projectId: createdProject.id,
        },
      });

      return createdProject;
    }),

  get: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const project = await db.query.projects.findFirst({
        where: and(
          eq(projects.id, input.projectId),
          eq(projects.userId, ctx.auth.userId),
        ),
        with: {
          messages: {
            where: eq(messages.projectId, input.projectId),
            with: {
              fragment: true,
            },
          },
        },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      return project;
    }),

  getMany: protectedProcedure.query(async ({ ctx }) => {
    const allProjects = await db.query.projects.findMany({
      where: eq(projects.userId, ctx.auth.userId),
      with: {
        messages: {
          with: {
            fragment: true,
          },
        },
      },
      orderBy: (projects, { desc }) => [desc(projects.createdAt)],
    });
    return allProjects;
  }),
});
