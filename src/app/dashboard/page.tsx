"use client";

import {
  Activity,
  ArrowUpRight,
  Database,
  FileClock,
  FlaskConical,
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
import { datasets as initialDatasets } from "@/lib/data";
import SpeciesDistributionChart from "@/components/species-distribution-chart";
import OceanParameterChart from "@/components/ocean-parameter-chart";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const { role } = useAuth();
  const [datasets, setDatasets] = useState(initialDatasets);
  
  useEffect(() => {
    if (role === 'Student' || role === 'Researcher') {
      setDatasets(initialDatasets.filter(d => d.status === 'Approved'));
    } else {
      setDatasets(initialDatasets);
    }
  }, [role]);

  const totalDatasets = datasets.length;
  const pendingSubmissions = initialDatasets.filter(
    (d) => d.status === "Pending"
  ).length;
  const totalRecords = datasets.reduce((sum, d) => sum + d.records, 0);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Datasets</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDatasets}</div>
            <p className="text-xs text-muted-foreground">
              {role === 'CMLRE' ? '+2 since last month' : 'Approved datasets'}
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
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Intl.NumberFormat("en-US", { notation: "compact" }).format(
                totalRecords
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all approved datasets
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
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
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
                Overview of the most recently {role === 'CMLRE' ? 'added' : 'approved'} datasets.
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
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  {role === 'CMLRE' && <TableHead className="hidden sm:table-cell">Status</TableHead>}
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Records</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datasets.slice(0, 5).map((dataset) => (
                  <TableRow key={dataset.id}>
                    <TableCell>
                      <div className="font-medium">{dataset.name}</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        {dataset.submittedBy}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {dataset.type}
                    </TableCell>
                    {role === 'CMLRE' && <TableCell className="hidden sm:table-cell">
                      <Badge
                        className="text-xs"
                        variant={
                          dataset.status === "Approved"
                            ? "default"
                            : dataset.status === "Pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {dataset.status}
                      </Badge>
                    </TableCell>}
                    <TableCell className="hidden md:table-cell">
                      {dataset.date}
                    </TableCell>
                    <TableCell className="text-right">
                      {Intl.NumberFormat("en-US").format(dataset.records)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Species Distribution</CardTitle>
            <CardDescription>
              Breakdown of species in recent eDNA surveys.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SpeciesDistributionChart />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Ocean Parameter Trends</CardTitle>
          <CardDescription>
            Monthly average sea surface temperature and salinity in the Southern
            Ocean.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OceanParameterChart />
        </CardContent>
      </Card>
    </>
  );
}
