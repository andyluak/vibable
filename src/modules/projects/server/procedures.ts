import { db } from "@/db/drizzle";
import { messages, projects } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { generateSlug } from "random-word-slugs";
import { INGEST_FUNCTIONS } from "@/inngest/function";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const projectsRouter = createTRPCRouter({
  create: baseProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: "Prompt is required" })
          .max(10000, { message: "Prompt is too long" }),
      }),
    )
    .mutation(async ({ input }) => {
      const [createdProject] = await db
        .insert(projects)
        .values({
          name: generateSlug(2, { format: "kebab" }),
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

  get: baseProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const project = await db.query.projects.findFirst({
        where: eq(projects.id, input.projectId),
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

  getMany: baseProcedure.query(async () => {
    const allProjects = await db.query.projects.findMany({
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
