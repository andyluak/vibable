import { inngest } from "./client";
import {
  createAgent,
  createNetwork,
  createTool,
  openai,
} from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox, lastAssistantTextMessageContent } from "@/inngest/utils";
import { z } from "zod";
import { PROMPT } from "@/inngest/prompt";

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
          handler: async ({ command }, { step }) => {
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
          handler: async ({ files }, { step, network }) => {
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
          handler: async ({ files }, { step }) => {
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

    const network = createNetwork({
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

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `http://${host}`;
    });

    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  },
);
