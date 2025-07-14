import { useTheme } from "next-themes";
import Link from "next/link";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ChevronDownIcon, ChevronLeftIcon, SunMoonIcon } from "lucide-react";
import { DayNightSwitch } from "@/components/ui/day-night-switch";

export const ProjectHeader = ({ projectId }: { projectId: string }) => {
  const trpc = useTRPC();

  const { data: project } = useSuspenseQuery(
    trpc.projects.get.queryOptions({ projectId: Number(projectId) }),
  );

  const { theme, setTheme } = useTheme();

  return (
    <header className='flex items-center justify-between p-2 border-b'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            className='focus-visible:ring-0 hover:bg-transparent hover:opacity-75 transition-opacity pl-2!'
          >
            <Image
              src='/logo.svg'
              alt='Vibe'
              width={18}
              height={18}
              className='shrink-0'
            />
            <span className='text-sm font-medium'>{project.name}</span>
            <ChevronDownIcon className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side='bottom' align='start'>
          <DropdownMenuItem asChild>
            <Link href={`/projects/${projectId}`}>
              <ChevronLeftIcon className='size-4' />
              <span className='text-sm font-medium'>Go to dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <SunMoonIcon className='size-4 text-muted-foreground' />
              <span className='text-sm font-medium'>Appearance</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className='flex items-center gap-2'>
                <span className='text-sm font-medium'>Light</span>
                <DayNightSwitch
                  className='scale-75'
                  defaultChecked={theme === "light"}
                  onToggle={(checked) => {
                    setTheme(checked ? "light" : "dark");
                  }}
                />
                <span className='text-sm font-medium'>Dark</span>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};
