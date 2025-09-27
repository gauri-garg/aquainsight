
"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth, RequestedDataset, UserRole } from "@/hooks/use-auth";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell, ResponsiveContainer } from "recharts";
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
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Users, Database, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const COLORS = {
    'CMLRE': 'hsl(var(--chart-1))',
    'Researcher': 'hsl(var(--chart-2))',
    'Student': 'hsl(var(--chart-3))',
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


export function CMLREDashboard() {
  const { getTotalDatasets, getTotalUsers, getTotalRecords, getRequestedDatasets } = useAuth();

  const [totalDatasets, setTotalDatasets] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [recentSubmissions, setRecentSubmissions] = useState<RequestedDataset[]>([]);
  const [userRoleData, setUserRoleData] = useState<{name: UserRole, value: number}[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState({ recordsThisMonth: 0, percentageChange: 0 });
  
  useEffect(() => {
    const fetchData = async () => {
      const [datasetsCount, users, recordsCount, submissions] = await Promise.all([
        getTotalDatasets(),
        getTotalUsers(),
        getTotalRecords(),
        getRequestedDatasets(),
      ]);

      setTotalDatasets(datasetsCount);
      
      const roleCounts = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<UserRole, number>);

      setUserRoleData(Object.entries(roleCounts).map(([name, value]) => ({ name: name as UserRole, value })));
      setTotalUsers(users.length);

      setTotalRecords(recordsCount);
      setRecentSubmissions(submissions.slice(0, 5));
      
      const now = new Date();
      const startOfThisMonth = startOfMonth(now);
      const startOfLastMonth = startOfMonth(subMonths(now, 1));
      const endOfLastMonth = endOfMonth(subMonths(now, 1));

      const recordsThisMonth = submissions
        .filter(s => new Date(s.date) >= startOfThisMonth)
        .reduce((acc, s) => acc + (s.csvData.split('\n').length -1), 0);

      const recordsLastMonth = submissions
        .filter(s => {
            const subDate = new Date(s.date);
            return subDate >= startOfLastMonth && subDate <= endOfLastMonth;
        })
        .reduce((acc, s) => acc + (s.csvData.split('\n').length -1), 0);

      const percentageChange = recordsLastMonth > 0 
        ? ((recordsThisMonth - recordsLastMonth) / recordsLastMonth) * 100
        : recordsThisMonth > 0 ? 100 : 0;
        
      setMonthlyTrend({ recordsThisMonth, percentageChange });
    };

    fetchData();
  }, [getTotalDatasets, getTotalUsers, getTotalRecords, getRequestedDatasets]);

  return (
    <div className="flex flex-col gap-6">
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
              Number of approved datasets
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">~{totalRecords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Estimated across all datasets
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
            {monthlyTrend.percentageChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            ) : (
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{monthlyTrend.recordsThisMonth.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {monthlyTrend.percentageChange.toFixed(2)}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>
              New datasets pending review.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Dataset</TableHead>
                    <TableHead className="hidden text-right sm:table-cell">Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentSubmissions.map((sub) => (
                         <TableRow key={sub.id}>
                            <TableCell>
                                <div className="font-medium">{sub.name}</div>
                                <div className="text-sm text-muted-foreground md:inline">
                                    by {sub.submittedBy}
                                </div>
                            </TableCell>
                            <TableCell className="hidden text-right sm:table-cell">{new Date(sub.date).toLocaleDateString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
             </Table>
          </CardContent>
        </Card>

        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>User Roles</CardTitle>
            <CardDescription>Distribution of users on the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie
                        data={userRoleData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                    >
                        {userRoleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
                {userRoleData.map((entry, index) => (
                    <div key={`legend-${index}`} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[entry.name as keyof typeof COLORS]}} />
                        <span className="text-sm text-muted-foreground">{entry.name} ({entry.value})</span>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    