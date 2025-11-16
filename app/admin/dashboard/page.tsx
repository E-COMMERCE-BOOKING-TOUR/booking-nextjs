"use client";

import { Card, CardTitle, CardHeader, CardDescription, CardContent, CardFooter, CardAction } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { HandCoins, CalendarDays, UserCog, CreditCard, XCircle, Star, MoreHorizontal } from "lucide-react";
import { ChartConfig } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppSelect } from "@/components/AppSelect";
import { BarCharDashboard } from "./components/BarChart.dashboard";
import { PieChartDashboard } from "./components/PieChart.dashboard";

const kpis = [
    { label: "Doanh thu", value: "$24,064", delta: "+2.74%" },
    { label: "Booking", value: "$15,490", delta: "+32.5%" },
    { label: "Tour", value: "827", delta: "-18.9%" },
    { label: "Tour đang mở", value: "86,5%", delta: "+14.7%" },
]

const bookings = [
    { name: "Camello Luy", code: "BG023482", package: "Venice Doenara", duration: "5 Days / 7 Nights", dates: "June 25 – June 30", price: "$1,500", status: "Confirmed" },
    { name: "Raphael Coronel", code: "BG023438", package: "Safari Adventure", duration: "8 Days / 7 Nights", dates: "June 25 – July 2", price: "$3,200", status: "Pending" },
    { name: "Luigiv Contessa", code: "BG023412", package: "Alpine Escape", duration: "7 Days / 6 Nights", dates: "Jan 26 – Feb 2", price: "$2,300", status: "Completed" },
    { name: "Armando Max Meyers", code: "BG023405", package: "Caribbean Cruise", duration: "5 Days / 4 Nights", dates: "Jun 25 – Jun 30", price: "$1,600", status: "Cancelled" },
    { name: "Jorma Dum", code: "BG023380", package: "Parisian Romance", duration: "4 Days / 4 Nights", dates: "Jun 27 – Jun 30", price: "$1,450", status: "Confirmed" },
    { name: "Hilary Grey", code: "BG023370", package: "Tokyo Cultural Adventure", duration: "7 Days / 6 Nights", dates: "Jan 23 – Jan 29", price: "$2,500", status: "Pending" },
    { name: "Ashlynn Dean", code: "BG023365", package: "New York Highlights", duration: "3 Days / 2 Nights", dates: "Jun 26 – Jun 28", price: "$1,400", status: "Completed" },
    { name: "Uday Singh", code: "BG023351", package: "Bali Beach Escape", duration: "8 Days / 7 Nights", dates: "Jun 24 – Jul 2", price: "$2,050", status: "Confirmed" },
];

const dataSelect = ['Ngày', 'Tháng', 'Năm']

const recentActivities = [
  { 
    time: "9:30 AM", 
    text: "Alberto Cortez đã cập nhật hồ sơ và thêm phương thức thanh toán mới.", 
    icon: UserCog 
  },
  { 
    time: "10:00 AM", 
    text: "Camellia Swan đã đặt gói du lịch Venice Dreams cho ngày 25 tháng 6, 2024.", 
    icon: CalendarDays 
  },
  { 
    time: "11:15 AM", 
    text: "Thanh toán cho gói Alpine Escape của Ludwig Contessa đã được xử lý.", 
    icon: CreditCard 
  },
  { 
    time: "12:45 PM", 
    text: "Armina Raul Meyes đã hủy gói du lịch Caribbean Cruise.", 
    icon: XCircle 
  },
  { 
    time: "2:30 PM", 
    text: "Lydia Billings đã gửi đánh giá cho gói du lịch gần đây của cô ấy.", 
    icon: Star 
  },
];


const AdminDashboard = () => {

    const [valueSelect, setValueSelect] = useState('Day');
    return (
        <div className="flex flex-col gap-4">

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {kpis.map((kpi) => (
                    <Card key={kpi.label}>
                        <CardHeader>
                            <CardTitle className="text-xl text-muted-foreground leading-none">{kpi.label}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-semibold">{kpi.value}</div>
                            <div className="text-xs text-muted-foreground mt-1">Vs. Kỳ trước • {kpi.delta}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <Card className="xl:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between border-b " >
                        <CardTitle className="text-xl text-muted-foreground">Tour đã đặt</CardTitle>
                        <AppSelect
                            className="w-[100px] bg-[#60a5fa]"
                            placeholder="Chọn loại"
                            data={dataSelect}
                            valueSelect={valueSelect}
                            onChange={(value) => setValueSelect(value)}
                            txtColor="white"
                        />
                    </CardHeader>
                    <CardContent className="pt-1">
                        <BarCharDashboard />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="border-b">
                        <CardTitle className="text-xl text-muted-foreground">Recent Activity</CardTitle>
                        <CardAction>
                            <Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>
                        </CardAction>
                    </CardHeader>
                    <CardContent className="">
                        <div className="text-sm font-medium mb-3">Today</div>
                        <div className="flex flex-col gap-4">
                            {recentActivities.map((a, idex) => {
                                const Icon = a.icon
                                return (
                                    <div key={idex} className="flex items-start gap-3 hover:bg-muted/100 rounded-sm">
                                        <div className="size-8 rounded-full bg-blue-300 flex items-center justify-center">
                                            <Icon className="size-4 text-primary" color="white"/>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm">{a.text}</div>
                                            <div className="text-xs text-muted-foreground mt-1">{a.time}</div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="w-full">
                <Card className="xl:col-span-2">
                    <CardHeader className="border-b">
                        <CardTitle>List of Deals</CardTitle>
                        <CardAction>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="hover:bg-blue-500 hover:text-white"
                            >Tất cả</Button>
                        </CardAction>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="text-left text-muted-foreground">
                                        <th className="py-3 font-medium">Name</th>
                                        <th className="py-3 font-medium">Booking Code</th>
                                        <th className="py-3 font-medium">Package</th>
                                        <th className="py-3 font-medium">Duration</th>
                                        <th className="py-3 font-medium">Dates</th>
                                        <th className="py-3 font-medium">Price</th>
                                        <th className="py-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {bookings.map((row) => {
                                        const getStatusBadge = (status: string) => {
                                            const base =
                                                "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium";

                                            switch (status) {
                                                case "Completed":
                                                    return (
                                                        <span className={`${base} bg-blue-500/15 text-blue-700`}>
                                                            Completed
                                                        </span>
                                                    );

                                                case "Confirmed":
                                                    return (
                                                        <span className={`${base} bg-green-500/15 text-green-700`}>
                                                            Confirmed
                                                        </span>
                                                    );

                                                case "Pending":
                                                    return (
                                                        <span className={`${base} bg-orange-500/15 text-orange-700`}>
                                                            Pending
                                                        </span>
                                                    );

                                                case "Cancelled":
                                                    return (
                                                        <span className={`${base} bg-red-500/15 text-red-700`}>
                                                            Cancelled
                                                        </span>
                                                    );
                                            }
                                        };

                                        return (
                                            <tr
                                                key={row.code}
                                                onClick={() => console.log("Row clicked:", row)}
                                                className="cursor-pointer hover:bg-muted/30 transition-colors"
                                            >
                                                <td className="py-3 font-medium">{row.name}</td>
                                                <td className="py-3">{row.code}</td>
                                                <td className="py-3">{row.package}</td>
                                                <td className="py-3">{row.duration}</td>
                                                <td className="py-3">{row.dates}</td>
                                                <td className="py-3">{row.price}</td>
                                                <td className="py-3">{getStatusBadge(row.status)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default AdminDashboard