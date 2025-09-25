
"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, Dataset } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Download } from "lucide-react";
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

const generateChartConfig = (keys: string[]): ChartConfig => {
  const config: ChartConfig = {};
  keys.forEach((key, index) => {
    const sanitizedKey = key.replace(/[^a-zA-Z0-9]/g, '_');
    config[sanitizedKey] = {
      label: key.replace(/_/g, " ").replace(/ C/g, "°C").replace(/ m s/g, " m/s"),
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    };
  });
  return config;
};

const parseCSV = (csvData: string): any[] => {
  if (!csvData) return [];
  const lines = csvData.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map(h => h.trim());
  const dateHeaderIndex = headers.findIndex(h => h.toLowerCase().includes('date'));
  if (dateHeaderIndex === -1) return []; // No date column found

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const entry: any = {};
    headers.forEach((header, index) => {
      const sanitizedHeader = header.replace(/[^a-zA-Z0-9]/g, '_');
      let value = values[index] ? values[index].trim() : '';
      
      if (header.toLowerCase().includes('date')) {
        try {
          // Handle potential extra characters or formatting issues
          const cleanedDate = value.split(' ')[0];
          entry[sanitizedHeader] = format(parseISO(cleanedDate), 'yyyy-MM-dd');
        } catch (e) {
          entry[sanitizedHeader] = null;
        }
      } else if (value === '' || isNaN(Number(value)) || !isFinite(Number(value))) {
        // Handles non-numeric strings or empty values as null for charting
         entry[sanitizedHeader] = null;
      }
      else {
        entry[sanitizedHeader] = Number(value);
      }
    });
    return entry;
  }).filter(d => d[headers[dateHeaderIndex].replace(/[^a-zA-Z0-9]/g, '_')]); // Filter out rows with invalid dates
};


export default function DatasetViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getDatasetById, role } = useAuth();
  const { toast } = useToast();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isChartable, setIsChartable] = useState<boolean>(false);
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);
  const [chartableKeys, setChartableKeys] = useState<string[]>([]);
  const [originalHeaders, setOriginalHeaders] = useState<string[]>([]);
  const [dateHeader, setDateHeader] = useState<string>('Date');
  
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
              if (data.length > 0) {
                  const headers = Object.keys(data[0]);
                  const detectedDateHeader = headers.find(h => h.toLowerCase().includes('date')) || headers[0];
                  setDateHeader(detectedDateHeader);

                  const numericKeys = headers.filter(
                    key => key !== detectedDateHeader && data.some(d => typeof d[key] === 'number')
                  );
                  
                  const stringKeys = headers.filter(
                    key => key !== detectedDateHeader && !numericKeys.includes(key)
                  );
                  
                  const originalCsvHeaders = fetchedDataset.csvData.split('\n')[0].split(',').map(h => h.trim());
                  setOriginalHeaders(originalCsvHeaders);

                  if (numericKeys.length > 0) {
                    setIsChartable(true);
                    setChartableKeys(numericKeys);
                    const originalNumericHeaders = originalCsvHeaders.filter(h => numericKeys.includes(h.replace(/[^a-zA-Z0-9]/g, '_')));
                    
                    const config = generateChartConfig(originalNumericHeaders);
                    setChartConfig(config);
                    setParsedData(data);
                  } else {
                    setIsChartable(false);
                     const rawData = fetchedDataset.csvData.trim().split('\n').slice(1).map(line => {
                        const values = line.split(',');
                        const entry: any = {};
                        originalCsvHeaders.forEach((header, index) => {
                           entry[header] = values[index];
                        });
                        return entry;
                     });
                     setParsedData(rawData);
                     setFilteredData(rawData);
                  }
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
          console.error("Error processing dataset:", error)
          toast({
            title: "Error",
            description: `Failed to fetch or process dataset: ${error.message}`,
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
    if (parsedData.length > 0 && isChartable) {
      const filtered = parsedData.filter(d => {
        if (!date?.from || !d[dateHeader]) return true; // Show all if no date filter
        try {
          const dataDate = parseISO(d[dateHeader]);
          const from = new Date(date.from.setHours(0,0,0,0));
          const to = date?.to ? new Date(date.to.setHours(23,59,59,999)) : new Date(from.setHours(23,59,59,999));
          return dataDate >= from && dataDate <= to;
        } catch(e) {
          return false;
        }
      });
      setFilteredData(filtered);
      setActiveEntry(filtered[filtered.length - 1] || filtered[0] || null);
    } else {
      setFilteredData(parsedData);
    }
  }, [date, parsedData, dateHeader, isChartable]);


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
  
  const allTableHeaders = isChartable ? originalHeaders : (parsedData.length > 0 ? Object.keys(parsedData[0]) : []);

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

  const DynamicSummary = () => {
    if (!activeEntry || !chartConfig) return null;
    
    return (
      <>
        {originalHeaders.map(originalHeader => {
            const sanitizedKey = originalHeader.replace(/[^a-zA-Z0-9]/g, '_');
            const label = (chartConfig as any)[sanitizedKey]?.label || originalHeader.replace(/_/g, ' ');
            const value = activeEntry[sanitizedKey];
             return (
                 <div key={originalHeader} className="flex items-center justify-between">
                    <span className="text-muted-foreground capitalize">{label}</span>
                    <span>{value != null ? String(value) : 'N/A'}</span>
                 </div>
             )
        })}
      </>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader />

      {!isChartable && <MetadataCard />}

      {isChartable && chartConfig && (
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
                                  {chartableKeys.map((key) => {
                                    const sanitizedKey = key.replace(/[^a-zA-Z0-9]/g, '_');
                                    const color = (chartConfig as any)[sanitizedKey]?.color;
                                    return (
                                      <linearGradient
                                        key={sanitizedKey}
                                        id={`fill-${sanitizedKey}`}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                      >
                                        <stop
                                          offset="5%"
                                          stopColor={color}
                                          stopOpacity={0.8}
                                        />
                                        <stop
                                          offset="95%"
                                          stopColor={color}
                                          stopOpacity={0.1}
                                        />
                                      </linearGradient>
                                    );
                                  })}
                                </defs>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey={dateHeader} tickFormatter={(value) => { try { return format(parseISO(value), "MMM d") } catch (e) { return "" } }} padding={{ left: 20, right: 20 }} />
                                <YAxis yAxisId="left" orientation="left" domain={['dataMin - 1', 'dataMax + 1']} hide />
                                <YAxis yAxisId="right" orientation="right" domain={['dataMin - 1', 'dataMax + 1']} hide/>
                                
                                <Tooltip content={<ChartTooltipContent />} />
                                <Legend />
                                {chartableKeys.map((key, index) => {
                                    const sanitizedKey = key.replace(/[^a-zA-Z0-9]/g, '_');
                                    const yAxisId = index % 2 === 0 ? 'left' : 'right';
                                    return <Area key={key} yAxisId={yAxisId} type="monotone" dataKey={key} stroke={(chartConfig as any)[sanitizedKey].color} fillOpacity={0.4} fill={`url(#fill-${sanitizedKey})`} name={(chartConfig as any)[sanitizedKey].label} dot={false} activeDot={{ r: 8 }} />
                                })}
                            </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Summary</CardTitle>
                        <CardDescription>Details for {activeEntry && activeEntry[dateHeader] ? format(parseISO(activeEntry[dateHeader]), "PPP") : "N/A"}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <DynamicSummary />
                    </CardContent>
                </Card>
            </div>
        </>
      )}
       <Card>
            <CardHeader><CardTitle>Raw Data</CardTitle></CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    {allTableHeaders.map(key => <TableHead key={key} className="capitalize">{chartConfig && (chartConfig as any)[key.replace(/[^a-zA-Z0-9]/g, '_')]?.label || key.replace(/_/g, ' ')}</TableHead>)}
                    {isChartable && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredData.length > 0 ? (
                    filteredData.map((entry, index) => (
                    <TableRow key={index} className={cn(isChartable && entry === activeEntry && "bg-muted/50")}>
                        {allTableHeaders.map(key => {
                           const sanitizedKey = key.replace(/[^a-zA-Z0-9]/g, '_');
                           return <TableCell key={key}>{entry[sanitizedKey] != null ? String(entry[sanitizedKey]) : 'N/A'}</TableCell>
                        })}
                        {isChartable && <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => handleViewSummary(entry)}>View Summary</Button></TableCell>}
                    </TableRow>
                    ))
                ) : (
                    <TableRow><TableCell colSpan={allTableHeaders.length + 1} className="h-24 text-center">No data available for the selected date range.</TableCell></TableRow>
                )}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
    </div>
  );
}

    