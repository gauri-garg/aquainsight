
"use client"

import * as React from "react"
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  File,
  Thermometer,
  Wind,
  Beaker,
  Dna
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Button } from "./ui/button"
import { Search as SearchIcon } from "lucide-react"
import { collection, getDocs, onSnapshot } from "firebase/firestore"
import { firestore } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { DialogDescription, DialogTitle } from "./ui/dialog"

type Dataset = {
  id: string,
  datasetName: string,
  datasetType: string,
  fileUrl: string,
  approvedAt: any,
  submittedBy: string
}

const typeToIcon: { [key: string]: React.ElementType } = {
  "Physical Oceanography": Wind,
  "Chemical Oceanography": Beaker,
  "Ocean Atmosphere": Thermometer,
  "Marine Weather": Wind,
  "eDNA": Dna
}

const typeToHref: { [key: string]: string } = {
    "Physical Oceanography": "/dashboard/physical-oceanography",
    "Chemical Oceanography": "/dashboard/chemical-oceanography",
    "Ocean Atmosphere": "/dashboard/ocean-atmosphere",
    "Marine Weather": "/dashboard/marine-weather",
    "eDNA": "/dashboard/edna"
}

export function Search() {
  const [open, setOpen] = React.useState(false)
  const [datasets, setDatasets] = React.useState<Dataset[]>([])
  const router = useRouter();


  React.useEffect(() => {
    const fetchDatasets = async () => {
        const datasetTypes = [
            { name: "Physical Oceanography", path: "physical_oceanography"},
            { name: "Chemical Oceanography", path: "chemical_oceanography"},
            { name: "Ocean Atmosphere", path: "ocean_atmosphere"},
            { name: "Marine Weather", path: "marine_weather"},
            { name: "eDNA", path: "edna"}
        ];
        
        let allDatasets: Dataset[] = [];
        
        for (const type of datasetTypes) {
            try {
              const querySnapshot = await getDocs(collection(firestore, `datasets/${type.path}/items`));
              querySnapshot.forEach((doc) => {
                  allDatasets.push({ id: doc.id, datasetType: type.name, ...doc.data() } as Dataset);
              });
            } catch (error) {
              console.error(`Could not fetch datasets for ${type.name}:`, error);
            }
        }
        setDatasets(allDatasets);
    }
    fetchDatasets();
  }, [])

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])
  
  const handleSelect = (href: string) => {
    router.push(href);
    setOpen(false);
  }

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start text-sm text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search datasets...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">Search for datasets and other content</DialogDescription>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Datasets">
            {datasets.map((dataset) => {
                const Icon = typeToIcon[dataset.datasetType] || File;
                const href = typeToHref[dataset.datasetType] || '/dashboard';
                return (
                    <CommandItem key={dataset.id} onSelect={() => handleSelect(href)} value={dataset.datasetName}>
                        <Icon className="mr-2 h-4 w-4" />
                        <span>{dataset.datasetName}</span>
                    </CommandItem>
                )
            })}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </ICommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
