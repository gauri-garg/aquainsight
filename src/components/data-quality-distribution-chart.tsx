"use client";

import { Pie, PieChart, Cell } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { dataQualityDistribution } from "@/lib/data";

const chartConfig = {
  "High Quality": {
    label: "High Quality",
    color: "hsl(var(--chart-1))",
  },
  "Medium Quality": {
    label: "Medium Quality",
    color: "hsl(var(--chart-2))",
  },
  "Low Quality": {
    label: "Low Quality",
    color: "hsl(var(--chart-3))",
  },
  "Preliminary": {
    label: "Preliminary",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export default function DataQualityDistributionChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <PieChart>
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Pie
          data={dataQualityDistribution}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={80}
          strokeWidth={5}
        >
          {dataQualityDistribution.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend
            content={({ payload }) => (
                <ul className="grid gap-2 text-sm">
                    {payload?.map((item) => {
                         const { name, value, payload } = item;
                         const dataEntry = dataQualityDistribution.find(d => d.name === name);
                        return (
                            <li key={name} className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <span className="w-2.5 h-2.5 mr-2 rounded-full" style={{backgroundColor: payload.fill}}></span>
                                    <span>{name}</span>
                                </div>
                                <span>{dataEntry?.value} ({((dataEntry?.value || 0) / 2 * 100)}%)</span>
                            </li>
                        )
                    })}
                </ul>
            )}
            />
      </PieChart>
    </ChartContainer>
  );
}
