
"use client"

import { useMemo } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Dataset } from "@/hooks/use-auth"
import { DateRange } from "react-day-picker"
import { parse, isWithinInterval } from "date-fns"
import { Loader2 } from "lucide-react"

interface ChemicalOceanographyChartProps {
  dataset: Dataset | null
  dateRange: DateRange | undefined
}

const chartConfig = {
  temperature: {
    label: "Temperature (°C)",
    color: "hsl(var(--chart-1))",
  },
  salinity: {
    label: "Salinity (PSU)",
    color: "hsl(var(--chart-2))",
  },
  nitrate: {
    label: "Nitrate (µmol/kg)",
    color: "hsl(var(--chart-3))",
  },
}

export function ChemicalOceanographyChart({
  dataset,
  dateRange,
}: ChemicalOceanographyChartProps) {

  const parsedData = useMemo(() => {
    if (!dataset?.csvData) return []

    const lines = dataset.csvData.trim().split("\n")
    const header = lines[0].split(",").map(h => h.trim())
    const data = lines.slice(1).map(line => {
      const values = line.split(",")
      const entry: { [key: string]: any } = {}
      header.forEach((key, index) => {
        const value = values[index] ? values[index].trim() : ""
        if (key.toLowerCase() === 'date') {
          try {
            // Attempt to parse multiple date formats
            entry.date = parse(value, 'M/d/yy', new Date())
          } catch {
             try {
                entry.date = new Date(value);
             } catch {
                entry.date = null;
             }
          }
        } else if (key.toLowerCase() === 'temperature') {
            entry.temperature = parseFloat(value);
        } else if (key.toLowerCase() === 'salinity') {
            entry.salinity = parseFloat(value);
        } else if (key.toLowerCase() === 'nitrate') {
            entry.nitrate = parseFloat(value);
        } else {
            entry[key] = value;
        }
      })
      return entry
    })
    return data.filter(d => d.date);
  }, [dataset])

  const filteredData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) {
      return parsedData
    }
    return parsedData.filter(item =>
      isWithinInterval(item.date, { start: dateRange.from!, end: dateRange.to! })
    ).sort((a,b) => a.date.getTime() - b.date.getTime());

  }, [parsedData, dateRange])


  if (!dataset) {
    return (
      <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">Select a dataset to view data.</p>
      </div>
    )
  }

  if (filteredData.length === 0) {
    return (
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No data available for the selected date range.</p>
        </div>
    )
  }


  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <AreaChart
        accessibilityLayer
        data={filteredData}
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
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis
            domain={['dataMin - 1', 'dataMax + 1']}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
        />
        <Tooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <defs>
          <linearGradient id="fillTemperature" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-temperature)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-temperature)"
              stopOpacity={0.1}
            />
          </linearGradient>
          <linearGradient id="fillSalinity" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-salinity)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-salinity)"
              stopOpacity={0.1}
            />
          </linearGradient>
           <linearGradient id="fillNitrate" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-nitrate)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-nitrate)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <Area
          dataKey="temperature"
          type="natural"
          fill="url(#fillTemperature)"
          stroke="var(--color-temperature)"
          stackId="a"
        />
        <Area
          dataKey="salinity"
          type="natural"
          fill="url(#fillSalinity)"
          stroke="var(--color-salinity)"
          stackId="a"
        />
         <Area
          dataKey="nitrate"
          type="natural"
          fill="url(#fillNitrate)"
          stroke="var(--color-nitrate)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  )
}
