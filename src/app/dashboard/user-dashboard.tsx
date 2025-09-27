
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Database, FileText, UploadCloud } from "lucide-react";

export function UserDashboard() {
  const { user, userDetails, getTotalDatasets, getUserSubmissionsCount, getUserTotalRecords } = useAuth();
  
  const [totalDatasets, setTotalDatasets] = useState(0);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        const [datasetsCount, submissionsCount, recordsCount] = await Promise.all([
          getTotalDatasets(),
          getUserSubmissionsCount(user.uid),
          getUserTotalRecords(user.uid),
        ]);
        setTotalDatasets(datasetsCount);
        setTotalSubmissions(submissionsCount);
        setTotalRecords(recordsCount);
      };
      fetchData();
    }
  }, [user, getTotalDatasets, getUserSubmissionsCount, getUserTotalRecords]);
  
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
    </div>
  );
}
