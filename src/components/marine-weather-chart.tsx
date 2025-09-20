"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis, ComposedChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  airTemp: {
    label: "Air Temp (°C)",
    color: "hsl(var(--chart-1))",
  },
  windSpeed: {
    label: "Wind Speed (m/s)",
    color: "hsl(var(--chart-2))",
  },
  waveHeight: {
    label: "Wave Height (m)",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export default function MarineWeatherChart({ data }: { data: any[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <ComposedChart
        data={data}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          }}
        />
        <YAxis
          yAxisId="left"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          dataKey="airTemp"
          yAxisId="left"
          type="monotone"
          stroke="var(--color-airTemp)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="windSpeed"
          yAxisId="right"
          type="monotone"
          stroke="var(--color-windSpeed)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="waveHeight"
          yAxisId="right"
          type="monotone"
          stroke="var(--color-waveHeight)"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ChartContainer>
  );
}
