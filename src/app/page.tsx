"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Page() {
  const trpc = useTRPC();
  const invoke = useMutation(
    trpc.invoke.mutationOptions({
      onSuccess: () => {
        toast.success("Background job invoked");
      },
    }),
  );

  return (
    <div>
      <Button
        disabled={invoke.isPending}
        onClick={() => {
          invoke.mutate({ email: "test@test.com" });
        }}
      >
        Invoke background job
      </Button>
    </div>
  );
}
