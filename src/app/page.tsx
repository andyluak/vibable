"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [value, setValue] = useState("");

  const trpc = useTRPC();

  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onSuccess: (project) => {
        toast.success("Project created");
        router.push(`/projects/${project.id}`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  return (
    <div className='h-screen flex flex-col items-center justify-center gap-4'>
      <form
        className='max-w-4xl w-full items-center mx-auto flex flex-col gap-4'
        onSubmit={(e) => {
          e.preventDefault();
          createProject.mutate({ value });
        }}
      >
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className='w-full max-w-md'
        />

        <Button disabled={createProject.isPending || !value}>Submit</Button>
      </form>
    </div>
  );
}
