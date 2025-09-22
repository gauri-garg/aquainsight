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
  catch_kg: {
    label: "Catch (kg)",
    color: "hsl(var(--chart-1))",
  }
} satisfies ChartConfig;

export default function FisheriesChart({ data }: { data: any[] }) {
  const aggregatedData: {[key: string]: number} = data.reduce((acc, item) => {
    if (!acc[item.species]) {
      acc[item.species] = 0;
    }
    acc[item.species] += item.catch_kg;
    return acc;
  }, {});

  const chartData = Object.keys(aggregatedData).map(species => ({
    species,
    catch_kg: aggregatedData[species],
  }));

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <BarChart
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="species"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `${value} kg`}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="catch_kg"
          fill="var(--color-catch_kg)"
          radius={4}
        />
      </BarChart>
    </ChartContainer>
  );
}
