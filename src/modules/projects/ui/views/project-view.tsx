"use client";

import MessagesContainer from "../components/messages-container";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { Suspense } from "react";

export const ProjectView = ({ projectId }: { projectId: string }) => {
  // const trpc = useTRPC();
  // const { data: project } = useSuspenseQuery(
  //   trpc.projects.get.queryOptions({ projectId: Number(projectId) }),
  // );

  return (
    <div className='h-screen w-screen'>
      <ResizablePanelGroup direction='horizontal'>
        <ResizablePanel defaultSize={35} minSize={30}>
          <Suspense fallback={<div>Loading...</div>}>
            <MessagesContainer projectId={projectId} />
          </Suspense>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={65} minSize={50}>
          TODO: Preview
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
