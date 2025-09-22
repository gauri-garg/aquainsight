
"use client";

import {
  Activity,
  ArrowUpRight,
  Database,
  FileClock,
  FlaskConical,
  BarChart,
  Fish,
  Dna,
  FolderKanban,
  AreaChart,
  LineChart as LineChartIcon
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
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";
import type { Dataset, DatasetType } from "@/lib/data";
import DataCollectionTrendsChart from "@/components/data-collection-trends-chart";
import DataQualityDistributionChart from "@/components/data-quality-distribution-chart";
import GeographicDistributionMap from "@/components/geographic-distribution-map";
import { recentActivity } from "@/lib/data";

export default function Dashboard() {
  const { user, role } = useAuth();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const datasetsRef = ref(database, "datasets");
    const unsubscribe = onValue(datasetsRef, (snapshot) => {
      if (snapshot.exists()) {
        const datasetsData = snapshot.val();
        const datasetsArray: Dataset[] = Object.keys(datasetsData).map(
          (key) => ({
            id: key,
            ...datasetsData[key],
          })
        );
        if (role === "Student" || role === "Researcher") {
          setDatasets(datasetsArray.filter((d) => d.status === "Approved"));
        } else {
          setDatasets(datasetsArray);
        }
      } else {
        setDatasets([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [role]);
  
  const totalDatasets = datasets.length;
  const oceanographicCount = datasets.filter(d => d.type === "Physical Oceanography" || d.type === "Chemical Oceanography").length;
  const fisheriesCount = datasets.filter(d => d.type === "Fisheries").length;
  const molecularCount = datasets.filter(d => d.type === "eDNA").length || 1; // Mocked
  const activeProjects = 2; // Mocked

  const getStatChange = (type: string) => {
      switch(type) {
          case 'total': return "+12% this month";
          case 'oceanographic': return "+8% this week";
          case 'fisheries': return "+15% this month";
          case 'molecular': return "+6% this week";
          case 'active': return "3 new projects";
          default: return "";
      }
  }


  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ocean Intelligence Dashboard</h1>
          <p className="text-muted-foreground">Unified insights across oceanographic, fisheries, and molecular biodiversity data</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline"><LineChartIcon className="mr-2 h-4 w-4"/>Generate Report</Button>
            <Button><BarChart className="mr-2 h-4 w-4"/>Run AI Analysis</Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Datasets</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDatasets}</div>
            <p className="text-xs text-muted-foreground">
              {getStatChange('total')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Oceanographic
            </CardTitle>
            <AreaChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{oceanographicCount}</div>
            <p className="text-xs text-muted-foreground">{getStatChange('oceanographic')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fisheries</CardTitle>
            <Fish className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fisheriesCount}</div>
            <p className="text-xs text-muted-foreground">
              {getStatChange('fisheries')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Molecular
            </CardTitle>
            <Dna className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{molecularCount}</div>
            <p className="text-xs text-muted-foreground">
              {getStatChange('molecular')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Projects
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              {getStatChange('active')}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-5">
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Data Collection Trends</CardTitle>
            </CardHeader>
            <CardContent>
                <DataCollectionTrendsChart />
            </CardContent>
        </Card>
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Data Quality Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <DataQualityDistributionChart />
            </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Location of recent data collection points.</CardDescription>
            </CardHeader>
            <CardContent>
                <GeographicDistributionMap />
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4">
                        <div className="bg-muted p-2 rounded-md">
                            <Waves className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">{activity.type} <span className="text-xs text-muted-foreground ml-2">{activity.timestamp}</span></p>
                            <p className="text-sm text-muted-foreground">{activity.details}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
      </div>
    </>
  );
}
