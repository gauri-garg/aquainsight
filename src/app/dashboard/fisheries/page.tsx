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
import { Calendar as CalendarIcon, Fish, Anchor } from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";
import FisheriesChart from "@/components/fisheries-chart";

type DataPoint = {
  date: string;
  latitude: number;
  longitude: number;
  species: string;
  catch_kg: number;
  gear_type: string;
  vessel: string;
};

export default function FisheriesPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2025, 0, 1),
    to: addDays(new Date(2025, 0, 1), 60),
  });
  const [selectedData, setSelectedData] = useState<DataPoint | null>(null);
  const [fisheriesData, setFisheriesData] = useState<DataPoint[]>([]);

  useEffect(() => {
    const dataRef = ref(database, 'fisheries_data');
    const listener = onValue(dataRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const dataArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setFisheriesData(dataArray);
      }
    });

    return () => {
      // Detach listener
    };
  }, []);

  const filteredData = fisheriesData.filter((item) => {
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
              <CardTitle>Fisheries Data</CardTitle>
              <CardDescription>
                Visualize catch data and other fishery parameters.
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
            <FisheriesChart data={filteredData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Fish className="h-6 w-6" />
              <CardTitle>Raw Data</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative max-h-[400px] overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 bg-card">
                  <tr>
                    <th className="p-2">Date</th>
                    <th className="p-2">Species</th>
                    <th className="p-2">Catch (kg)</th>
                    <th className="p-2">Gear Type</th>
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
                      <td className="p-2">{item.species}</td>
                      <td className="p-2">{item.catch_kg}</td>
                      <td className="p-2">{item.gear_type}</td>
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
            <CardTitle>Catch Summary</CardTitle>
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
                <span className="text-muted-foreground flex items-center">
                  <Fish className="mr-2 h-4 w-4" />
                  Species
                </span>
                <span>{selectedData.species}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center">
                  <Anchor className="mr-2 h-4 w-4" />
                  Catch
                </span>
                <span>{selectedData.catch_kg} kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center">
                  <Anchor className="mr-2 h-4 w-4" />
                  Gear Type
                </span>
                <span>{selectedData.gear_type}</span>
              </div>
               <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center">
                  <Anchor className="mr-2 h-4 w-4" />
                  Vessel
                </span>
                <span>{selectedData.vessel}</span>
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
