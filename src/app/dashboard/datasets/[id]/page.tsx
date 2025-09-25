
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

const parseCSV = (csvData: string): { data: any[], headers: string[] } => {
  if (!csvData) return { data: [], headers: [] };
  const lines = csvData.trim().split("\n");
  if (lines.length < 1) return { data: [], headers: [] };

  const originalHeaders = lines[0].split(",").map(h => h.trim());
  if (lines.length < 2) return { data: [], headers: originalHeaders };

  const dateHeaderKey = originalHeaders.find(h => h.toLowerCase().includes('date'));

  const data = lines.slice(1).map((line) => {
    const values = line.split(",");
    const entry: any = {};
    originalHeaders.forEach((header, index) => {
      const sanitizedHeader = header.replace(/[^a-zA-Z0-9]/g, '_');
      let value = values[index] ? values[index].trim() : '';
      
      if (header === dateHeaderKey && value) {
        try {
          const cleanedDate = value.split(' ')[0];
          entry[sanitizedHeader] = format(parseISO(cleanedDate), 'yyyy-MM-dd');
        } catch (e) {
          entry[sanitizedHeader] = value; 
        }
      } else if (value === '' || isNaN(Number(value)) || !isFinite(Number(value))) {
         entry[sanitizedHeader] = value === '' ? null : value;
      }
      else {
        entry[sanitizedHeader] = Number(value);
      }
    });
    return entry;
  });

  return { data, headers: originalHeaders };
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
  const [dateHeader, setDateHeader] = useState<string | null>(null);
  
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [activeEntry, setActiveEntry] = useState<any | null>(null);
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  useEffect(() => {
    if (id && typeof id === "string") {
      const fetchDataset = async () => {
        setLoading(true);
        try {
          const fetchedDataset = await getDatasetById(id);
          if (fetchedDataset) {
            setDataset(fetchedDataset);
            if (fetchedDataset.csvData) {
              const { data, headers } = parseCSV(fetchedDataset.csvData);
              setOriginalHeaders(headers);
              setParsedData(data);

              if (data.length > 0) {
                  const sanitizedHeaders = headers.map(h => h.replace(/[^a-zA-Z0-9]/g, '_'));
                  const detectedDateHeader = sanitizedHeaders.find(h => h.toLowerCase().includes('date'));
                  
                  if (detectedDateHeader) {
                    setDateHeader(detectedDateHeader);

                    const numericKeys = sanitizedHeaders.filter(
                      key => key !== detectedDateHeader && data.some(d => typeof d[key] === 'number')
                    );
                    
                    if (numericKeys.length > 0) {
                      setIsChartable(true);
                      setChartableKeys(numericKeys);

                      const config = generateChartConfig(numericKeys);
                      setChartConfig(config);

                      // Set initial date range
                      const dates = data.map(d => d[detectedDateHeader] ? parseISO(d[detectedDateHeader]) : null).filter(d => d && !isNaN(d.getTime()));
                      if (dates.length > 0) {
                        const minDate = new Date(Math.min(...dates.map(d => d!.getTime())));
                        const maxDate = new Date(Math.max(...dates.map(d => d!.getTime())));
                        setDate({ from: minDate, to: maxDate });
                      } else {
                         setDate({ from: addDays(new Date(), -28), to: new Date() });
                      }

                    } else {
                      setIsChartable(false);
                    }
                  } else {
                      setIsChartable(false);
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
    if (parsedData.length > 0 && isChartable && dateHeader) {
      const filtered = parsedData.filter(d => {
        if (!date?.from || !d[dateHeader]) return true;
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

      <MetadataCard />

      {isChartable && chartConfig && dateHeader && (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle>Dataset Visualization</CardTitle>
                                <CardDescription>Key metrics over time.</CardDescription>
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
                                    const color = (chartConfig as any)[key]?.color;
                                    return (
                                      <linearGradient
                                        key={key}
                                        id={`fill-${key}`}
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
                                    const yAxisId = index % 2 === 0 ? 'left' : 'right';
                                    return <Area key={key} yAxisId={yAxisId} type="monotone" dataKey={key} stroke={(chartConfig as any)[key].color} fillOpacity={0.4} fill={`url(#fill-${key})`} name={(chartConfig as any)[key].label} dot={false} activeDot={{ r: 8 }} />
                                })}
                            </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Summary</CardTitle>
                        <CardDescription>{activeEntry && activeEntry[dateHeader] ? format(parseISO(activeEntry[dateHeader]), "PPP") : "N/A"}</CardDescription>
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
                    {originalHeaders.map(header => <TableHead key={header}>{header.replace(/_/g, ' ')}</TableHead>)}
                    {isChartable && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredData.length > 0 ? (
                    filteredData.map((entry, index) => (
                    <TableRow key={index} className={cn(isChartable && entry === activeEntry && "bg-muted/50")}>
                        {originalHeaders.map(header => {
                           const sanitizedKey = header.replace(/[^a-zA-Z0-9]/g, '_');
                           return <TableCell key={header}>{entry[sanitizedKey] != null ? String(entry[sanitizedKey]) : 'N/A'}</TableCell>
                        })}
                        {isChartable && <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => handleViewSummary(entry)}>View Summary</Button></TableCell>}
                    </TableRow>
                    ))
                ) : (
                    <TableRow><TableCell colSpan={originalHeaders.length + (isChartable ? 1 : 0)} className="h-24 text-center">No data available for the selected date range.</TableCell></TableRow>
                )}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
    </div>
  );
}
