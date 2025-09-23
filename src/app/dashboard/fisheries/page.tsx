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
  Anchor,
  Globe,
  Wind,
  Info,
  AlertTriangle,
  CheckCircle,
  Shield,
} from "lucide-react";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";
import FisheriesChart from "@/components/fisheries-chart";

type DataPoint = {
  species: string;
  scientificName: string;
  habitat: string;
  behavior: string;
  seasonalPattern: string;
  threats: string;
  stockStatus: string;
  managementMeasures: string;
};

export default function FisheriesPage() {
  const [selectedData, setSelectedData] = useState<DataPoint | null>(null);
  const [fisheriesData, setFisheriesData] = useState<DataPoint[]>([]);

  useEffect(() => {
    const dataRef = ref(database, 'fisheries_data');
    const listener = onValue(dataRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const dataArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setFisheriesData(dataArray);
        if (dataArray.length > 0) {
          setSelectedData(dataArray[0]);
        }
      }
    });

    return () => {
      // Detach listener
    };
  }, []);

  const handleRowClick = (item: DataPoint) => {
    setSelectedData(item);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="lg:col-span-2 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fisheries Data</CardTitle>
            <CardDescription>
              Explore data on various fish species, their habitats, and
              behaviors.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FisheriesChart data={fisheriesData} />
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
                    <th className="p-2">Species</th>
                    <th className="p-2">Scientific Name</th>
                    <th className="p-2">Habitat</th>
                    <th className="p-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fisheriesData.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(item)}
                    >
                      <td className="p-2 font-medium">{item.species}</td>
                      <td className="p-2 italic">{item.scientificName}</td>
                      <td className="p-2">{item.habitat}</td>
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
                ? `Details for ${selectedData.species}`
                : "Select a species from the table to see details."}
            </CardDescription>
          </CardHeader>
          {selectedData ? (
            <CardContent className="grid gap-4 text-sm">
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Behavior</span>
                <span className="ml-auto text-right">{selectedData.behavior}</span>
              </div>
              <div className="flex items-center gap-3">
                <Wind className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Seasonal Pattern</span>
                <span className="ml-auto text-right">{selectedData.seasonalPattern}</span>
              </div>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Threats</span>
                <span className="ml-auto text-right">{selectedData.threats}</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Stock Status</span>
                 <span className="ml-auto text-right">{selectedData.stockStatus}</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Management</span>
                 <span className="ml-auto text-right">{selectedData.managementMeasures}</span>
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
