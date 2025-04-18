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
    label: "Mood", // Simpler label for tooltip
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
            {/* Subtler grid lines */}
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/50" />
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
              domain={[0.5, 5.5]} // Add padding to domain
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              ticks={[1, 2, 3, 4, 5]} // Ensure ticks are integers 1-5
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            <ChartTooltip
                cursor={{ strokeDasharray: '3 3', stroke: 'hsl(var(--muted-foreground))' }} // Add subtle cursor line
                content={
                  <ChartTooltipContent 
                    // Removed hideLabel, let it show the date by default
                    className="bg-popover text-popover-foreground shadow-md rounded-md px-3 py-2 text-sm" 
                    nameKey="mood" // Use mood value for display
                    labelFormatter={(value) => `Date: ${value}`} // Format the label (date)
                  />
                } // Use themed tooltip
            />
            {/* Optional Legend if needed later */}
            {/* <ChartLegend content={<ChartLegendContent />} /> */}
            <Line
              dataKey="mood"
              type="monotone" // Makes the line curved
              stroke="var(--color-mood)" // Use color from chartConfig
              strokeWidth={2}
              dot={false} // Keep dots hidden by default
              // Add activeDot prop for hover/focus interaction
              activeDot={{ r: 6, fill: "hsl(var(--background))", stroke: "var(--color-mood)", strokeWidth: 2 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
} 
