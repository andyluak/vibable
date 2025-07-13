import { db } from "@/db/drizzle";
import { messages } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { INGEST_FUNCTIONS } from "@/inngest/function";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";

import { z } from "zod";

export const messagesRouter = createTRPCRouter({
  create: baseProcedure
    .input(
      z.object({
        value: z.string().min(1, { message: "Value is required" }),
      }),
    )
    .mutation(async ({ input }) => {
      const createdMessage = await db
        .insert(messages)
        .values({
          content: input.value,
          role: "user",
          type: "result",
        })
        .returning();

      await inngest.send({
        name: INGEST_FUNCTIONS.CODE_AGENT.trigger,
        data: {
          value: input.value,
        },
      });

      return createdMessage;
    }),
  get: baseProcedure.query(async () => {
    const allMessages = await db.query.messages.findMany({
      orderBy: (messages, { desc }) => [desc(messages.createdAt)],
      with: {
        fragment: true,
      },
    });
    return allMessages;
  }),
});
