
"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, Dataset } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Download, Beaker, Droplet, Waves, Wind, Thermometer, Gauge } from "lucide-react";
import * as XLSX from "xlsx";
import { addDays, format, parseISO } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { cn } from "@/lib/utils";


const oceanographyChartConfig = {
  pH: { label: "pH", color: "hsl(var(--chart-1))" },
  Salinity_PSU: { label: "Salinity (PSU)", color: "hsl(var(--chart-5))" },
  Nitrate_µmolL: { label: "Nitrate (µmol/L)", color: "hsl(var(--chart-2))" },
  Phosphate_µmolL: { label: "Phosphate (µmol/L)", color: "hsl(var(--chart-3))" },
  Silicate_µmolL: { label: "Silicate (µmol/L)", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

const weatherChartConfig = {
    'SST_Skin_°C': { label: "SST (°C)", color: "hsl(var(--chart-1))" },
    'Air_Temperature_°C': { label: "Air Temp (°C)", color: "hsl(var(--chart-2))" },
    'Wind_Speed_m/s': { label: "Wind Speed (m/s)", color: "hsl(var(--chart-3))" },
    'Wave_Height_m': { label: "Wave Height (m)", color: "hsl(var(--chart-4))" },
    'Current_Speed_m/s': { label: "Current Speed (m/s)", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

const parseCSV = (csvData: string): any[] => {
  if (!csvData) return [];
  const lines = csvData.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const entry: any = {};
    headers.forEach((header, index) => {
        const value = values[index] ? values[index].trim() : '';
        if (value === '' || value.toLowerCase().includes('not available')) {
          entry[header] = null;
        } else {
          entry[header] = isNaN(Number(value)) ? value : Number(value);
        }
    });
    return entry;
  });
};

type ChartType = 'oceanography' | 'weather' | 'none';

export default function DatasetViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getDatasetById, role } = useAuth();
  const { toast } = useToast();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [chartType, setChartType] = useState<ChartType>('none');
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);
  const [availableChartKeys, setAvailableChartKeys] = useState<string[]>([]);
  
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [activeEntry, setActiveEntry] = useState<any | null>(null);
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -28),
    to: new Date(),
  });

  useEffect(() => {
    if (id && typeof id === "string") {
      const fetchDataset = async () => {
        setLoading(true);
        try {
          const fetchedDataset = await getDatasetById(id);
          if (fetchedDataset) {
            setDataset(fetchedDataset);
            if (fetchedDataset.csvData) {
              const data = parseCSV(fetchedDataset.csvData);
              const headers = data.length > 0 ? Object.keys(data[0]) : [];
              const hasDate = headers.includes('Date');

              const oceanographyKeys = Object.keys(oceanographyChartConfig).filter(h => headers.includes(h));
              const weatherKeys = Object.keys(weatherChartConfig).filter(h => headers.includes(h));
              
              let detectedChartType: ChartType = 'none';
              let detectedConfig: ChartConfig | null = null;
              let detectedKeys: string[] = [];

              if (hasDate && oceanographyKeys.length > 0) {
                detectedChartType = 'oceanography';
                detectedConfig = oceanographyChartConfig;
                detectedKeys = oceanographyKeys;
              } else if (hasDate && weatherKeys.length > 0) {
                detectedChartType = 'weather';
                detectedConfig = weatherChartConfig;
                detectedKeys = weatherKeys;
              }

              if (detectedChartType !== 'none' && detectedConfig) {
                setChartType(detectedChartType);
                setChartConfig(detectedConfig);
                setAvailableChartKeys(detectedKeys);

                const processedData = data.map(d => ({
                  ...d,
                  Date: d.Date ? format(parseISO(d.Date), 'yyyy-MM-dd') : null
                })).filter(d => d.Date);

                setParsedData(processedData);
              }
            }
          } else {
            toast({
              title: "Not Found",
              description: "Dataset not found.",
              variant: "destructive",
            });
            router.push("/dashboard/datasets");
          }
        } catch (error: any) {
          toast({
            title: "Error",
            description: "Failed to fetch or process dataset.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchDataset();
    }
  }, [id, getDatasetById, router, toast]);

  useEffect(() => {
    if (parsedData.length > 0 && chartType !== 'none') {
      const filtered = parsedData.filter(d => {
        try {
          const dataDate = parseISO(d.Date);
          const from = date?.from ? new Date(date.from.setHours(0,0,0,0)) : null;
          const to = date?.to ? new Date(date.to.setHours(23,59,59,999)) : null;
          if (from && to) return dataDate >= from && dataDate <= to;
          if (from) return dataDate >= from;
          if (to) return dataDate <= to;
          return true;
        } catch(e) {
          return false;
        }
      });
      setFilteredData(filtered);
      setActiveEntry(filtered[filtered.length - 1] || filtered[0] || null);
    }
  }, [date, parsedData, chartType]);


  const handleDownloadXlsx = () => {
    if (!dataset?.csvData) {
        toast({ title: "No Data", description: "There is no data to download.", variant: "destructive" });
        return;
    }
    try {
        const lines = dataset.csvData.trim().split('\n');
        const data = lines.map(line => line.split(','));
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Dataset");
        XLSX.writeFile(wb, `${dataset.name}.xlsx`);
    } catch (error) {
        toast({ title: "Download Error", description: "Failed to create the XLSX file.", variant: "destructive" });
    }
  };

  const handleDownloadCsv = () => {
    if (!dataset?.csvData) {
      toast({ title: 'No Data', description: 'There is no data to download.', variant: 'destructive' });
      return;
    }
    try {
      const blob = new Blob([dataset.csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${dataset.name}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast({ title: 'Download Error', description: 'Failed to create the CSV file.', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!dataset) {
    return null;
  }

  const handleViewSummary = (entry: any) => {
    setActiveEntry(entry);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const PageHeader = () => (
     <div className="flex items-center justify-between">
        <div>
            <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/datasets">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Datasets
            </Link>
            </Button>
        </div>
        <div className="flex items-center gap-2">
            <Button onClick={handleDownloadXlsx}>
                <Download className="mr-2 h-4 w-4" />
                Download as XLSX
            </Button>
            <Button onClick={handleDownloadCsv} variant="secondary">
                <Download className="mr-2 h-4 w-4" />
                Download as CSV
            </Button>
            {role === 'CMLRE' && (
              <Button asChild>
                <Link href={`/dashboard/datasets/${id}/edit`}>Edit</Link>
              </Button>
            )}
        </div>
      </div>
  );

  const MetadataCard = () => (
    <Card>
      <CardHeader>
        <CardTitle>{dataset.name}</CardTitle>
        <CardDescription>{dataset.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div><span className="font-semibold">Submitted by: </span><span>{dataset.submittedBy}</span></div>
        <div><span className="font-semibold">Date Submitted: </span><span>{new Date(dataset.date).toLocaleDateString()}</span></div>
        <div className="pt-4">
            <h3 className="font-semibold mb-2">Raw Data Preview</h3>
            <div className="overflow-x-auto p-2 border rounded-md bg-muted/50 max-h-80">
                <pre className="text-xs">
                    {dataset.csvData}
                </pre>
            </div>
        </div>
      </CardContent>
    </Card>
  )

  const OceanographySummary = () => (
    <>
      {availableChartKeys.includes('Salinity_PSU') && <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Droplet className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Salinity</span></div><span>{activeEntry && activeEntry.Salinity_PSU != null ? `${activeEntry.Salinity_PSU} PSU` : 'N/A'}</span></div>}
      {availableChartKeys.includes('pH') && <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Waves className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">pH</span></div><span>{activeEntry && activeEntry.pH != null ? activeEntry.pH.toFixed(2) : "N/A"}</span></div>}
      {availableChartKeys.includes('Nitrate_µmolL') && <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Beaker className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Nitrate</span></div><span>{activeEntry && activeEntry.Nitrate_µmolL != null ? `${activeEntry.Nitrate_µmolL} µmol/L` : 'N/A'}</span></div>}
      {availableChartKeys.includes('Phosphate_µmolL') && <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Beaker className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Phosphate</span></div><span>{activeEntry && activeEntry.Phosphate_µmolL != null ? `${activeEntry.Phosphate_µmolL} µmol/L` : 'N/A'}</span></div>}
      {availableChartKeys.includes('Silicate_µmolL') && <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Beaker className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Silicate</span></div><span>{activeEntry && activeEntry.Silicate_µmolL != null ? `${activeEntry.Silicate_µmolL} µmol/L` : 'N/A'}</span></div>}
    </>
  )

  const WeatherSummary = () => (
    <>
      {availableChartKeys.includes('SST_Skin_°C') && <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Thermometer className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">SST</span></div><span>{activeEntry && activeEntry['SST_Skin_°C'] != null ? `${activeEntry['SST_Skin_°C']} °C` : 'N/A'}</span></div>}
      {availableChartKeys.includes('Air_Temperature_°C') && <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Thermometer className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Air Temp</span></div><span>{activeEntry && activeEntry['Air_Temperature_°C'] != null ? `${activeEntry['Air_Temperature_°C']} °C` : 'N/A'}</span></div>}
      {availableChartKeys.includes('Wind_Speed_m/s') && <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Wind className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Wind Speed</span></div><span>{activeEntry && activeEntry['Wind_Speed_m/s'] != null ? `${activeEntry['Wind_Speed_m/s']} m/s` : 'N/A'}</span></div>}
      {availableChartKeys.includes('Wave_Height_m') && <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Waves className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Wave Height</span></div><span>{activeEntry && activeEntry['Wave_Height_m'] != null ? `${activeEntry['Wave_Height_m']} m` : 'N/A'}</span></div>}
      {availableChartKeys.includes('Current_Speed_m/s') && <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Gauge className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Current Speed</span></div><span>{activeEntry && activeEntry['Current_Speed_m/s'] != null ? `${activeEntry['Current_Speed_m/s']} m/s` : 'N/A'}</span></div>}
    </>
  )

  return (
    <div className="space-y-6">
      <PageHeader />

      {chartType === 'none' && <MetadataCard />}

      {chartType !== 'none' && chartConfig && (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle>{dataset.name}</CardTitle>
                                <CardDescription>Visualize parameters for your dataset.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn( "w-[260px] justify-start text-left font-normal", !date && "text-muted-foreground")}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? ( date.to ? ( <> {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")} </> ) : ( format(date.from, "LLL dd, y") ) ) : ( <span>Pick a date</span> )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
                                </PopoverContent>
                                </Popover>
                            </div>
                        </CardHeader>
                        <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                            <AreaChart
                                data={filteredData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                onMouseMove={(state) => { if (state.isTooltipActive && state.activePayload?.[0]?.payload) { setActiveEntry(state.activePayload[0].payload) } }}
                            >
                                <defs>
                                    {Object.keys(chartConfig).map(key => (
                                        <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={(chartConfig as any)[key].color} stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor={(chartConfig as any)[key].color} stopOpacity={0.1}/>
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="Date" tickFormatter={(value) => { try { return format(parseISO(value), "MMM d") } catch (e) { return "" } }} padding={{ left: 20, right: 20 }} />
                                <YAxis yAxisId="left" orientation="left" domain={['dataMin - 1', 'dataMax + 1']} hide />
                                <YAxis yAxisId="right" orientation="right" domain={['dataMin - 1', 'dataMax + 1']} hide/>
                                
                                <Tooltip content={<ChartTooltipContent />} />
                                <Legend />
                                {availableChartKeys.map((key, index) => {
                                    const yAxisId = index % 2 === 0 ? 'left' : 'right';
                                    return <Area key={key} yAxisId={yAxisId} type="natural" dataKey={key} stroke={(chartConfig as any)[key].color} fillOpacity={1} fill={`url(#color${key})`} name={(chartConfig as any)[key].label} dot={false} />
                                })}
                            </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Summary</CardTitle>
                        <CardDescription>Details for {activeEntry ? format(parseISO(activeEntry.Date), "yyyy-MM-dd") : "N/A"}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="flex items-center justify-between"><span className="text-muted-foreground">Latitude</span><span>{activeEntry?.Latitude != null ? activeEntry?.Latitude.toFixed(4) : "N/A"}</span></div>
                        <div className="flex items-center justify-between"><span className="text-muted-foreground">Longitude</span><span>{activeEntry?.Longitude != null ? activeEntry?.Longitude.toFixed(4) : "N/A"}</span></div>
                        
                        {chartType === 'oceanography' && <OceanographySummary />}
                        {chartType === 'weather' && <WeatherSummary />}
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader><CardTitle>Raw Data</CardTitle></CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        {availableChartKeys.map(key => <TableHead key={key}>{(chartConfig as any)[key].label}</TableHead>)}
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredData.length > 0 ? (
                        filteredData.map((entry, index) => (
                        <TableRow key={index} className={cn(entry === activeEntry && "bg-muted/50")}>
                            <TableCell>{entry.Date}</TableCell>
                            {availableChartKeys.map(key => <TableCell key={key}>{entry[key] != null ? entry[key] : 'N/A'}</TableCell>)}
                            <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => handleViewSummary(entry)}>View Summary</Button></TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow><TableCell colSpan={availableChartKeys.length + 2} className="h-24 text-center">No data available for the selected date range.</TableCell></TableRow>
                    )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </>
      )}
    </div>
  );
}

    