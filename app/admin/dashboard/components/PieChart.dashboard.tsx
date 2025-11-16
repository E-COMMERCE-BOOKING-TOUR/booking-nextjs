import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Pie, PieChart } from "recharts"

const chartData = [
    { browser: "Hồ Chí Minh", visitors: 275, fill: "#f70000ff" },
    { browser: "Hà Nội", visitors: 200, fill: "#ff5100ff" },
    { browser: "Phú Quốc", visitors: 187, fill: "#e5ff00ff" },
    { browser: "Kiên Giang", visitors: 173, fill: "#2bff00ff" },
    { browser: "Cần Thơ", visitors: 90, fill: "#0400ffff" },
]
const chartConfig = {
    tour: {
        label: "Tour",
    },
    chrome: {
        label: "Chrome",
        color: "var(--chart-1)",
    },
    safari: {
        label: "Safari",
        color: "var(--chart-2)",
    },
    firefox: {
        label: "Firefox",
        color: "var(--chart-3)",
    },
    edge: {
        label: "Edge",
        color: "var(--chart-4)",
    },
    other: {
        label: "Other",
        color: "var(--chart-5)",
    },
} satisfies ChartConfig

export const PieChartDashboard = () => {
    return (
        <>
            <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[250px]"
            >
                <PieChart>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent />}
                    />
                    <Pie
                        data={chartData}
                        dataKey="visitors"
                        nameKey="browser"
                        innerRadius={60}
                    />

                </PieChart>
            </ChartContainer>
            <div className="mt-4 grid grid-cols-2 gap-2 justify-items-center">
                {chartData.map((item) => (
                    <div key={item.browser} className="flex items-center gap-2">
                        {/* Màu */}
                        <span
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: item.fill }}
                        />
                        {/* Label */}
                        <span className="text-sm text-gray-700 capitalize">{item.browser}</span>
                    </div>
                ))}
            </div>
        </>
    )
}