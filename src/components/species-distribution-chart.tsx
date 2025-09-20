"use client";

import * as React from "react";
import { Pie, PieChart, Cell } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from "@/components/ui/chart";
import { speciesDistributionData } from "@/lib/data";

const chartConfig = {
  count: {
    label: "Count",
  },
  "Antarctic Krill": { label: "Antarctic Krill", color: "hsl(var(--chart-1))" },
  Icefish: { label: "Icefish", color: "hsl(var(--chart-2))" },
  Silverfish: { label: "Silverfish", color: "hsl(var(--chart-3))" },
  Toothfish: { label: "Toothfish", color: "hsl(var(--chart-4))" },
  Other: { label: "Other", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

export default function SpeciesDistributionChart() {
  return (
    <div className="flex flex-col items-center">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square h-[200px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={speciesDistributionData}
            dataKey="count"
            nameKey="species"
            innerRadius={60}
            strokeWidth={5}
          >
            {speciesDistributionData.map((entry) => (
              <Cell key={entry.species} fill={entry.fill} />
            ))}
          </Pie>
          <ChartLegend
            content={<ChartLegendContent nameKey="species" />}
            className="-mt-4"
          />
        </PieChart>
      </ChartContainer>
    </div>
  );
}
