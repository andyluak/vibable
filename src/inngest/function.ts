import { inngest } from "./client";
import { createAgent, openai } from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox } from "@/inngest/utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "5s");

    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-nextjs-alex");
      return sandbox.sandboxId;
    });

    const codeAgent = createAgent({
      name: "code-agent",
      system:
        "You are an expert nextjs developer. You write readable, maintainable, and performant code. You write simple nextjs snippets.",
      model: openai({
        model: "gpt-4o",
        apiKey: process.env.OPEN_ROUTER_API_KEY,
        baseUrl: "https://openrouter.ai/api/v1",
      }),
    });

    const { output } = await codeAgent.run(
      `Write the following code snippet: ${event.data.value}`,
    );

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = await sandbox.getHost(3000);
      return `http://${host}`;
    });

    return { output, sandboxUrl };
  },
);
