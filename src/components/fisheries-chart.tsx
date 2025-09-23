"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  stockStatus: {
    label: "Stock Status",
  },
  Good: {
    label: "Good",
    color: "hsl(var(--chart-2))",
  },
  Fair: {
    label: "Fair",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export default function FisheriesChart({ data }: { data: any[] }) {

  const chartData = data.map(item => ({
    species: item.species,
    status: item.stockStatus.includes("Good") ? "Good" : "Fair",
    value: 1, // All bars have a value of 1, color indicates status
  }));


  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{
          left: 10,
          right: 12,
        }}
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="species"
          type="category"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={120}
        />
        <XAxis type="number" hide />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="value"
          radius={5}
        >
            {chartData.map((entry, index) => (
                <Bar
                    key={`bar-${index}`}
                    dataKey="value"
                    fill={entry.status === 'Good' ? 'var(--color-Good)' : 'var(--color-Fair)'}
                />
            ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
