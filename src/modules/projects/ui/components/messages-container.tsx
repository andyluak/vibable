import { TFragment } from "@/db/schema";
import MessageCard from "@/modules/projects/ui/components/message-card";
import MessageForm from "@/modules/projects/ui/components/message-form";
import { MessageLoading } from "@/modules/projects/ui/components/message-loading";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React, { useEffect, useRef } from "react";

export const MessagesContainer = ({
  projectId,
  activeFragment,
  setActiveFragment,
}: {
  projectId: string;
  activeFragment: TFragment | null;
  setActiveFragment: (fragment: TFragment | null) => void;
}) => {
  const trpc = useTRPC();
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    data: { messages },
  } = useSuspenseQuery(
    trpc.projects.get.queryOptions({ projectId: Number(projectId) }),
  );

  useEffect(() => {
    const lastAssistantMessage = messages.findLast(
      (m) => m.role === "assistant" && m.fragment,
    );

    if (lastAssistantMessage) {
      setActiveFragment(lastAssistantMessage.fragment);
    }
  }, [messages, setActiveFragment]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const lastMessage = messages[messages.length - 1];
  const isLastMessageUser = lastMessage?.role === "user";

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
                isActiveFragment={activeFragment?.id === message.fragment?.id}
                onFragmentClick={() => {
                  setActiveFragment(message.fragment);
                }}
              />
            );
          })}
        </div>
        {isLastMessageUser && <MessageLoading />}
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
