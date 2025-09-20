"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Thermometer } from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { oceanAtmosphereData } from "@/lib/data";
import OceanAtmosphereChart from "@/components/ocean-atmosphere-chart";

export default function OceanAtmospherePage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2025, 7, 1),
    to: addDays(new Date(2025, 7, 1), 29),
  });

  const filteredData = oceanAtmosphereData.filter((item) => {
    const itemDate = new Date(item.date);
    if (date?.from && itemDate < date.from) return false;
    if (date?.to && itemDate > date.to) return false;
    return true;
  });

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Ocean Atmosphere Analysis</CardTitle>
            <CardDescription>
              Visualize atmospheric and ocean surface data.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
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
          </div>
        </CardHeader>
        <CardContent>
          <OceanAtmosphereChart data={filteredData} />
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Thermometer className="h-6 w-6" />
            <CardTitle>Raw Data</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative max-h-[400px] overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-card">
                <tr>
                  <th className="p-2">Date</th>
                  <th className="p-2">Latitude</th>
                  <th className="p-2">Longitude</th>
                  <th className="p-2">Skin Temp</th>
                  <th className="p-2">Air Temp (3m)</th>
                  <th className="p-2">Vent Temp</th>
                  <th className="p-2">Vent Speed</th>
                  <th className="p-2">Pressure</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{item.date}</td>
                    <td className="p-2">{item.latitude}</td>
                    <td className="p-2">{item.longitude}</td>
                    <td className="p-2">{item.skinTemp.toFixed(2)}°C</td>
                    <td className="p-2">{item.airTemp3m.toFixed(2)}°C</td>
                    <td className="p-2">{item.ventTemp.toFixed(2)}°C</td>
                    <td className="p-2">{item.ventSpeed.toFixed(2)} m/s</td>
                    <td className="p-2">{item.pressure.toFixed(2)} hPa</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    