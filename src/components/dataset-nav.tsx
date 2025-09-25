
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Database, FileText, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth, Dataset } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface DatasetNavProps {
    isMobile?: boolean;
}

export function DatasetNav({ isMobile = false }: DatasetNavProps) {
  const { getAllDatasets } = useAuth();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        setLoading(true);
        const fetchedDatasets = await getAllDatasets();
        setDatasets(fetchedDatasets);
      } catch (error) {
        console.error("Failed to fetch datasets for nav", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDatasets();
  }, [getAllDatasets]);

  const desktopClasses = "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary";
  const mobileClasses = "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground";

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger
        asChild
        onMouseEnter={() => setPopoverOpen(true)}
        onMouseLeave={() => setPopoverOpen(false)}
      >
        <div className={cn(isMobile ? mobileClasses : desktopClasses, "cursor-pointer")}>
          <Database className={cn("h-4 w-4", isMobile && "h-5 w-5")} />
          Datasets
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80"
        onMouseEnter={() => setPopoverOpen(true)}
        onMouseLeave={() => setPopoverOpen(false)}
        align="start"
      >
        <div className="p-4">
            <h4 className="font-medium leading-none">Available Datasets</h4>
            <p className="text-sm text-muted-foreground">
                Browse datasets uploaded by CMLRE staff.
            </p>
        </div>
        <ScrollArea className="h-72">
            <div className="p-4 pt-0">
                 {loading ? (
                    <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                 ) : datasets.length > 0 ? (
                    datasets.map((dataset) => {
                      const href = `/dashboard/datasets/${dataset.id}`;

                      return (
                        <Link
                            key={dataset.id}
                            href={href}
                            className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                            onClick={() => setPopoverOpen(false)}
                        >
                            <FileText className="h-4 w-4 mt-1 flex-shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{dataset.name}</span>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(dataset.date).toLocaleDateString()}
                                </span>
                            </div>
                        </Link>
                      )
                    })
                 ) : (
                    <p className="text-sm text-muted-foreground text-center">No datasets found.</p>
                 )}
            </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

    
