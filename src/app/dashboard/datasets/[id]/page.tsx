
"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, Dataset } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Download, Beaker, Droplet, Waves } from "lucide-react";
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

const chartConfig = {
  pH: { label: "pH", color: "hsl(var(--chart-1))" },
  Salinity_PSU: { label: "Salinity (PSU)", color: "hsl(var(--chart-5))" },
  Nitrate_µmolL: { label: "Nitrate (µmol/L)", color: "hsl(var(--chart-2))" },
  Phosphate_µmolL: { label: "Phosphate (µmol/L)", color: "hsl(var(--chart-3))" },
  Silicate_µmolL: { label: "Silicate (µmol/L)", color: "hsl(var(--chart-4))" },
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
        entry[header] = isNaN(Number(value)) || value === '' ? value : Number(value);
    });
    return entry;
  });
};

export default function DatasetViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getDatasetById, role } = useAuth();
  const { toast } = useToast();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [isChartable, setIsChartable] = useState(false);
  
  // Chart-specific state
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [activeEntry, setActiveEntry] = useState<any | null>(null);
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -28),
    to: new Date(),
  });

  const chartableHeaders = useMemo(() => ['Date', 'pH', 'Salinity_PSU', 'Nitrate_µmolL', 'Phosphate_µmolL', 'Silicate_µmolL'], []);

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
              const hasRequiredHeaders = chartableHeaders.every(h => headers.includes(h));
              
              if (hasRequiredHeaders) {
                setIsChartable(true);
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
            description: "Failed to fetch dataset.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchDataset();
    }
  }, [id, getDatasetById, router, toast, chartableHeaders]);

  useEffect(() => {
    if (parsedData.length > 0 && isChartable) {
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
  }, [date, parsedData, isChartable]);


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
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <PageHeader />

      {!isChartable && <MetadataCard />}

      {isChartable && (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle>{dataset.name}</CardTitle>
                                <CardDescription>Visualize chemical parameters of the ocean.</CardDescription>
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
                                            <stop offset="5%" stopColor={chartConfig[key as keyof typeof chartConfig].color} stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor={chartConfig[key as keyof typeof chartConfig].color} stopOpacity={0.1}/>
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="Date" tickFormatter={(value) => { try { return format(parseISO(value), "MMM d") } catch (e) { return "" } }} padding={{ left: 20, right: 20 }} />
                                <YAxis yAxisId="ph" domain={['dataMin - 0.1', 'dataMax + 0.1']} hide />
                                <YAxis yAxisId="salinity" orientation="right" domain={['dataMin - 1', 'dataMax + 1']} hide/>
                                <YAxis yAxisId="nutrients" orientation="right" hide />
                                <Tooltip content={<ChartTooltipContent />} />
                                <Legend />
                                {Object.keys(chartConfig).map(key => {
                                    const yAxisId = key === 'pH' ? 'ph' : key === 'Salinity_PSU' ? 'salinity' : 'nutrients';
                                    return <Area key={key} yAxisId={yAxisId} type="natural" dataKey={key} stroke={chartConfig[key as keyof typeof chartConfig].color} fillOpacity={1} fill={`url(#color${key})`} name={chartConfig[key as keyof typeof chartConfig].label} dot={false} />
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
                        <div className="flex items-center justify-between"><span className="text-muted-foreground">Latitude</span><span>{activeEntry?.Latitude?.toFixed(4) || "N/A"}</span></div>
                        <div className="flex items-center justify-between"><span className="text-muted-foreground">Longitude</span><span>{activeEntry?.Longitude?.toFixed(4) || "N/A"}</span></div>
                        <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Droplet className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Salinity</span></div><span>{activeEntry ? `${activeEntry.Salinity_PSU} PSU` : 'N/A'}</span></div>
                        <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Waves className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">pH</span></div><span>{activeEntry?.pH?.toFixed(2) || "N/A"}</span></div>
                        <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Beaker className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Nitrate</span></div><span>{activeEntry ? `${activeEntry.Nitrate_µmolL} µmol/L` : 'N/A'}</span></div>
                        <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Beaker className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Phosphate</span></div><span>{activeEntry ? `${activeEntry.Phosphate_µmolL} µmol/L` : 'N/A'}</span></div>
                        <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Beaker className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Silicate</span></div><span>{activeEntry ? `${activeEntry.Silicate_µmolL} µmol/L` : 'N/A'}</span></div>
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
                        <TableHead>pH</TableHead>
                        <TableHead>Salinity</TableHead>
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
                            <TableCell>{entry.pH?.toFixed(2)}</TableCell>
                            <TableCell>{entry.Salinity_PSU} PSU</TableCell>
                            <TableCell>{entry.Nitrate_µmolL} µmol/L</TableCell>
                            <TableCell>{entry.Phosphate_µmolL} µmol/L</TableCell>
                            <TableCell>{entry.Silicate_µmolL} µmol/L</TableCell>
                            <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => handleViewSummary(entry)}>View Summary</Button></TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow><TableCell colSpan={7} className="h-24 text-center">No data available for the selected date range.</TableCell></TableRow>
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

    