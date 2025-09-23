
"use client";

import {
  Activity,
  ArrowUpRight,
  Database,
  FileClock,
  FlaskConical,
  Dna,
  Users,
  CheckCircle,
  AlertCircle,
  Waves
} from "lucide-react";
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
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { ref, onValue, off } from "firebase/database";
import { database } from "@/lib/firebase";
import type { Dataset, DatasetType } from "@/lib/data";
import OceanParameterChart from "@/components/ocean-parameter-chart";
import DataCollectionTrendsChart from "@/components/data-collection-trends-chart";
import DataQualityDistributionChart from "@/components/data-quality-distribution-chart";

const datasetTypeToTableName = (type: DatasetType): string => {
  return type.toLowerCase().replace(/ /g, '_');
}

export default function Dashboard() {
  const { user, role } = useAuth();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allDatasetTypes: DatasetType[] = [
      "Physical Oceanography",
      "Chemical Oceanography",
      "Marine Weather",
      "Ocean Atmosphere",
      "eDNA"
    ];

    const listeners: { ref: any; listener: any }[] = [];

    allDatasetTypes.forEach(type => {
      const tableName = datasetTypeToTableName(type);
      const datasetsRef = ref(database, tableName);
      
      const listener = onValue(datasetsRef, (snapshot) => {
        const datasetsData = snapshot.val();
        let datasetsArray: Dataset[] = [];
        if (datasetsData) {
          datasetsArray = Object.keys(datasetsData).map(
            (key) => ({
              id: key,
              ...datasetsData[key],
              type: type,
            })
          );
        }
        
        setDatasets(currentDatasets => {
          const otherDatasets = currentDatasets.filter(d => d.type !== type);
          return [...otherDatasets, ...datasetsArray];
        });

      });
      listeners.push({ ref: datasetsRef, listener });
    });

    setLoading(false);


    return () => {
      listeners.forEach(({ ref, listener }) => {
        off(ref, "value", listener);
      });
    };
  }, []);

  useEffect(() => {
    let filteredDatasets;
    if (role === "Student" || role === "Researcher") {
      filteredDatasets = datasets.filter(
        (d) =>
          d.status === "Approved" ||
          (d.submittedBy === user?.email && d.status !== 'Approved')
      );
    } else {
      filteredDatasets = datasets;
    }
  }, [datasets, role, user]);


  const totalDatasets = datasets.length;
  const pendingSubmissions = datasets.filter(
    (d) => d.status === "Pending" && d.submittedBy === user?.email
  ).length;

  const totalRecords = datasets.reduce(
    (acc, dataset) => acc + (dataset.records || 0),
    0
  );

  const recentActivityCount = datasets.filter((d) => {
    const submissionDate = new Date(d.date);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return submissionDate > oneMonthAgo;
  }).length;

  const recentDatasets = [...datasets]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Datasets
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDatasets}</div>
            <p className="text-xs text-muted-foreground">
              Available for analysis
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Submissions
            </CardTitle>
            <FileClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{pendingSubmissions}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all datasets
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{recentActivityCount}</div>
            <p className="text-xs text-muted-foreground">
              Datasets added this month
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Recent Datasets</CardTitle>
              <CardDescription>
                Recently approved and submitted datasets.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="#">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dataset</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Date Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDatasets.map((dataset) => (
                  <TableRow key={dataset.id}>
                    <TableCell>
                      <div className="font-medium">{dataset.name}</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        {dataset.records.toLocaleString()} records
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{dataset.type}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{dataset.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Data Quality Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <DataQualityDistributionChart />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Ocean Parameter Trends</CardTitle>
            <CardDescription>
              Monthly average temperature and salinity in the Southern Ocean.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OceanParameterChart />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
