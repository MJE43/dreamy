'use client'

import * as React from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  // Tooltip // Removed unused recharts import
} from "recharts"

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  // ChartLegend, // Removed unused shadcn chart imports
  // ChartLegendContent
} from "@/components/ui/chart"
import { type ChartConfig } from "@/components/ui/chart"

interface MoodChartProps {
  data: { date: string; mood: number }[];
}

const chartConfig = {
  mood: {
    label: "Mood (1-5)",
    color: "hsl(var(--chart-1))", // Use CSS variable for theme consistency
  },
} satisfies ChartConfig

export default function MoodChart({ data }: MoodChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="min-h-[200px] flex flex-col">
        <CardHeader>
          <CardTitle className="text-xl">Mood Over Time</CardTitle>
          <CardDescription>Recent mood entries will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <p className="text-muted-foreground">Not enough data to display chart.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Mood Over Time</CardTitle>
        <CardDescription>
          Mood recorded from recent dreams (1=Negative, 5=Positive)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Important: Set min height for responsiveness */}
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <LineChart
            accessibilityLayer // Enhances accessibility
            data={data}
            margin={{
              top: 5,
              right: 10, // Add some right margin for labels
              left: -20, // Adjust left margin to bring axis closer
              bottom: 5, // Add bottom margin
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              // Optionally show fewer ticks if too crowded
              // interval={data.length > 10 ? Math.floor(data.length / 5) : 0} 
            />
            <YAxis
              domain={[1, 5]} // Set domain from 1 to 5
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              ticks={[1, 2, 3, 4, 5]} // Ensure ticks are integers 1-5
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            <ChartTooltip
                cursor={false} // Hide the cursor line
                content={<ChartTooltipContent hideLabel className="bg-popover text-popover-foreground" />} // Use themed tooltip
            />
            {/* Optional Legend if needed later */}
            {/* <ChartLegend content={<ChartLegendContent />} /> */}
            <Line
              dataKey="mood"
              type="monotone" // Makes the line curved
              stroke="var(--color-mood)" // Use color from chartConfig
              strokeWidth={2}
              dot={false} // Hide dots on the line points
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
} 
