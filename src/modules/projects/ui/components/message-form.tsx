import {
  AIInput,
  AIInputTools,
  AIInputToolbar,
  AIInputTextarea,
  AIInputSubmit,
  AIInputModelSelect,
  AIInputModelSelectTrigger,
  AIInputModelSelectValue,
  AIInputModelSelectContent,
  AIInputModelSelectItem,
} from "@/components/ui/kibo-ui/ai/input";
import { useTRPC } from "@/trpc/client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CommandIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormField } from "@/components/ui/form";
import { toast } from "sonner";

type Props = {
  projectId: string;
};

const models = [
  { id: "gpt-4.1", name: "GPT-4.1" },
  { id: "gpt-4.1-mini", name: "GPT-4.1 Mini" },
];

const formSchema = z.object({
  value: z
    .string()
    .min(1, { message: "Prompt is required" })
    .max(10000, { message: "Prompt is too long" }),
  model: z.string().min(1, { message: "Model is required" }),
});

function MessageForm({ projectId }: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: "",
      model: "gpt-4.1",
    },
  });

  const createMessage = useMutation(
    trpc.messages.create.mutationOptions({
      onSuccess: ([data]) => {
        form.reset();

        queryClient.invalidateQueries(
          trpc.projects.get.queryOptions({ projectId: data.projectId }),
        );

        toast.success("Message created");
      },
      onError: (error) => {
        // TODO: Redirect to pricing page if specific error
        toast.error(error.message);
      },
    }),
  );

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await createMessage.mutateAsync({
      projectId: Number(projectId),
      value: values.value,
    });
  };

  const isPending = createMessage.isPending;
  const isDisabled = isPending || !form.formState.isValid;

  return (
    <AIInput onSubmit={form.handleSubmit(onSubmit)}>
      <FormField
        control={form.control}
        name='value'
        render={({ field }) => (
          <AIInputTextarea
            {...field}
            placeholder='What would you like to build?'
            disabled={isPending}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.shiftKey)) {
                e.preventDefault();
                form.handleSubmit(onSubmit)();
              }
            }}
          />
        )}
      />
      <AIInputToolbar className='justify-start gap-6'>
        <AIInputTools>
          <kbd className='rounded-md border bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground'>
            <CommandIcon className='h-4 w-4' />
          </kbd>
          <kbd className='rounded-md border bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground'>
            Enter
          </kbd>
          <span className='text-xs text-muted-foreground'>to submit</span>
        </AIInputTools>
        <div className='flex flex-row ml-auto'>
          <AIInputTools>
            <AIInputModelSelect
              onValueChange={(value) => form.setValue("model", value)}
              value={form.watch("model")}
            >
              <AIInputModelSelectTrigger>
                <AIInputModelSelectValue />
              </AIInputModelSelectTrigger>
              <AIInputModelSelectContent>
                {models.map((model) => (
                  <AIInputModelSelectItem key={model.id} value={model.id}>
                    {model.name}
                  </AIInputModelSelectItem>
                ))}
              </AIInputModelSelectContent>
            </AIInputModelSelect>
          </AIInputTools>
          <AIInputSubmit
            disabled={isDisabled}
            status={
              createMessage.status === "success"
                ? "ready"
                : createMessage.status === "pending"
                ? "submitted"
                : undefined
            }
          />
        </div>
      </AIInputToolbar>
    </AIInput>
  );
}

export default MessageForm;
