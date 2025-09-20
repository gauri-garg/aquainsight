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
import {
  Calendar as CalendarIcon,
  Beaker,
  Droplets,
  Waves,
  Thermometer,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { chemicalOceanographyData } from "@/lib/data";
import ChemicalOceanographyChart from "@/components/chemical-oceanography-chart";

type DataPoint = (typeof chemicalOceanographyData)[0];

export default function ChemicalOceanographyPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2025, 7, 2),
    to: addDays(new Date(2025, 7, 2), 28),
  });
  const [selectedData, setSelectedData] = useState<DataPoint | null>(null);

  const filteredData = chemicalOceanographyData.filter((item) => {
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
              <CardTitle>Chemical Oceanography</CardTitle>
              <CardDescription>
                Visualize chemical parameters of the ocean.
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
            <ChemicalOceanographyChart data={filteredData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Beaker className="h-6 w-6" />
              <CardTitle>Raw Data</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative max-h-[400px] overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 bg-card">
                  <tr>
                    <th className="p-2">Date</th>
                    <th className="p-2">pH</th>
                    <th className="p-2">Nitrate</th>
                    <th className="p-2">Phosphate</th>
                    <th className="p-2">Silicate</th>
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
                      <td className="p-2">{item.pH.toFixed(2)}</td>
                      <td className="p-2">{item.nitrate.toFixed(2)} μmol/L</td>
                      <td className="p-2">{item.phosphate.toFixed(2)} μmol/L</td>
                      <td className="p-2">{item.silicate.toFixed(2)} μmol/L</td>
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
                <span className="text-muted-foreground">Latitude</span>
                <span>{selectedData.latitude}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Longitude</span>
                <span>{selectedData.longitude}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center">
                  <Droplets className="mr-2 h-4 w-4" />
                  Salinity
                </span>
                <span>{selectedData.salinity.toFixed(2)} PSU</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center">
                  <Waves className="mr-2 h-4 w-4" />
                  pH
                </span>
                <span>{selectedData.pH.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center">
                  <Beaker className="mr-2 h-4 w-4" />
                  Nitrate
                </span>
                <span>{selectedData.nitrate.toFixed(2)} μmol/L</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center">
                  <Beaker className="mr-2 h-4 w-4" />
                  Phosphate
                </span>
                <span>{selectedData.phosphate.toFixed(2)} μmol/L</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center">
                  <Beaker className="mr-2 h-4 w-4" />
                  Silicate
                </span>
                <span>{selectedData.silicate.toFixed(2)} μmol/L</span>
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
