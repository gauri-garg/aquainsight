
"use client";

import Link from "next/link";
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
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { PlusCircle, ArrowUpRight } from "lucide-react";

// Mock data for now, we will connect this to firebase later
const recentDatasets = [
    { id: 'DS001', name: 'Antarctic Krill Distribution', type: 'Biological Oceanography', submitted: '2023-10-26', status: 'Approved' },
    { id: 'DS002', name: 'Southern Ocean CO2 Levels', type: 'Chemical Oceanography', submitted: '2023-11-05', status: 'Pending' },
    { id: 'DS003', name: 'Indian Ocean Temperature Profile', type: 'Physical Oceanography', submitted: '2023-11-12', status: 'Rejected' },
];

const hasSubmissions = recentDatasets.length > 0;

export default function Dashboard() {
  const { role } = useAuth();

  const getTitle = () => {
    switch (role) {
      case "Student":
        return "Student Dashboard";
      case "Researcher":
        return "Researcher Dashboard";
      default:
        return "Dashboard";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge variant="default">Approved</Badge>;
      case "Pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold md:text-2xl">{getTitle()}</h1>
        <Button asChild>
          <Link href="/dashboard/submission">
            <PlusCircle className="mr-2 h-4 w-4" /> Submit New Dataset
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Datasets</CardTitle>
          <CardDescription>
            A list of your recent dataset submissions and their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasSubmissions ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dataset Name</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDatasets.map((dataset) => (
                  <TableRow key={dataset.id}>
                    <TableCell>
                      <div className="font-medium">{dataset.name}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{dataset.type}</TableCell>
                    <TableCell className="hidden md:table-cell">{dataset.submitted}</TableCell>
                    <TableCell>{getStatusBadge(dataset.status)}</TableCell>
                     <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                         <Link href="#">
                           <ArrowUpRight className="h-4 w-4" />
                           <span className="sr-only">View</span>
                         </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center py-12">
                <h3 className="text-xl font-semibold">No submissions yet</h3>
                <p className="text-muted-foreground mt-2">
                  Get started by submitting your first dataset.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/submission">
                    <PlusCircle className="mr-2 h-4 w-4" /> Submit Dataset
                  </Link>
                </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
