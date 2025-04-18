'use client'

import * as React from "react"
import {
  Area,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  // Tooltip // Removed unused recharts import
} from "recharts"
import colors from 'tailwindcss/colors' // Added for color

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
    label: "Mood Score", // Updated label for clarity
    color: colors.amber[500], // Using Amber 500 as representative color
  },
} satisfies ChartConfig

export default function MoodChart({ data }: MoodChartProps) {
  if (!data || data.length < 3) {
    return (
      <Card className="min-h-[240px] flex flex-col">
        <CardHeader>
          <CardTitle className="text-xl">Mood Trend</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <p className="text-muted-foreground text-center px-4">Log at least 3 dreams to see your mood trends.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Mood Trend</CardTitle>
        <CardDescription>
          Recent mood trend (1=Negative, 5=Positive)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <LineChart
            accessibilityLayer
            data={data}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          >
            {/* Grid hidden by default - will add toggle later */}
            {/* <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/50" /> */}
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            {/* Hide YAxis for sparkline effect */}
            <YAxis hide domain={[0.5, 5.5]} /> 
            <ChartTooltip
                cursor={{ strokeDasharray: '3 3' }} // Use default cursor color
                content={
                  <ChartTooltipContent 
                    className="bg-popover text-popover-foreground shadow-md rounded-md px-3 py-2 text-sm" 
                    nameKey="mood" // This will show the score
                    labelFormatter={(value) => `Date: ${value}`} // Format the label (date)
                    formatter={(value, name, props) => [`Score: ${value}`, null]} // Format the value display
                  />
                } 
            />
            {/* Added Area component */}
            <Area
              dataKey="mood"
              type="monotone"
              fill={chartConfig.mood.color} 
              fillOpacity={0.3}
              stroke="none"
            />
            <Line
              dataKey="mood"
              type="monotone" 
              stroke={chartConfig.mood.color} // Use color from chartConfig
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: "hsl(var(--background))", stroke: chartConfig.mood.color, strokeWidth: 2 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
} 
