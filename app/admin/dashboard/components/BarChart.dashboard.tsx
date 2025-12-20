import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"


const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
]
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#60a5fa",
  },
} satisfies ChartConfig

export const BarCharDashboard = () => {
  return (
    <ChartContainer config={chartConfig}>
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 0,
          right: 0,
          top: 10,
          bottom: 0
        }}
      >
        <defs>
          <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-desktop)"
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor="var(--color-desktop)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={12}
          tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 12, fontWeight: 500 }}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip
          cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Area
          dataKey="desktop"
          type="natural"
          fill="url(#fillDesktop)"
          stroke="var(--color-desktop)"
          strokeWidth={3}
          dot={{ fill: 'var(--color-desktop)', r: 4, strokeWidth: 2, stroke: 'hsl(230, 25%, 12%)' }}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
      </AreaChart>
    </ChartContainer>
  )
}