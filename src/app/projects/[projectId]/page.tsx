import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import React, { Suspense } from "react";
import { ProjectView } from "@/modules/projects/ui/views/project-view";

const Page = async ({ params }: { params: Promise<{ projectId: string }> }) => {
  const { projectId } = await params;

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(
    trpc.projects.get.queryOptions({ projectId: Number(projectId) }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
        <ProjectView projectId={projectId} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;
