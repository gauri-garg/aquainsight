
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
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
];


export default function SpeciesDistributionChart() {
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [chartConfig, setChartConfig] = React.useState<ChartConfig>({
    count: {
      label: "Count",
    },
  });

  React.useEffect(() => {
    const fisheriesRef = ref(database, 'fisheries_data');
    onValue(fisheriesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const dataArray = Object.keys(data).map(key => data[key]);
        
        const speciesCount = dataArray.reduce((acc, item) => {
          acc[item.species] = (acc[item.species] || 0) + 1;
          return acc;
        }, {} as {[key: string]: number});

        const speciesDistribution = Object.keys(speciesCount).map((species, index) => ({
          species,
          count: speciesCount[species],
          fill: chartColors[index % chartColors.length],
        }));

        const newChartConfig: ChartConfig = {
          count: { label: "Count" },
        };
        speciesDistribution.forEach((item) => {
          newChartConfig[item.species] = { label: item.species, color: item.fill };
        });

        setChartData(speciesDistribution);
        setChartConfig(newChartConfig);
      }
    });
  }, []);

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
            data={chartData}
            dataKey="count"
            nameKey="species"
            innerRadius={60}
            strokeWidth={5}
          >
            {chartData.map((entry) => (
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

