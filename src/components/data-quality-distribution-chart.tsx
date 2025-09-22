
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
    color: "hsl(var(--chart-2))",
  },
  "Medium Quality": {
    label: "Medium Quality",
    color: "hsl(var(--chart-3))",
  },
  "Low Quality": {
    label: "Low Quality",
    color: "hsl(var(--chart-4))",
  },
  "Preliminary": {
    label: "Preliminary",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export default function DataQualityDistributionChart() {
    const total = dataQualityDistribution.reduce((acc, curr) => acc + curr.value, 0);
  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <PieChart>
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Pie
          data={dataQualityDistribution}
          dataKey="value"
          nameKey="name"
          innerRadius="60%"
          outerRadius="80%"
          strokeWidth={1}
        >
          {dataQualityDistribution.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend
            content={({ payload }) => (
                <ul className="grid gap-2 text-sm w-full">
                    {payload?.map((item) => {
                         const { name, payload } = item;
                         const dataEntry = dataQualityDistribution.find(d => d.name === name);
                         const percentage = total > 0 ? ((dataEntry?.value || 0) / total * 100).toFixed(0) : 0;
                        return (
                            <li key={item.value} className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <span className="w-2.5 h-2.5 mr-2 rounded-full" style={{backgroundColor: payload.fill}}></span>
                                    <span>{name}</span>
                                </div>
                                <span>{dataEntry?.value} ({percentage}%)</span>
                            </li>
                        )
                    })}
                </ul>
            )}
            layout="vertical"
            align="right"
            verticalAlign="middle"
            wrapperStyle={{width: '50%'}}
            />
      </PieChart>
    </ChartContainer>
  );
}
