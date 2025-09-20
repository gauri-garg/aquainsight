"use client";

import {
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  ComposedChart,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { oceanParameterData } from "@/lib/data";

const chartConfig = {
  temp: {
    label: "Temperature (°C)",
    color: "hsl(var(--chart-1))",
  },
  salinity: {
    label: "Salinity (PSU)",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function OceanParameterChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ComposedChart data={oceanParameterData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis
          yAxisId="left"
          orientation="left"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          domain={[-3, 2]}
          tickFormatter={(value) => `${value}°C`}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          domain={[34, 35]}
          tickFormatter={(value) => value.toFixed(1)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          yAxisId="left"
          dataKey="temp"
          type="monotone"
          stroke="var(--color-temp)"
          strokeWidth={2}
          dot={true}
        />
        <Line
          yAxisId="right"
          dataKey="salinity"
          type="monotone"
          stroke="var(--color-salinity)"
          strokeWidth={2}
          dot={true}
        />
      </ComposedChart>
    </ChartContainer>
  );
}
