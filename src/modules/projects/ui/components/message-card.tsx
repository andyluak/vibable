import {
  AIMessage,
  AIMessageAvatar,
  AIMessageContent,
} from "@/components/ui/kibo-ui/ai/message";
import { cn } from "@/lib/utils";
import { AppRouter } from "@/trpc/routers/_app";
import { inferProcedureOutput } from "@trpc/server";
import { Code2Icon } from "lucide-react";
import React from "react";

type MessageCardProps = {
  message: Message;
  isActiveFragment: boolean;
  onFragmentClick: () => void;
};

type Message = Omit<
  inferProcedureOutput<AppRouter["projects"]["get"]>["messages"][number],
  "projectId" | "updatedAt"
>;

function MessageCard({
  message,
  isActiveFragment,
  onFragmentClick,
}: MessageCardProps) {
  if (message.role === "assistant") {
    return (
      <AssistantMessage
        message={message}
        isActiveFragment={isActiveFragment}
        onFragmentClick={onFragmentClick}
      />
    );
  }

  return (
    <AIMessage from={"user"}>
      <AIMessageContent>{message.content}</AIMessageContent>
    </AIMessage>
  );
}

const MessageFragment = ({
  fragment,
  isActiveFragment,
  onFragmentClick,
}: Pick<MessageCardProps, "isActiveFragment" | "onFragmentClick"> & {
  fragment: Message["fragment"];
}) => {
  return (
    <div className='px-8 -mb-4 pt-4'>
      <button
        onClick={onFragmentClick}
        className={cn(
          "cursor-pointer w-fit flex items-start text-start gap-2 border rounded-lg p-3 bg-muted hover:bg-secondary transition-colors",
          isActiveFragment &&
            "bg-primary text-primary-foreground border-primary hover:bg-primary/90",
        )}
      >
        <Code2Icon className='size-4 mt-0.5' />
        <div className='flex flex-col flex-1'>
          <span className='text-sm font-medium'>{fragment.title}</span>
          <span className='text-sm text-muted-foreground'>Preview</span>
        </div>
      </button>
    </div>
  );
};

const AssistantMessage = ({
  message,
  isActiveFragment,
  onFragmentClick,
}: MessageCardProps) => {
  return (
    <div className='flex flex-col gap-2'>
      {message.type === "result" && message.fragment.title && (
        <MessageFragment
          fragment={message.fragment}
          isActiveFragment={isActiveFragment}
          onFragmentClick={onFragmentClick}
        />
      )}

      <AIMessage from={"assistant"} timestamp={message.createdAt}>
        <AIMessageContent
          className={cn({
            "text-destructive": message.type === "error",
          })}
        >
          {message.content}
        </AIMessageContent>
        <AIMessageAvatar className='size-6' name={"Vibe"} src={"/logo.svg"} />
      </AIMessage>
    </div>
  );
};

export default MessageCard;
