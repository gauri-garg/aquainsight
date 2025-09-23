
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
import {
  Fish,
  Thermometer,
  BookText,
  Calendar as CalendarIcon,
  Droplets,
  Waves,
  Wind,
  Home,
} from "lucide-react";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";
import FisheriesChart from "@/components/fisheries-chart";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

type DataPoint = {
  date: string;
  species_Common: string;
  species_Scientific: string;
  preferred_SST_C: string;
  Preferred_Salinity_PSU: string;
  Preferred_pH: string;
  Preferred_DO_mgL: string;
  Preferred_Habitat: string;
};

export default function FisheriesPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2024, 1, 1),
    to: new Date(2024, 1, 10),
  });
  const [selectedData, setSelectedData] = useState<DataPoint | null>(null);
  const [fisheriesData, setFisheriesData] = useState<DataPoint[]>([]);

  useEffect(() => {
    const dataRef = ref(database, 'fisheries_data');
    const listener = onValue(dataRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const dataArray: DataPoint[] = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setFisheriesData(dataArray);
        if (dataArray.length > 0 && !selectedData) {
          setSelectedData(dataArray[0]);
        }
      }
    });

    return () => {
      // Detach listener
    };
  }, [selectedData]);

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
                Explore data on various fish species and their preferred environmental conditions.
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
              <CardTitle>Species Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative max-h-[400px] overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 bg-card">
                  <tr>
                    <th className="p-2">Common Name</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Preferred SST (°C)</th>
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
                      <td className="p-2 font-medium">{item.species_Common}</td>
                      <td className="p-2">{item.date}</td>
                      <td className="p-2">{item.preferred_SST_C}</td>
                      <td className="p-2 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRowClick(item)}
                        >
                          View Details
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
            <CardTitle>Species Summary</CardTitle>
            <CardDescription>
              {selectedData
                ? `Details for ${selectedData.species_Common}`
                : "Select a species from the table to see details."}
            </CardDescription>
          </CardHeader>
          {selectedData ? (
            <CardContent className="grid gap-4 text-sm">
              <div className="flex items-center gap-3">
                <BookText className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Scientific Name</span>
                <span className="ml-auto text-right italic">{selectedData.species_Scientific}</span>
              </div>
              <div className="flex items-center gap-3">
                <Thermometer className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Preferred SST</span>
                <span className="ml-auto text-right">{selectedData.preferred_SST_C}°C</span>
              </div>
              <div className="flex items-center gap-3">
                <Droplets className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Preferred Salinity</span>
                <span className="ml-auto text-right">{selectedData.Preferred_Salinity_PSU} PSU</span>
              </div>
              <div className="flex items-center gap-3">
                <Waves className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Preferred pH</span>
                <span className="ml-auto text-right">{selectedData.Preferred_pH}</span>
              </div>
              <div className="flex items-center gap-3">
                <Wind className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Preferred DO</span>
                <span className="ml-auto text-right">{selectedData.Preferred_DO_mgL} mg/L</span>
              </div>
              <div className="flex items-start gap-3">
                <Home className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">Preferred Habitat</span>
                <span className="ml-auto text-right">{selectedData.Preferred_Habitat}</span>
              </div>
            </CardContent>
          ) : (
            <CardContent>
              <p className="text-muted-foreground">No species selected.</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

    