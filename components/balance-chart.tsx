"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for the chart
const defaultData = [
  { date: "May 1", balance: 200 },
  { date: "May 5", balance: 300 },
  { date: "May 10", balance: 280 },
  { date: "May 15", balance: 450 },
  { date: "May 20", balance: 500 },
  { date: "May 25", balance: 550 },
  { date: "May 30", balance: 615 },
]

export function BalanceChart({ data }: { data?: { date: string; balance: number }[] }) {
  const chartData = data && data.length > 0 ? data : defaultData
  return (
    <div className="h-[300px] w-full">
      <ChartContainer
        data={chartData}
        tooltipClassName="bg-background/80 backdrop-blur-sm border border-border/50 shadow-xl"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="p-2"
                  labelFormatter={(label) => `Date: ${label}`}
                  formatter={(value) => [`${value} tokens`, "Balance"]}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#8b5cf6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorBalance)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
