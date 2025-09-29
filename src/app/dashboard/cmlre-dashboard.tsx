
"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth, RequestedDataset, UserRole } from "@/hooks/use-auth";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell, ResponsiveContainer, AreaChart, Area, Tooltip, YAxis, ScatterChart, Scatter, Label } from "recharts";
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
import { ArrowUpRight, Users, Database, FileText, TrendingUp, TrendingDown, MapPin, Wind, Thermometer, Droplets } from "lucide-react";
import { format, parseISO, startOfMonth, endOfMonth, subMonths, getMonth, getYear } from 'date-fns';
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const COLORS = {
    'CMLRE': 'hsl(var(--chart-1))',
    'User': 'hsl(var(--chart-2))',
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

const chartConfig = {
  submissions: {
    label: "Submissions",
    color: "hsl(var(--chart-1))",
  },
   locations: {
    label: "Locations",
    color: "hsl(var(--chart-2))",
  },
  temperature: {
    label: "Temperature",
    color: "hsl(var(--chart-3))",
    icon: Thermometer,
  },
  salinity: {
    label: "Salinity",
    color: "hsl(var(--chart-4))",
    icon: Droplets,
  },
  wind_speed: {
      label: "Wind Speed",
      color: "hsl(var(--chart-5))",
      icon: Wind,
  }
} satisfies ChartConfig;


export function CMLREDashboard() {
  const { getTotalDatasets, getTotalUsers, getTotalRecords, getAllApprovedSubmissions, getRequestedDatasets } = useAuth();

  const [totalDatasets, setTotalDatasets] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [recentSubmissions, setRecentSubmissions] = useState<RequestedDataset[]>([]);
  const [userRoleData, setUserRoleData] = useState<{name: UserRole, value: number}[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState({ recordsThisMonth: 0, percentageChange: 0 });
  const [monthlyData, setMonthlyData] = useState<{ month: string, submissions: number }[]>([]);
  const [locationData, setLocationData] = useState<{ lat: number, lon: number }[]>([]);
  const [oceanParamData, setOceanParamData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [datasetsCount, users, recordsCount, approvedSubmissions, requestedData] = await Promise.all([
        getTotalDatasets(),
        getTotalUsers(),
        getTotalRecords(),
        getAllApprovedSubmissions(),
        getRequestedDatasets(),
      ]);

      const { datasets: submissions } = requestedData;

      setTotalDatasets(datasetsCount);
      
      const roleCounts = users.reduce((acc, user) => {
        acc[user.role!] = (acc[user.role!] || 0) + 1;
        return acc;
      }, {} as Record<UserRole, number>);

      setUserRoleData(Object.entries(roleCounts).map(([name, value]) => ({ name: name as UserRole, value })));
      setTotalUsers(users.length);

      setTotalRecords(recordsCount);
      setRecentSubmissions(approvedSubmissions);
      
      const now = new Date();
      const startOfThisMonth = startOfMonth(now);
      const startOfLastMonth = startOfMonth(subMonths(now, 1));
      const endOfLastMonth = endOfMonth(subMonths(now, 1));

      const allSubmissions = [...submissions, ...approvedSubmissions];
      const uniqueSubmissions = Array.from(new Map(allSubmissions.map(item => [item.id, item])).values());
      
      const allApproved = uniqueSubmissions.filter(s => s.status === 'approved');

      // Process location and ocean parameter data from all approved submissions
      const locations: { lat: number; lon: number }[] = [];
      const oceanParams: any[] = [];
      
      allApproved.forEach(sub => {
        if (sub.csvData) {
          const lines = sub.csvData.trim().split('\n');
          if (lines.length < 2) return;
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          const latIndex = headers.findIndex(h => h.includes('lat'));
          const lonIndex = headers.findIndex(h => h.includes('lon'));
          const dateIndex = headers.findIndex(h => h.includes('date'));
          const tempIndex = headers.findIndex(h => h.includes('temp'));
          const salinityIndex = headers.findIndex(h => h.includes('salinity'));
          const windIndex = headers.findIndex(h => h.includes('wind'));

          if (latIndex !== -1 && lonIndex !== -1) {
            for (let i = 1; i < lines.length; i++) {
              const values = lines[i].split(',');
              const lat = parseFloat(values[latIndex]);
              const lon = parseFloat(values[lonIndex]);
              if (!isNaN(lat) && !isNaN(lon)) {
                locations.push({ lat, lon });
              }

              if (dateIndex !== -1) {
                 try {
                    const record: any = {
                        date: format(parseISO(values[dateIndex].split(' ')[0]), 'MMM d'),
                    };
                    if (tempIndex !== -1) record.temperature = parseFloat(values[tempIndex]);
                    if (salinityIndex !== -1) record.salinity = parseFloat(values[salinityIndex]);
                    if (windIndex !== -1) record.wind_speed = parseFloat(values[windIndex]);

                    if (Object.keys(record).length > 1) {
                        oceanParams.push(record);
                    }
                 } catch (e) {
                     // Ignore rows with invalid dates
                 }
              }
            }
          }
        }
      });
      setLocationData(locations);
      
      // Aggregate ocean param data by date (average values if multiple for same day)
      const aggregatedParams = oceanParams.reduce((acc, curr) => {
        const existing = acc[curr.date];
        if (existing) {
          Object.keys(curr).forEach(key => {
            if (key !== 'date') {
              existing[key] = existing[key] || { sum: 0, count: 0 };
              existing[key].sum += curr[key];
              existing[key].count += 1;
            }
          });
        } else {
          acc[curr.date] = {};
          Object.keys(curr).forEach(key => {
             if (key !== 'date') {
                acc[curr.date][key] = { sum: curr[key], count: 1 };
             }
          });
        }
        return acc;
      }, {});

      const averagedParams = Object.keys(aggregatedParams).map(date => {
        const record: any = { date };
        Object.keys(aggregatedParams[date]).forEach(key => {
          record[key] = aggregatedParams[date][key].sum / aggregatedParams[date][key].count;
        });
        return record;
      }).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Limit to last 100 points for performance
      setOceanParamData(averagedParams.slice(-100));


      const recordsThisMonth = uniqueSubmissions
        .filter(s => new Date(s.date) >= startOfThisMonth)
        .reduce((acc, s) => acc + (s.csvData.split('\n').length -1), 0);

      const recordsLastMonth = uniqueSubmissions
        .filter(s => {
            const subDate = new Date(s.date);
            return subDate >= startOfLastMonth && subDate <= endOfLastMonth;
        })
        .reduce((acc, s) => acc + (s.csvData.split('\n').length -1), 0);

      const percentageChange = recordsLastMonth > 0 
        ? ((recordsThisMonth - recordsLastMonth) / recordsLastMonth) * 100
        : recordsThisMonth > 0 ? 100 : 0;
        
      setMonthlyTrend({ recordsThisMonth, percentageChange });

      // Aggregate data by month for the last year
      const monthlyCounts: { [key: string]: number } = {};
      const oneYearAgo = subMonths(now, 11);
      oneYearAgo.setDate(1);

      for (let i = 0; i < 12; i++) {
          const date = subMonths(now, 11-i);
          const monthKey = format(date, 'MMM yy');
          monthlyCounts[monthKey] = 0;
      }
      
      uniqueSubmissions.forEach(s => {
        const subDate = new Date(s.date);
        if (subDate >= oneYearAgo) {
            const monthKey = format(subDate, 'MMM yy');
            monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
        }
      });
      
      const chartData = Object.entries(monthlyCounts).map(([month, count]) => ({
          month: month,
          submissions: count,
      }));

      setMonthlyData(chartData);
    };

    fetchData();
  }, [getTotalDatasets, getTotalUsers, getTotalRecords, getAllApprovedSubmissions, getRequestedDatasets]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

       <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Submissions</CardTitle>
              <CardDescription>
                Total data submissions per month over the last year.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <AreaChart accessibilityLayer data={monthlyData} margin={{ left: 12, right: 12, top: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                  <Area dataKey="submissions" type="natural" fill="var(--color-submissions)" fillOpacity={0.4} stroke="var(--color-submissions)" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>A scatter plot of data points by latitude and longitude.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid />
                        <XAxis type="number" dataKey="lon" name="longitude" domain={['auto', 'auto']}>
                           <Label value="Longitude" offset={-15} position="insideBottom" />
                        </XAxis>
                        <YAxis type="number" dataKey="lat" name="latitude" domain={['auto', 'auto']}>
                           <Label value="Latitude" angle={-90} offset={-15} position="insideLeft" />
                        </YAxis>
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent indicator="dot" />} />
                        <Scatter name="Data Points" data={locationData} fill="var(--color-locations)" />
                    </ScatterChart>
                </ChartContainer>
            </CardContent>
          </Card>
       </div>

        <Card>
            <CardHeader>
                <CardTitle>Ocean Parameter Trends</CardTitle>
                <CardDescription>Daily average trends for key oceanographic parameters.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <AreaChart accessibilityLayer data={oceanParamData} margin={{ left: 12, right: 12, top: 12 }}>
                         <CartesianGrid vertical={false} />
                         <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                         <YAxis hide domain={['auto', 'auto']} />
                         <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                         {Object.keys(chartConfig).filter(k => k.startsWith('temp') || k.startsWith('sal') || k.startsWith('wind')).map(key => (
                            <Area 
                                key={key}
                                dataKey={key} 
                                type="natural" 
                                fill={`var(--color-${key})`}
                                fillOpacity={0.4}
                                stroke={`var(--color-${key})`}
                                name={chartConfig[key as keyof typeof chartConfig].label as string}
                            />
                         ))}
                    </AreaChart>
                 </ChartContainer>
            </CardContent>
        </Card>
       

       <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>
              All approved submissions.
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
                    {recentSubmissions.length > 0 ? (
                      recentSubmissions.slice(0, 5).map((sub) => (
                         <TableRow key={sub.id}>
                            <TableCell>
                                <div className="font-medium">{sub.name}</div>
                                <div className="text-sm text-muted-foreground md:inline">
                                    by {sub.submittedBy}
                                </div>
                            </TableCell>
                            <TableCell className="hidden text-right sm:table-cell">{new Date(sub.date).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                       <TableRow>
                          <TableCell colSpan={2} className="h-24 text-center">
                            No approved submissions yet.
                          </TableCell>
                        </TableRow>
                    )}
                </TableBody>
             </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Roles</CardTitle>
            <CardDescription>Distribution of users on the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              {userRoleData.length > 0 ? (
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
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Loading user data...
                </div>
              )}
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
