"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  waveHeight: {
    label: "Wave Height (m)",
    color: "hsl(var(--chart-1))",
  },
  tide: {
    label: "Tide (m)",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function WaveformChart({ data }: { data: any[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <AreaChart
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
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `${value}m`}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          dataKey="waveHeight"
          type="monotone"
          fill="var(--color-waveHeight)"
          fillOpacity={0.4}
          stroke="var(--color-waveHeight)"
          stackId="a"
        />
        <Area
          dataKey="tide"
          type="monotone"
          fill="var(--color-tide)"
          fillOpacity={0.4}
          stroke="var(--color-tide)"
          stackId="b"
        />
      </AreaChart>
    </ChartContainer>
  );
}
