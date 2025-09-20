"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Wind, Droplets, Waves, Thermometer, Gauge } from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { physicalOceanographyData } from "@/lib/data";
import WaveformChart from "@/components/waveform-chart";
import { Calendar } from "@/components/ui/calendar";

type DataPoint = typeof physicalOceanographyData[0];

export default function PhysicalOceanographyPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2025, 7, 1),
    to: addDays(new Date(2025, 7, 1), 29),
  });
  const [selectedData, setSelectedData] = useState<DataPoint | null>(null);

  const filteredData = physicalOceanographyData.filter((item) => {
    const itemDate = new Date(item.date);
    if (date?.from && itemDate < date.from) return false;
    if (date?.to && itemDate > date.to) return false;
    return true;
  });

  const handleRowClick = (item: DataPoint) => {
    setSelectedData(item);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 grid gap-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Physical Oceanography</CardTitle>
              <CardDescription>
                Visualize wave height, tide, and other physical parameters.
              </CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className="w-[300px] justify-start text-left font-normal"
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
                    <span>Pick a date range</span>
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
          </CardHeader>
          <CardContent>
            <WaveformChart data={filteredData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Raw Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative max-h-[400px] overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 bg-card">
                  <tr>
                    <th className="p-2">Date</th>
                    <th className="p-2">Temp (°C)</th>
                    <th className="p-2">Salinity</th>
                    <th className="p-2">Wave Height (m)</th>
                    <th className="p-2">Tide (m)</th>
                    <th className="p-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr key={item.date} className="border-b">
                      <td className="p-2">{item.date}</td>
                      <td className="p-2">{item.temperature.toFixed(2)}</td>
                      <td className="p-2">{item.salinity.toFixed(2)}</td>
                      <td className="p-2">{item.waveHeight.toFixed(2)}</td>
                      <td className="p-2">{item.tide.toFixed(2)}</td>
                      <td className="p-2 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRowClick(item)}
                        >
                          View Summary
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle>Daily Summary</CardTitle>
            <CardDescription>
              {selectedData
                ? `Details for ${selectedData.date}`
                : "Select a date from the table to see details."}
            </CardDescription>
          </CardHeader>
          {selectedData ? (
            <CardContent className="grid gap-4 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center"><Thermometer className="mr-2 h-4 w-4"/>Temperature</span>
                    <span>{selectedData.temperature.toFixed(2)}°C</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center"><Droplets className="mr-2 h-4 w-4"/>Salinity</span>
                    <span>{selectedData.salinity.toFixed(2)} PSU</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center"><Gauge className="mr-2 h-4 w-4"/>Density</span>
                    <span>{selectedData.density.toFixed(2)} kg/m³</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center"><Waves className="mr-2 h-4 w-4"/>Wave Height</span>
                    <span>{selectedData.waveHeight.toFixed(2)} m</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center"><Waves className="mr-2 h-4 w-4"/>Tide</span>
                    <span>{selectedData.tide.toFixed(2)} m</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center"><Wind className="mr-2 h-4 w-4"/>Ventilation Speed</span>
                    <span>{selectedData.ventSpeed.toFixed(2)} m/s</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center"><Waves className="mr-2 h-4 w-4"/>Velocity Anomaly</span>
                    <span>{selectedData.velAnomaly.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center"><Droplets className="mr-2 h-4 w-4"/>Mixing Index</span>
                    <span>{selectedData.mixingIndex.toFixed(2)}</span>
                </div>
            </CardContent>
          ) : (
            <CardContent>
              <p className="text-muted-foreground">No date selected.</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
