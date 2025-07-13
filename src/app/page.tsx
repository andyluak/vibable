"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [value, setValue] = useState("");
  const trpc = useTRPC();
  const { data: messages } = useQuery(trpc.messages.get.queryOptions());
  const createMessage = useMutation(
    trpc.messages.create.mutationOptions({
      onSuccess: () => {
        toast.success("Message created");
      },
    }),
  );

  return (
    <div className='h-screen flex flex-col items-center justify-center gap-4'>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className='w-full max-w-md'
      />

      <Button
        disabled={createMessage.isPending}
        onClick={() => {
          createMessage.mutate({ value });
        }}
      >
        Create message
      </Button>

      <div className='flex flex-col gap-2'>
        {messages?.map((message) => (
          <div key={message.id}>
            <div>{message.content}</div>
            <div>{JSON.stringify(message.fragment?.files)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
