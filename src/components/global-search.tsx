
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FileText, Search } from "lucide-react";
import { useAuth, Dataset } from "@/hooks/use-auth";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "./ui/button";

export function GlobalSearch() {
  const router = useRouter();
  const { getAllDatasets } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [datasets, setDatasets] = React.useState<Dataset[]>([]);

  React.useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const fetchedDatasets = await getAllDatasets();
        setDatasets(fetchedDatasets);
      } catch (error) {
        console.error("Failed to fetch datasets for search", error);
      }
    };
    fetchDatasets();
  }, [getAllDatasets]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className="relative h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search datasets...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search datasets..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Datasets">
            {datasets.map((dataset) => (
              <CommandItem
                key={dataset.id}
                value={`${dataset.name} ${dataset.description}`}
                onSelect={() => {
                  runCommand(() => router.push(`/dashboard/datasets/${dataset.id}`));
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>{dataset.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
