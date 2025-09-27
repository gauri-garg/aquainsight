
"use client";

import { useEffect, useState } from "react";
import { useAuth, SpeciesData } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Database, FileText, UploadCloud } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;


export function UserDashboard() {
  const { user, userDetails, getTotalDatasets, getUserSubmissionsCount, getUserTotalRecords, getSpeciesDistribution } = useAuth();
  
  const [totalDatasets, setTotalDatasets] = useState(0);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [speciesData, setSpeciesData] = useState<SpeciesData[]>([]);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        const [datasetsCount, submissionsCount, recordsCount, speciesDist] = await Promise.all([
          getTotalDatasets(),
          getUserSubmissionsCount(user.uid),
          getUserTotalRecords(user.uid),
          getSpeciesDistribution(),
        ]);
        setTotalDatasets(datasetsCount);
        setTotalSubmissions(submissionsCount);
        setTotalRecords(recordsCount);
        setSpeciesData(speciesDist);
      };
      fetchData();
    }
  }, [user, getTotalDatasets, getUserSubmissionsCount, getUserTotalRecords, getSpeciesDistribution]);
  
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
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <div className="text-2xl font-bold">~{totalRecords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Records from your approved submissions.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
          <CardHeader>
            <CardTitle>Species Distribution</CardTitle>
            <CardDescription>
              A summary of the top species found across all approved datasets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={speciesData} layout="vertical" margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                <CartesianGrid horizontal={false} />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} width={120} />
                <XAxis type="number" dataKey="count" />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
    </div>
  );
}
