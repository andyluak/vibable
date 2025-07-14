import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ComponentProps, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export type AIMessageProps = HTMLAttributes<HTMLDivElement> & {
  from: "user" | "assistant";
  timestamp?: Date;
};

export const AIMessage = ({
  className,
  from,
  timestamp,
  children,
  ...props
}: AIMessageProps) => {
  return (
    <div className='flex flex-col group'>
      <div
        className={cn(
          "group flex w-full items-end justify-end gap-2 py-4",
          from === "user"
            ? "is-user"
            : "is-assistant flex-row-reverse justify-end",
          "[&>div]:max-w-[80%]",
          timestamp && "pb-1",
          className,
        )}
        {...props}
      >
        {children}
      </div>
      {timestamp && (
        <div className='text-xs self-start px-1 pb-2 pt-1 opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground max-w-[80%]'>
          {format(new Date(timestamp), "HH:mm 'on' MMM dd, yyyy")}
        </div>
      )}
    </div>
  );
};

export type AIMessageContentProps = HTMLAttributes<HTMLDivElement>;

export const AIMessageContent = ({
  children,
  className,
  ...props
}: AIMessageContentProps) => (
  <div
    className={cn(
      "flex flex-col gap-2 rounded-lg px-4 py-3 text-sm",
      "bg-muted text-foreground",
      "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground",
      className,
    )}
    {...props}
  >
    <div className='is-user:dark'>{children}</div>
  </div>
);

export type AIMessageAvatarProps = ComponentProps<typeof Avatar> & {
  src: string;
  name?: string;
};

export const AIMessageAvatar = ({
  src,
  name,
  className,
  ...props
}: AIMessageAvatarProps) => (
  <Avatar className={cn("size-8", className)} {...props}>
    <AvatarImage alt='' className='mt-0 mb-0' src={src} />
    <AvatarFallback>{name?.slice(0, 2) || "ME"}</AvatarFallback>
  </Avatar>
);
