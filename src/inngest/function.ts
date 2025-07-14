import { inngest } from "./client";
import {
  createAgent,
  createNetwork,
  createTool,
  openai,
  Tool,
} from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox, lastAssistantTextMessageContent } from "@/inngest/utils";
import { z } from "zod";
import { PROMPT } from "@/inngest/prompt";
import { db } from "@/db/drizzle";
import { fragments, messages } from "@/db/schema";

export const INGEST_FUNCTIONS = {
  CODE_AGENT: {
    id: "code-agent",
    trigger: "code-agent/run",
  },
};

type AgentState = {
  summary: string;
  files: { [path: string]: string };
};

export const codeAgentFunction = inngest.createFunction(
  { id: INGEST_FUNCTIONS.CODE_AGENT.id },
  { event: INGEST_FUNCTIONS.CODE_AGENT.trigger },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-nextjs-alex");
      return sandbox.sandboxId;
    });

    const codeAgent = createAgent<AgentState>({
      name: "code-agent",
      system: PROMPT,
      description: "You are an expert coding agent.",
      model: openai({
        model: "gpt-4.1",
        defaultParameters: {
          temperature: 0.1,
        },
        apiKey: process.env.OPEN_ROUTER_API_KEY,
        baseUrl: "https://openrouter.ai/api/v1",
      }),
      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string().describe("The command to run in the terminal"),
          }),
          handler: async ({ command }, { step }: Tool.Options<AgentState>) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };

              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout(data) {
                    buffers.stdout += data;
                  },
                  onStderr(data) {
                    buffers.stderr += data;
                  },
                });
                return result.stdout;
              } catch (error) {
                console.error(`Command failed: ${command} ${error}
                  stderr: ${buffers.stderr}
                  stdout: ${buffers.stdout}
                  `);
                return buffers;
              }
            });
          },
        }),

        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox.",
          parameters: z.object({
            files: z
              .array(
                z.object({
                  path: z.string().describe("The path of the file"),
                  content: z.string().describe("The content of the file"),
                }),
              )
              .describe("Array of files to create or update"),
          }),
          handler: async (
            { files },
            { step, network }: Tool.Options<AgentState>,
          ) => {
            const newFiles = await step?.run(
              "createOrUpdateFiles",
              async () => {
                try {
                  const updatedFiles = network.state.data.files || {};
                  const sandbox = await getSandbox(sandboxId);
                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updatedFiles[file.path] = file.content;
                  }
                  return updatedFiles;
                } catch (error) {
                  console.error(`Failed to create or update files: ${error}`);
                  return `Error: ${error}`;
                }
              },
            );

            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }

            return newFiles;
          },
        }),

        createTool({
          name: "readFiles",
          description: "Read files from the sandbox.",
          parameters: z.object({
            files: z
              .array(
                z.object({
                  path: z.string().describe("The path of the file to read"),
                }),
              )
              .describe("Array of files to read"),
          }),
          handler: async ({ files }, { step }: Tool.Options<AgentState>) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];

                for (const file of files) {
                  const content = await sandbox.files.read(file.path);
                  contents.push({ path: file.path, content });
                }

                return JSON.stringify(contents);
              } catch (error) {
                console.error(`Failed to read files: ${error}`);
                return `Error: ${error}`;
              }
            });
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantText = lastAssistantTextMessageContent(result);

          if (lastAssistantText && network) {
            if (lastAssistantText.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantText;
            }
          }

          return result;
        },
      },
    });

    const network = createNetwork<AgentState>({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      router: async ({ network }) => {
        const summary = network.state.data.summary;

        if (summary) {
          return;
        }

        return codeAgent;
      },
    });

    const result = await network.run(
      `Write the following code snippet: ${event.data.value}`,
    );

    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `http://${host}`;
    });

    await step.run("create-message", async () => {
      const [message] = await db
        .insert(messages)
        .values({
          projectId: event.data.projectId,
          content: isError
            ? `Something went wrong. Please try again.`
            : result.state.data.summary,
          role: "assistant",
          type: isError ? "error" : "result",
        })
        .returning();

      await db.insert(fragments).values({
        messageId: message.id,
        sandboxUrl,
        title: "Fragment",
        files: result.state.data.files,
      });
    });

    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  },
);
