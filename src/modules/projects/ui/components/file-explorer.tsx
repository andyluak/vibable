import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { convertFilesToTreeItems } from "@/lib/utils";
import { CodeView } from "@/modules/projects/ui/components/code-view";
import TreeView from "@/modules/projects/ui/components/tree-view";
import { CopyIcon } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";

type FileCollection = {
  [path: string]: string;
};

function getLanguageFromExtension(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase();

  return extension ?? "text";
}

const FileBreadcrumb = ({ path }: { path: string }) => {
  const pathSegments = path.split("/");
  const maxSegments = 4;

  const renderBreadcrumbItems = () => {
    if (pathSegments.length <= maxSegments) {
      return pathSegments.map((segment, index) => (
        <React.Fragment key={index}>
          <BreadcrumbItem>
            {index === pathSegments.length - 1 ? (
              <BreadcrumbPage>{segment}</BreadcrumbPage>
            ) : (
              <span className='text-muted-foreground'>{segment}</span>
            )}
          </BreadcrumbItem>
          {index < pathSegments.length - 1 && <BreadcrumbSeparator />}
        </React.Fragment>
      ));
    } else {
      const [firstSegment, ...restSegments] = pathSegments;
      const lastSegment = restSegments.pop();

      return (
        <>
          <BreadcrumbItem>
            <span className='text-muted-foreground'>{firstSegment}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className='font-medium'>
              {lastSegment}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </>
      );
    }
  };

  return (
    <Breadcrumb className='flex items-center gap-x-2'>
      <BreadcrumbList>{renderBreadcrumbItems()}</BreadcrumbList>
    </Breadcrumb>
  );
};

type FileExplorerProps = {
  files: FileCollection;
};

function FileExplorer({ files }: FileExplorerProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(() => {
    const fileKeys = Object.keys(files);
    return fileKeys?.[0] ?? null;
  });

  const treeItems = useMemo(() => convertFilesToTreeItems(files), [files]);

  const handleSelectFile = useCallback(
    (filePath: string) => {
      if (files[filePath]) {
        setSelectedFile(filePath);
      }
    },
    [files],
  );

  return (
    <ResizablePanelGroup direction='horizontal'>
      <ResizablePanel
        defaultSize={30}
        minSize={30}
        className='bg-sidebar border-r'
      >
        <TreeView
          data={treeItems}
          onSelect={handleSelectFile}
          value={selectedFile}
        />
      </ResizablePanel>
      <ResizableHandle className='hover:bg-primary transition-colors' />
      <ResizablePanel defaultSize={70} minSize={70} className='bg-sidebar'>
        {selectedFile ? (
          <div className='size-full flex flex-col'>
            <div className='border-b bg-sidebar px-4 py-2 flex justify-between items-center gap-x-2'>
              <FileBreadcrumb path={selectedFile} />
              <Button
                variant='ghost'
                className='ml-auto'
                size='sm'
                onClick={() => {
                  navigator.clipboard.writeText(files[selectedFile]);
                }}
              >
                <CopyIcon className='size-4' />
              </Button>
            </div>
            <div className='flex-1 overflow-y-auto'>
              <CodeView
                code={files[selectedFile]}
                language={getLanguageFromExtension(selectedFile)}
              />
            </div>
          </div>
        ) : (
          <p className='text-sm text-muted-foreground flex h-full items-center justify-center'>
            Select a file to view the code
          </p>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default FileExplorer;
