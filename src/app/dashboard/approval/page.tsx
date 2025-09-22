"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { Dataset, DatasetType } from "@/lib/data";
import { database } from "@/lib/firebase";
import { Check, Download, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";

const datasetTypeToTableName = (type: DatasetType): string => {
  return type.toLowerCase().replace(/ /g, '_');
}

export default function ApprovalPage() {
  const { role } = useAuth();
  const router = useRouter();
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  useEffect(() => {
    if (role !== "CMLRE") {
      router.push("/dashboard");
    }
  }, [role, router]);

  useEffect(() => {
    const allDatasetTypes: DatasetType[] = [
      "Physical Oceanography",
      "Chemical Oceanography",
      "Marine Weather",
      "Ocean Atmosphere",
      "Fisheries",
      "eDNA"
    ];

    let allDatasets: Dataset[] = [];
    let listeners: any[] = [];

    allDatasetTypes.forEach(type => {
      const tableName = datasetTypeToTableName(type);
      const datasetsRef = ref(database, tableName);
      
      const listener = onValue(datasetsRef, (snapshot) => {
        if (snapshot.exists()) {
          const datasetsData = snapshot.val();
          const datasetsArray: Dataset[] = Object.keys(datasetsData).map(
            (key) => ({
              id: key,
              ...datasetsData[key],
            })
          );
          
          allDatasets = allDatasets.filter(d => d.type !== type).concat(datasetsArray);
          const pending = allDatasets.filter(d => d.status === "Pending");
          setDatasets(pending);
        }
      });
      listeners.push({ref: datasetsRef, listener});
    });

    return () => {
      // Detach listeners
    };
  }, []);

  const handleApproval = (dataset: Dataset, newStatus: "Approved" | "Rejected") => {
    const tableName = datasetTypeToTableName(dataset.type);
    const datasetRef = ref(database, `${tableName}/${dataset.id}`);
    update(datasetRef, { status: newStatus });
  };
  
  if (role !== "CMLRE") {
    return (
        <Card className="flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You do not have permission to view this page.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Submissions Review</CardTitle>
        <CardDescription>
          Review, approve, or reject datasets submitted by researchers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dataset Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datasets.map((dataset) => (
              <TableRow key={dataset.id}>
                <TableCell className="font-medium">{dataset.name}</TableCell>
                <TableCell><Badge variant="secondary">{dataset.type}</Badge></TableCell>
                <TableCell>{dataset.submittedBy}</TableCell>
                <TableCell>{dataset.date}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3 mr-2" />
                      View Data
                    </Button>
                    {dataset.status === "Pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:text-green-600 hover:bg-green-50 border-green-200 hover:border-green-300"
                          onClick={() => handleApproval(dataset, "Approved")}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
                           onClick={() => handleApproval(dataset, "Rejected")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
