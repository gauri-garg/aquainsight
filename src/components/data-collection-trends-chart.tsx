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
  "Physical Oceanography": {
    label: "Physical Oceanography",
    color: "hsl(var(--chart-1))",
  },
  "Fisheries": {
    label: "Fisheries",
    color: "hsl(var(--chart-2))",
  },
  "Chemical Oceanography": {
    label: "Chemical Oceanography",
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
          dataKey="Physical Oceanography"
          type="natural"
          fill="var(--color-Physical Oceanography)"
          fillOpacity={0.4}
          stroke="var(--color-Physical Oceanography)"
          stackId="a"
        />
        <Area
          dataKey="Fisheries"
          type="natural"
          fill="var(--color-Fisheries)"
          fillOpacity={0.4}
          stroke="var(--color-Fisheries)"
          stackId="a"
        />
        <Area
          dataKey="Chemical Oceanography"
          type="natural"
          fill="var(--color-Chemical Oceanography)"
          fillOpacity={0.4}
          stroke="var(--color-Chemical Oceanography)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
}
