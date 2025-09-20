"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { dataCollectionTrends } from "@/lib/data";

const chartConfig = {
  oceanographic: {
    label: "Oceanographic",
    color: "hsl(var(--chart-1))",
  },
  fisheries: {
    label: "Fisheries",
    color: "hsl(var(--chart-2))",
  },
  molecular: {
    label: "Molecular",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export default function DataCollectionTrendsChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <AreaChart
        data={dataCollectionTrends}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.toString()}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value, name) => (
                <div className="flex items-center">
                  <div
                    className="w-2.5 h-2.5 mr-2 rounded-full"
                    style={{ backgroundColor: chartConfig[name as keyof typeof chartConfig]?.color }}
                  />
                  <div className="flex justify-between w-full">
                    <span>{chartConfig[name as keyof typeof chartConfig]?.label}</span>
                    <span className="ml-4 font-bold">{value}</span>
                  </div>
                </div>
              )}
            />
          }
        />
        <Area
          dataKey="oceanographic"
          type="natural"
          fill="var(--color-oceanographic)"
          fillOpacity={0.4}
          stroke="var(--color-oceanographic)"
          stackId="a"
        />
        <Area
          dataKey="fisheries"
          type="natural"
          fill="var(--color-fisheries)"
          fillOpacity={0.4}
          stroke="var(--color-fisheries)"
          stackId="a"
        />
        <Area
          dataKey="molecular"
          type="natural"
          fill="var(--color-molecular)"
          fillOpacity={0.4}
          stroke="var(--color-molecular)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
}
