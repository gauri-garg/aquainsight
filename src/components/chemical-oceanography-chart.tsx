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
  pH: {
    label: "pH",
    color: "hsl(var(--chart-1))",
  },
  nitrate: {
    label: "Nitrate (μmol/L)",
    color: "hsl(var(--chart-2))",
  },
  phosphate: {
    label: "Phosphate (μmol/L)",
    color: "hsl(var(--chart-3))",
  },
  silicate: {
    label: "Silicate (μmol/L)",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export default function ChemicalOceanographyChart({ data }: { data: any[] }) {
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
          tickFormatter={(value) => value.toFixed(2)}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.toFixed(2)}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          dataKey="pH"
          yAxisId="left"
          type="monotone"
          stroke="var(--color-pH)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="nitrate"
          yAxisId="right"
          type="monotone"
          stroke="var(--color-nitrate)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="phosphate"
          yAxisId="right"
          type="monotone"
          stroke="var(--color-phosphate)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="silicate"
          yAxisId="right"
          type="monotone"
          stroke="var(--color-silicate)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
