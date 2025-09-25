
"use client";

import { useAuth, Dataset } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/date-range-picker";
import { ChemicalOceanographyChart } from "@/components/chemical-oceanography-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function Dashboard() {
  const { role, userDetails, getAllDatasets } = useAuth();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  
  const defaultDateRange = {
    from: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    to: new Date(),
  };
  const [dateRange, setDateRange] = useState<DateRange | undefined>(defaultDateRange);


  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const fetchedDatasets = await getAllDatasets();
        setDatasets(fetchedDatasets);
        if (fetchedDatasets.length > 0) {
          setSelectedDataset(fetchedDatasets[0]);
        }
      } catch (error) {
        console.error("Failed to fetch datasets", error);
      }
    };
    fetchDatasets();
  }, [getAllDatasets]);

  const handleDatasetChange = (datasetId: string) => {
    const dataset = datasets.find(d => d.id === datasetId) || null;
    setSelectedDataset(dataset);
  }

  const getTitle = () => {
    switch (role) {
      case "Student":
        return `Welcome, ${userDetails?.fullName || 'Student'}!`;
      case "Researcher":
        return `Welcome, ${userDetails?.fullName || 'Researcher'}!`;
      case "CMLRE":
        return "CMLRE Staff Dashboard";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="space-y-4">
        <h1 className="text-lg font-semibold md:text-2xl">{getTitle()}</h1>
        <p className="text-sm text-muted-foreground">
            {role === 'CMLRE' 
                ? "Here you can manage datasets and view analytics."
                : "Welcome to the AquaInsight platform. Explore datasets and visualize oceanography data."}
        </p>
        
        <Card>
            <CardHeader>
                <CardTitle>Chemical Oceanography Data</CardTitle>
                <CardDescription>
                    Visualize trends for key oceanographic parameters. Select a dataset and date range to begin.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="grid gap-2 flex-1">
                        <label className="text-sm font-medium">Select Dataset</label>
                         <Select onValueChange={handleDatasetChange} value={selectedDataset?.id}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a dataset to visualize" />
                            </SelectTrigger>
                            <SelectContent>
                                {datasets.map(dataset => (
                                    <SelectItem key={dataset.id} value={dataset.id!}>
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span>{dataset.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                         <label className="text-sm font-medium">Select Date Range</label>
                        <DateRangePicker date={dateRange} onDateChange={setDateRange} />
                    </div>
                </div>

                {selectedDataset ? (
                    <ChemicalOceanographyChart 
                        dataset={selectedDataset}
                        dateRange={dateRange}
                    />
                ) : (
                    <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">Please select a dataset to view the chart.</p>
                    </div>
                )}
            </CardContent>
        </Card>

    </div>
  );
}
