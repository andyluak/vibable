import MessageCard from "@/modules/projects/ui/components/message-card";
import MessageForm from "@/modules/projects/ui/components/message-form";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React, { useEffect, useRef } from "react";

export const MessagesContainer = ({ projectId }: { projectId: string }) => {
  const trpc = useTRPC();
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    data: { messages },
  } = useSuspenseQuery(
    trpc.projects.get.queryOptions({ projectId: Number(projectId) }),
  );

  useEffect(() => {
    const lastAssistantMessage = messages.findLast(
      (m) => m.role === "assistant",
    );

    if (lastAssistantMessage) {
      // TODO: Set active fragment
    }
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  return (
    <div className='flex flex-col flex-1 min-h-0 h-full'>
      <div className='flex-1 min-h-0 overflow-y-auto'>
        <div className='py-2 pr-1'>
          {messages.map((m) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { updatedAt, projectId, ...message } = m;
            return (
              <MessageCard
                key={message.id}
                message={message}
                isActiveFragment={false}
                onFragmentClick={() => {}}
              />
            );
          })}
        </div>
        <div ref={bottomRef} />
      </div>
      <div className='relative p-3 pt-1'>
        <div className='absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background/70 pointer-events-none' />
        <MessageForm projectId={projectId} />
      </div>
    </div>
  );
};

export default MessagesContainer;
