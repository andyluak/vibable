import { db } from "@/db/drizzle";
import { messages } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { INGEST_FUNCTIONS } from "@/inngest/function";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";

import { z } from "zod";
import { eq } from "drizzle-orm";

export const messagesRouter = createTRPCRouter({
  create: baseProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: "Prompt is required" })
          .max(10000, { message: "Prompt is too long" }),
        projectId: z.number().min(1, { message: "Project is required" }),
      }),
    )
    .mutation(async ({ input }) => {
      const createdMessage = await db
        .insert(messages)
        .values({
          projectId: input.projectId,
          content: input.value,
          role: "user",
          type: "result",
        })
        .returning();

      await inngest.send({
        name: INGEST_FUNCTIONS.CODE_AGENT.trigger,
        data: {
          value: input.value,
          projectId: input.projectId,
        },
      });

      return createdMessage;
    }),
  get: baseProcedure
    .input(
      z.object({
        projectId: z.number().min(1, { message: "Project is required" }),
      }),
    )
    .query(async ({ input }) => {
      const allMessages = await db.query.messages.findMany({
        where: eq(messages.projectId, input.projectId),
        orderBy: (messages, { desc }) => [desc(messages.createdAt)],
        with: {
          fragment: true,
        },
      });
      return allMessages;
    }),
});
