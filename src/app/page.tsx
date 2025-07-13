"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [value, setValue] = useState("");
  const trpc = useTRPC();
  const invoke = useMutation(
    trpc.invoke.mutationOptions({
      onSuccess: () => {
        toast.success("Background job invoked");
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
        disabled={invoke.isPending}
        onClick={() => {
          invoke.mutate({ value });
        }}
      >
        Invoke background job
      </Button>
    </div>
  );
}
