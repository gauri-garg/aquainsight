

"use client";

import { useEffect, useState } from "react";
import { useAuth, SubmissionStatusCounts, SubmissionStatus } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Database, FileText, UploadCloud, Layers } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";


export function UserDashboard() {
  const { user, userDetails, getTotalDatasets, getUserSubmissionsCount, getUserTotalRecords, getTotalRecords, getUserSubmissionsStatusCounts } = useAuth();
  
  const [totalDatasets, setTotalDatasets] = useState(0);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [userTotalRecords, setUserTotalRecords] = useState(0);
  const [platformTotalRecords, setPlatformTotalRecords] = useState(0);
  const [submissionStatusData, setSubmissionStatusData] = useState<{name: string, value: number}[]>([]);


  const STATUS_COLORS: Record<SubmissionStatus, string> = {
    approved: 'hsl(var(--chart-2))',
    pending: 'hsl(var(--chart-4))',
    rejected: 'hsl(var(--chart-5))',
    new: 'hsl(var(--chart-1))',
  };

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        const [datasetsCount, submissionsCount, userRecordsCount, platformRecordsCount, statusCounts] = await Promise.all([
          getTotalDatasets(),
          getUserSubmissionsCount(user.uid),
          getUserTotalRecords(user.uid),
          getTotalRecords(),
          getUserSubmissionsStatusCounts(user.uid),
        ]);
        setTotalDatasets(datasetsCount);
        setTotalSubmissions(submissionsCount);
        setUserTotalRecords(userRecordsCount);
        setPlatformTotalRecords(platformRecordsCount);
        
        if (statusCounts.total > 0) {
            const chartData = Object.entries(statusCounts)
                .filter(([key]) => key !== 'total')
                .map(([status, count]) => ({
                    name: status.charAt(0).toUpperCase() + status.slice(1),
                    value: count as number,
                }));
            setSubmissionStatusData(chartData);
        }
      };
      fetchData();
    }
  }, [user, getTotalDatasets, getUserSubmissionsCount, getUserTotalRecords, getTotalRecords, getUserSubmissionsStatusCounts]);
  
  const getTitle = () => {
    return `Welcome, ${userDetails?.fullName || user?.email || 'User'}!`;
  };

  const getDescription = () => {
     if (userDetails?.role === "Student") {
        return "Explore datasets, submit your findings, and contribute to marine science.";
      }
      if (userDetails?.role === "Researcher") {
        return "Access data, analyze trends, and collaborate with a community of scientists.";
      }
      return "Welcome to the AquaInsight platform.";
  };

  return (
    <div className="flex flex-col gap-6">
       <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter">{getTitle()}</h1>
            <p className="text-muted-foreground md:text-xl/relaxed">
                {getDescription()}
            </p>
       </div>
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Datasets
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDatasets}</div>
            <p className="text-xs text-muted-foreground">
              Total approved datasets on the platform.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">~{platformTotalRecords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Estimated across all datasets.
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Submissions</CardTitle>
            <UploadCloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              Total datasets you have submitted.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Contributions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">~{userTotalRecords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Records from your approved submissions.
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Submission Status</CardTitle>
                <CardDescription>A breakdown of your dataset submission statuses.</CardDescription>
            </CardHeader>
            <CardContent>
                {submissionStatusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={submissionStatusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                    return (
                                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                            {`${(percent * 100).toFixed(0)}%`}
                                        </text>
                                    );
                                }}
                            >
                                {submissionStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name.toLowerCase() as SubmissionStatus]} />
                                ))}
                            </Pie>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                        <p>No submission data to display yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
