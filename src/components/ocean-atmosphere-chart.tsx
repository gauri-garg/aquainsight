"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  skinTemp: {
    label: "Skin Temp (°C)",
    color: "hsl(var(--chart-1))",
  },
  airTemp3m: {
    label: "Air Temp 3m (°C)",
    color: "hsl(var(--chart-2))",
  },
  ventTemp: {
    label: "Vent Temp (°C)",
    color: "hsl(var(--chart-3))",
  },
  pressure: {
    label: "Pressure (hPa)",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export default function OceanAtmosphereChart({ data }: { data: any[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <LineChart
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
          tickFormatter={(value) => value.toFixed(1)}
          domain={[26, 29]}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => Math.round(value)}
           domain={[1005, 1012]}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          dataKey="skinTemp"
          yAxisId="left"
          type="monotone"
          stroke="var(--color-skinTemp)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="airTemp3m"
          yAxisId="left"
          type="monotone"
          stroke="var(--color-airTemp3m)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="ventTemp"
          yAxisId="left"
          type="monotone"
          stroke="var(--color-ventTemp)"
          strokeWidth={2}
          dot={false}
        />
         <Line
          dataKey="pressure"
          yAxisId="right"
          type="monotone"
          stroke="var(--color-pressure)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}

    