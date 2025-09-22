"use client";

import { useEffect, useState } from "react";
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
import OceanAtmosphereChart from "@/components/ocean-atmosphere-chart";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";

type DataPoint = {
    date: string;
    latitude: number;
    longitude: number;
    skinTemp: number;
    airTemp3m: number;
    ventTemp: number;
    ventSpeed: number;
    pressure: number;
};


export default function OceanAtmospherePage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2025, 7, 1),
    to: addDays(new Date(2025, 7, 1), 29),
  });
  const [selectedData, setSelectedData] = useState<DataPoint | null>(null);
  const [oceanAtmosphereData, setOceanAtmosphereData] = useState<DataPoint[]>([]);

  useEffect(() => {
    const dataRef = ref(database, 'ocean_atmosphere_data');
    const listener = onValue(dataRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const dataArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setOceanAtmosphereData(dataArray);
      }
    });

    return () => {
      // Detach listener
    };
  }, []);

  const filteredData = oceanAtmosphereData.filter((item) => {
    const itemDate = new Date(item.date);
    if (date?.from && itemDate < date.from) return false;
    if (date?.to && itemDate > date.to) return false;
    return true;
  });

  const handleRowClick = (item: DataPoint) => {
    setSelectedData(item);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="lg:col-span-2 grid gap-6">
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
                    <th className="p-2">Skin Temp</th>
                    <th className="p-2">Air Temp (3m)</th>
                    <th className="p-2">Vent Temp</th>
                    <th className="p-2">Pressure</th>
                    <th className="p-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(item)}
                    >
                      <td className="p-2">{item.date}</td>
                      <td className="p-2">{item.skinTemp.toFixed(2)}°C</td>
                      <td className="p-2">{item.airTemp3m.toFixed(2)}°C</td>
                      <td className="p-2">{item.ventTemp.toFixed(2)}°C</td>
                      <td className="p-2">{item.pressure.toFixed(2)} hPa</td>
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
        <Card className="lg:sticky lg:top-6">
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
                <span className="text-muted-foreground">Latitude</span>
                <span>{selectedData.latitude}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Longitude</span>
                <span>{selectedData.longitude}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Skin Temp</span>
                <span>{selectedData.skinTemp.toFixed(2)}°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Air Temp (3m)</span>
                <span>{selectedData.airTemp3m.toFixed(2)}°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Vent Temp</span>
                <span>{selectedData.ventTemp.toFixed(2)}°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Vent Speed</span>
                <span>{selectedData.ventSpeed.toFixed(2)} m/s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Pressure</span>
                <span>{selectedData.pressure.toFixed(2)} hPa</span>
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
