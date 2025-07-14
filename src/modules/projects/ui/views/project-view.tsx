"use client";

import MessagesContainer from "../components/messages-container";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { TFragment } from "@/db/schema";
import { FragmentWeb } from "@/modules/projects/ui/components/fragment-web";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectHeader } from "@/modules/projects/ui/components/project-header";

import { Suspense, useState } from "react";
import { CodeIcon, CrownIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import FileExplorer from "@/modules/projects/ui/components/file-explorer";

export const ProjectView = ({ projectId }: { projectId: string }) => {
  const [activeFragment, setActiveFragment] = useState<TFragment | null>(null);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("preview");

  return (
    <div className='h-screen w-screen'>
      <ResizablePanelGroup direction='horizontal'>
        <ResizablePanel
          defaultSize={35}
          minSize={30}
          className='flex flex-col min-h-0'
        >
          <Suspense fallback={<div>Loading...</div>}>
            <ProjectHeader projectId={projectId} />
          </Suspense>
          <Suspense fallback={<div>Loading...</div>}>
            <MessagesContainer
              projectId={projectId}
              activeFragment={activeFragment}
              setActiveFragment={setActiveFragment}
            />
          </Suspense>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={65} minSize={50}>
          <Tabs
            value={activeTab}
            className='h-full gap-y-0'
            onValueChange={(value) => setActiveTab(value as "code" | "preview")}
          >
            <div className='w-full flex items-center p-1.5 border-b gap-x-2'>
              <TabsList>
                <TabsTrigger className='rounded-md' value='preview'>
                  <EyeIcon className='size-4' /> Demo
                </TabsTrigger>
                <TabsTrigger className='rounded-md' value='code'>
                  <CodeIcon className='size-4' /> Code
                </TabsTrigger>
              </TabsList>
              <div className='ml-auto flex items-center gap-x-2'>
                <Button asChild size='sm'>
                  <Link href='/pricing'>
                    <CrownIcon className='size-4' /> Upgrade
                  </Link>
                </Button>
              </div>
            </div>
            <TabsContent value='code' className='min-h-0'>
              {!!activeFragment?.files && (
                <FileExplorer files={activeFragment.files} />
              )}
            </TabsContent>
            <TabsContent value='preview'>
              {!!activeFragment && <FragmentWeb data={activeFragment} />}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
