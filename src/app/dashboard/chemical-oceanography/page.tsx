
"use client"

import * as React from "react"
import { addDays, format, parseISO } from "date-fns"
import { Calendar as CalendarIcon, Beaker, Droplet, Thermometer, Waves } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useAuth, Dataset } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface OceanData {
  Date: string;
  Latitude: number;
  Longitude: number;
  "Salinity (PSU)": number;
  "pH": number;
  "Nitrate (umol/L)": number;
  "Phosphate (umol/L)": number;
  "Silicate (umol/L)": number;
}

const parseCSV = (csvData: string): OceanData[] => {
  const lines = csvData.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const entry: any = {};
    headers.forEach((header, index) => {
        const value = values[index] ? values[index].trim() : '';
        entry[header] = isNaN(Number(value)) || value === '' ? value : Number(value);
    });
    return entry as OceanData;
  });
};

const chartConfig = {
  ph: {
    label: "pH",
    color: "hsl(var(--chart-1))",
  },
  nitrate: {
    label: "Nitrate (µmol/L)",
    color: "hsl(var(--chart-2))",
  },
  phosphate: {
    label: "Phosphate (µmol/L)",
    color: "hsl(var(--chart-3))",
  },
  silicate: {
    label: "Silicate (µmol/L)",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

export default function ChemicalOceanographyPage() {
  const { getAllDatasets } = useAuth();
  const { toast } = useToast();
  const [dataset, setDataset] = React.useState<Dataset | null>(null);
  const [oceanData, setOceanData] = React.useState<OceanData[]>([]);
  const [filteredData, setFilteredData] = React.useState<OceanData[]>([]);
  const [activeEntry, setActiveEntry] = React.useState<OceanData | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: addDays(new Date(), -28),
    to: new Date(),
  })

  React.useEffect(() => {
    const fetchDataset = async () => {
      try {
        setLoading(true);
        const allDatasets = await getAllDatasets();
        const chemicalDataset = allDatasets.find(d => d.name === "Chemical Oceanography");
        if (chemicalDataset) {
          setDataset(chemicalDataset);
          const parsedData = parseCSV(chemicalDataset.csvData);
          setOceanData(parsedData);
        } else {
          toast({
            title: "Dataset not found",
            description: "The 'Chemical Oceanography' dataset could not be located.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch dataset.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDataset();
  }, [getAllDatasets, toast]);

  React.useEffect(() => {
    if (oceanData.length > 0) {
      const filtered = oceanData.filter(d => {
        const dataDate = parseISO(d.Date);
        const from = date?.from ? new Date(date.from.setHours(0,0,0,0)) : null;
        const to = date?.to ? new Date(date.to.setHours(23,59,59,999)) : null;
        if (from && to) {
          return dataDate >= from && dataDate <= to;
        }
        if (from) {
          return dataDate >= from;
        }
        if (to) {
          return dataDate <= to;
        }
        return true;
      });
      setFilteredData(filtered);
      setActiveEntry(filtered[filtered.length - 1] || filtered[0] || null);
    }
  }, [date, oceanData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const handleViewSummary = (entry: OceanData) => {
    setActiveEntry(entry);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle>Chemical Oceanography</CardTitle>
                        <CardDescription>Visualize chemical parameters of the ocean.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-[260px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date?.from ? (
                                date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                </>
                                ) : (
                                format(date.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date</span>
                            )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                            />
                        </PopoverContent>
                        </Popover>
                    </div>
                </CardHeader>
                <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                    <LineChart
                        data={filteredData}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                        onMouseMove={(state) => {
                            if (state.isTooltipActive && state.activePayload?.[0]?.payload) {
                                setActiveEntry(state.activePayload[0].payload);
                            }
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                        dataKey="Date"
                        tickFormatter={(value) => format(parseISO(value), "MMM d")}
                        padding={{ left: 20, right: 20 }}
                        />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="pH" stroke="var(--color-ph)" name="pH" dot={false} />
                        <Line yAxisId="right" type="monotone" dataKey="Nitrate (umol/L)" stroke="var(--color-nitrate)" name="Nitrate (µmol/L)" dot={false} />
                        <Line yAxisId="right" type="monotone" dataKey="Phosphate (umol/L)" stroke="var(--color-phosphate)" name="Phosphate (µmol/L)" dot={false} />
                        <Line yAxisId="right" type="monotone" dataKey="Silicate (umol/L)" stroke="var(--color-silicate)" name="Silicate (µmol/L)" dot={false} />
                    </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Daily Summary</CardTitle>
                <CardDescription>
                Details for {activeEntry ? format(parseISO(activeEntry.Date), "yyyy-MM-dd") : "N/A"}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Latitude</span>
                    <span>{activeEntry?.Latitude.toFixed(4) || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Longitude</span>
                    <span>{activeEntry?.Longitude.toFixed(4) || "N/A"}</span>
                </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Droplet className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Salinity</span>
                    </div>
                    <span>{activeEntry ? `${activeEntry["Salinity (PSU)"]} PSU` : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Waves className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">pH</span>
                    </div>
                    <span>{activeEntry?.pH.toFixed(2) || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Beaker className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Nitrate</span>
                    </div>
                    <span>{activeEntry ? `${activeEntry["Nitrate (umol/L)"]} µmol/L` : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Beaker className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Phosphate</span>
                    </div>
                    <span>{activeEntry ? `${activeEntry["Phosphate (umol/L)"]} µmol/L` : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Beaker className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Silicate</span>
                    </div>
                    <span>{activeEntry ? `${activeEntry["Silicate (umol/L)"]} µmol/L` : 'N/A'}</span>
                </div>
            </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Raw Data</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>pH</TableHead>
                <TableHead>Nitrate</TableHead>
                <TableHead>Phosphate</TableHead>
                <TableHead>Silicate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((entry, index) => (
                  <TableRow key={index} className={cn(entry === activeEntry && "bg-muted/50")}>
                    <TableCell>{entry.Date}</TableCell>
                    <TableCell>{entry.pH}</TableCell>
                    <TableCell>{entry["Nitrate (umol/L)"]} µmol/L</TableCell>
                    <TableCell>{entry["Phosphate (umol/L)"]} µmol/L</TableCell>
                    <TableCell>{entry["Silicate (umol/L)"]} µmol/L</TableCell>
                    <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleViewSummary(entry)}>View Summary</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No data available for the selected date range.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
