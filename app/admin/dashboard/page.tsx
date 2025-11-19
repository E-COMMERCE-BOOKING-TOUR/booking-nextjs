"use client";

import { Card, CardTitle, CardHeader, CardContent, CardAction } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { CalendarDays, UserCog, CreditCard, XCircle, Star, MoreHorizontal } from "lucide-react";
import { AppSelect } from "@/components/AppSelect";
import { BarCharDashboard } from "./components/BarChart.dashboard";
import { adminApi } from "@/apis/admin";
import { IBooking } from "@/types/response/booking.type";
import { ITour } from "@/types/response/tour.type";
import { INotification } from "@/types/response/user.type";

const dataSelect = ['Ngày', 'Tháng', 'Năm']

const AdminDashboard = () => {

    const [valueSelect, setValueSelect] = useState('Ngày');
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [bookings, setBookings] = useState<IBooking[]>([]);
    const [tours, setTours] = useState<ITour[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const resNotifications = await adminApi.getNotifications();
                setNotifications(resNotifications);

                const resBooking = await adminApi.getBooking();
                setBookings(resBooking);

                const resTour = await adminApi.getTour();
                setTours(resTour);
            } catch (e) {
                throw new Error('Error get notification: ' + e);
            }
        })();
    }, []);

    const totalAmount = () => {
        return bookings.reduce((total, booking) => total + (booking.total_amount ?? 0), 0);
    }

    const totalTourActive = () => {
        return tours.filter((tour) => tour.status === 'active').length;
    }

    const kpis = [
    { label: "Doanh thu", value: "$" + totalAmount(), delta: "+2.74%" },
    { label: "Booking", value: bookings.length.toString(), delta: "+32.5%" },
    { label: "Tour", value: tours.length.toString(), delta: "-18.9%" },
    { label: "Tour đang mở", value: totalTourActive().toString(), delta: "+14.7%" },
]

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
                            valueSelect={valueSelect ?? 'Ngày'}
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
                        <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-1">
                            {notifications.map((n, index) => {
                                const Icon = n.is_error ? XCircle : n.is_user ? UserCog : Star;
                                const bg = n.is_error ? "bg-red-300" : "bg-blue-300";
                                return (
                                    <div key={index} className="flex items-start gap-3 hover:bg-muted/100 rounded-sm">
                                        <div className={`size-8 rounded-full ${bg} flex items-center justify-center`}>
                                            <Icon className="size-4 text-primary" color="white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm">{n.title}</div>
                                            <div className="text-xs text-muted-foreground mt-1">{n.type}</div>
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
                        <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="text-left text-muted-foreground sticky top-0 bg-background">
                                        <th className="py-3 font-medium">Number</th>
                                        <th className="py-3 font-medium">Contact Name</th>
                                        <th className="py-3 font-medium">Email</th>
                                        <th className="py-3 font-medium">Phone</th>
                                        <th className="py-3 font-medium">Total</th>
                                        <th className="py-3 font-medium">Status</th>
                                        <th className="py-3 font-medium">Payment</th>
                                        <th className="py-3 font-medium">User ID</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {bookings.map((row, index) => {
                                        const base = "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium";
                                        const getBadge = (value: string, kind: "status" | "payment") => {
                                            if (kind === "status") {
                                                if (value === "confirmed") {
                                                    return <span className={`${base} bg-green-500/15 text-green-700`}>confirmed</span>;
                                                } else if (value === "pending") {
                                                    return <span className={`${base} bg-orange-500/15 text-orange-700`}>pending</span>;
                                                } else if (value === "cancelled") {
                                                    return <span className={`${base} bg-red-500/15 text-red-700`}>cancelled</span>;
                                                } else if (value === "expired") {
                                                    return <span className={`${base} bg-gray-500/15 text-gray-700`}>expired</span>;
                                                } else if (value === "Completed") {
                                                    return <span className={`${base} bg-blue-500/15 text-blue-700`}>Completed</span>;
                                                } else if (value === "Confirmed") {
                                                    return <span className={`${base} bg-green-500/15 text-green-700`}>Confirmed</span>;
                                                } else if (value === "Pending") {
                                                    return <span className={`${base} bg-orange-500/15 text-orange-700`}>Pending</span>;
                                                } else if (value === "Cancelled") {
                                                    return <span className={`${base} bg-red-500/15 text-red-700`}>Cancelled</span>;
                                                } else {
                                                    return <span className={`${base} bg-gray-500/15 text-gray-700`}>{value}</span>;
                                                }
                                            } else {
                                                if (value === "paid") {
                                                    return <span className={`${base} bg-green-500/15 text-green-700`}>paid</span>;
                                                } else if (value === "unpaid") {
                                                    return <span className={`${base} bg-red-500/15 text-red-700`}>unpaid</span>;
                                                } else if (value === "refunded") {
                                                    return <span className={`${base} bg-purple-500/15 text-purple-700`}>refunded</span>;
                                                } else if (value === "partial") {
                                                    return <span className={`${base} bg-orange-500/15 text-orange-700`}>partial</span>;
                                                } else {
                                                    return <span className={`${base} bg-gray-500/15 text-gray-700`}>{value}</span>;
                                                }
                                            }
                                        };

                                        return (
                                            <tr
                                                key={index}
                                                onClick={() => console.log("Row clicked:", row)}
                                                className="cursor-pointer hover:bg-muted/30 transition-colors"
                                            >
                                                <td className="py-3 font-medium">{row.id}</td>
                                                <td className="py-3 font-medium">{row.contact_name}</td>
                                                <td className="py-3 font-medium">{row.contact_email}</td>
                                                <td className="py-3 font-medium">{row.contact_phone}</td>
                                                <td className="py-3 font-medium">{row.total_amount}</td>
                                                <td className="py-3 font-medium">{getBadge(row.status ?? '', "status")}</td>
                                                <td className="py-3 font-medium">{getBadge(row.payment_status ?? '', "payment")}</td>
                                                <td className="py-3 font-medium">{row.user.full_name}</td>
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