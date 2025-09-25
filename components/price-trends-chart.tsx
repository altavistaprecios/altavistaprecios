"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const chartConfig = {
  stockLenses: {
    label: "Stock Lenses",
    color: "hsl(var(--chart-1))",
  },
  labLenses: {
    label: "Laboratory Lenses",
    color: "hsl(var(--chart-2))",
  },
  clearView: {
    label: "ClearView",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function PriceTrendsChart() {
  const [timeRange, setTimeRange] = React.useState("6m")
  const [chartData, setChartData] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchPriceHistory()
  }, [timeRange])

  const fetchPriceHistory = async () => {
    try {
      setLoading(true)

      // Generate sample data for now - in production this would fetch from API
      const months = timeRange === "1y" ? 12 : timeRange === "6m" ? 6 : 3
      const data = []
      const currentDate = new Date()

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(currentDate)
        date.setMonth(date.getMonth() - i)

        data.push({
          date: date.toISOString().split('T')[0],
          stockLenses: 45 + Math.random() * 10,
          labLenses: 120 + Math.random() * 20,
          clearView: 85 + Math.random() * 15,
        })
      }

      setChartData(data)
    } catch (error) {
      console.error('Failed to fetch price history:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
          <div className="h-4 w-48 bg-muted animate-pulse rounded mt-2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] bg-muted animate-pulse rounded"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle>Average Price Trends</CardTitle>
        <CardDescription>
          Base prices by product category (USD)
        </CardDescription>
        <div className="absolute right-4 top-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="w-32"
              aria-label="Select time range"
            >
              <SelectValue placeholder="Last 6 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="3m" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="6m" className="rounded-lg">
                Last 6 months
              </SelectItem>
              <SelectItem value="1y" className="rounded-lg">
                Last year
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillStock" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-stockLenses)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-stockLenses)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillLab" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-labLenses)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-labLenses)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillClear" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-clearView)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-clearView)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                })
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `$${value}`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })
                  }}
                  formatter={(value) => `$${Number(value).toFixed(2)}`}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="stockLenses"
              type="natural"
              fill="url(#fillStock)"
              stroke="var(--color-stockLenses)"
              stackId="a"
            />
            <Area
              dataKey="labLenses"
              type="natural"
              fill="url(#fillLab)"
              stroke="var(--color-labLenses)"
              stackId="a"
            />
            <Area
              dataKey="clearView"
              type="natural"
              fill="url(#fillClear)"
              stroke="var(--color-clearView)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}