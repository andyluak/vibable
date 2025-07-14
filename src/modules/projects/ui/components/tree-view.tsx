import { TTreeItem } from "@/lib/utils";
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-react";

type TreeViewProps = {
  data: TTreeItem[];
  onSelect: (filePath: string) => void;
  value: string | null;
};

function TreeView({ data, onSelect, value }: TreeViewProps) {
  return (
    <SidebarProvider>
      <Sidebar collapsible='none' className='w-full'>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {data.map((item, index) => (
                  <Tree
                    key={index}
                    item={item}
                    selectedValue={value}
                    onSelect={onSelect}
                    parentPath=''
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </SidebarProvider>
  );
}

export default TreeView;

const Tree = ({
  item,
  selectedValue,
  onSelect,
  parentPath,
}: {
  item: TTreeItem;
  selectedValue: string | null;
  onSelect: (filePath: string) => void;
  parentPath: string;
}) => {
  const [name, ...items] = Array.isArray(item) ? item : [item];
  const currentPath = parentPath ? `${parentPath}/${name}` : name;

  if (!items.length) {
    const isSelected = selectedValue === currentPath;

    return (
      <SidebarMenuButton
        isActive={isSelected}
        className='data-[active=true]:bg-transparent pl-8'
        onClick={() => onSelect(currentPath)}
      >
        <FileIcon className='w-4 h-4' />
        <span className='truncate'>{name}</span>
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarMenuItem>
      <Collapsible
        defaultOpen
        className='group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90'
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <ChevronRightIcon className='transition-transform' />
            <FolderIcon className='w-4 h-4' />
            <span className='truncate'>{name}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {items.map((item, index) => (
            <Tree
              key={index}
              item={item}
              selectedValue={selectedValue}
              onSelect={onSelect}
              parentPath={currentPath}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
};
