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
import {
  Calendar as CalendarIcon,
  Wind,
  Waves,
  Thermometer,
  Gauge,
  Compass,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import MarineWeatherChart from "@/components/marine-weather-chart";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";

type DataPoint = {
    date: string;
    latitude: number;
    longitude: number;
    sstSkin: number;
    airTemp: number;
    currentSpeed: number;
    airPressure: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    waveHeight: number;
    waveDirection: number;
    wavePeriod: number;
    currentDirection: number;
};


export default function MarineWeatherPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2025, 7, 21),
    to: addDays(new Date(2025, 7, 21), 30),
  });
  const [selectedData, setSelectedData] = useState<DataPoint | null>(null);
  const [marineWeatherData, setMarineWeatherData] = useState<DataPoint[]>([]);

  useEffect(() => {
    const dataRef = ref(database, 'marine_weather_data');
    const listener = onValue(dataRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const dataArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setMarineWeatherData(dataArray);
        if (dataArray.length > 0 && !selectedData) {
          setSelectedData(dataArray[0]);
        }
      }
    });

    return () => {
      // Detach listener
    };
  }, [selectedData]);

  const filteredData = marineWeatherData.filter((item) => {
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
              <CardTitle>Marine Weather</CardTitle>
              <CardDescription>
                Visualize marine weather parameters.
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
            <MarineWeatherChart data={filteredData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wind className="h-6 w-6" />
              <CardTitle>Raw Data</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative max-h-[400px] overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 bg-card">
                  <tr>
                    <th className="p-2">Date</th>
                    <th className="p-2">SST (°C)</th>
                    <th className="p-2">Air Temp (°C)</th>
                    <th className="p-2">Wind Speed (m/s)</th>
                    <th className="p-2">Wave Height (m)</th>
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
                      <td className="p-2">{item.sstSkin.toFixed(2)}</td>
                      <td className="p-2">{item.airTemp.toFixed(2)}</td>
                      <td className="p-2">{item.windSpeed.toFixed(2)}</td>
                      <td className="p-2">{item.waveHeight.toFixed(2)}</td>
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
                <span className="text-muted-foreground flex items-center">
                  <Thermometer className="mr-2 h-4 w-4" />
                  SST Skin
                </span>
                <span>{selectedData.sstSkin.toFixed(2)}°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center">
                  <Thermometer className="mr-2 h-4 w-4" />
                  Air Temperature
                </span>
                <span>{selectedData.airTemp.toFixed(2)}°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center">
                  <Wind className="mr-2 h-4 w-4" />
                  Current Speed
                </span>
                <span>{selectedData.currentSpeed.toFixed(2)} m/s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center">
                  <Gauge className="mr-2 h-4 w-4" />
                  Air Pressure
                </span>
                <span>{selectedData.airPressure.toFixed(2)} hPa</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center">
                  <Wind className="mr-2 h-4 w-4" />
                  Wind Speed
                </span>
                <span>{selectedData.windSpeed.toFixed(2)} m/s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center">
                  <Compass className="mr-2 h-4 w-4" />
                  Wind Direction
                </span>
                <span>{selectedData.windDirection.toFixed(2)}°</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center">
                  <Waves className="mr-2 h-4 w-4" />
                  Wave Height
                </span>
                <span>{selectedData.waveHeight.toFixed(2)} m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center">
                  <Compass className="mr-2 h-4 w-4" />
                  Wave Direction
                </span>
                <span>{selectedData.waveDirection.toFixed(2)}°</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center">
                  <Waves className="mr-2 h-4 w-4" />
                  Wave Period
                </span>
                <span>{selectedData.wavePeriod.toFixed(2)} s</span>
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
