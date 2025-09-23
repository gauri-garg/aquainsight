
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
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import OceanParameterChart from "@/components/ocean-parameter-chart";
import DataCollectionTrendsChart from "@/components/data-collection-trends-chart";
import DataQualityDistributionChart from "@/components/data-quality-distribution-chart";

type Submission = {
  id: string;
  datasetName: string;
  datasetType: string;
  submittedAt: {
    seconds: number;
  };
  status: "pending" | "approved" | "rejected";
  studentName: string;
  records?: number;
};

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" } = {
    approved: "default",
    pending: "secondary",
    rejected: "destructive",
}

export default function Dashboard() {
  const { user, role } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    if (!user) return;
    
    let q;
    if (role === 'CMLRE') {
        q = query(collection(firestore, "submissions"));
    } else {
        q = query(collection(firestore, "submissions"), where("studentId", "==", user.uid));
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userSubmissions: Submission[] = [];
        querySnapshot.forEach((doc) => {
            userSubmissions.push({ id: doc.id, ...doc.data() } as Submission);
        });
        setSubmissions(userSubmissions);
    });

    return () => unsubscribe();
  }, [user, role]);


  const totalDatasets = submissions.filter(s => s.status === 'approved').length;
  const pendingSubmissionsCount = submissions.filter(
    (d) => d.status === "pending"
  ).length;

  const totalRecords = submissions.reduce(
    (acc, dataset) => acc + (dataset.records || 0),
    0
  );

  const recentActivityCount = submissions.filter((d) => {
    const submissionDate = new Date(d.submittedAt.seconds * 1000);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return submissionDate > oneMonthAgo;
  }).length;

  const recentSubmissions = [...submissions]
    .sort((a, b) => b.submittedAt.seconds - a.submittedAt.seconds)
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
              Approved Datasets
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
            <div className="text-2xl font-bold">+{pendingSubmissionsCount}</div>
            <p className="text-xs text-muted-foreground">{role === 'CMLRE' ? 'Awaiting your review' : 'Awaiting approval'}</p>
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
              Datasets submitted this month
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>
                Your most recently submitted datasets.
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
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div className="font-medium">{submission.datasetName}</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        Submitted by {submission.studentName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{submission.datasetType}</Badge>
                    </TableCell>
                    <TableCell>
                       <Badge variant={statusVariant[submission.status] || 'secondary'} className="capitalize">{submission.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{new Date(submission.submittedAt.seconds * 1000).toLocaleDateString()}</TableCell>
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

