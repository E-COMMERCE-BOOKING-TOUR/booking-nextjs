"use client";

import { Card, CardTitle, CardHeader, CardContent, CardAction } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { CalendarDays, UserCog, CreditCard, XCircle, Star, MoreHorizontal, Download, Plus, TrendingUp, TrendingDown, Users as UsersIcon, Package, DollarSign } from "lucide-react";
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
                const [resNotifications, resBooking, resTour] = await Promise.all([
                    adminApi.getNotifications(),
                    adminApi.getBooking(),
                    adminApi.getTour()
                ]);
                setNotifications(resNotifications);
                setBookings(resBooking);
                setTours(resTour);
            } catch (e) {
                console.error('Error fetching dashboard data:', e);
            }
        })();
    }, []);

    const totalAmount = bookings.reduce((total, booking) => total + (booking.total_amount ?? 0), 0);
    const totalTourActive = tours.filter((tour) => tour.status === 'active').length;

    const kpis = [
        { label: "Total Revenue", value: "$" + totalAmount.toLocaleString(), delta: "+2.74%", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: "Bookings", value: bookings.length.toString(), delta: "+32.5%", icon: CreditCard, color: "text-indigo-500", bg: "bg-indigo-500/10" },
        { label: "Total Tours", value: tours.length.toString(), delta: "-18.9%", icon: Package, color: "text-amber-500", bg: "bg-amber-500/10" },
        { label: "Active Tours", value: totalTourActive.toString(), delta: "+14.7%", icon: UsersIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
    ]

    return (
        <div className="flex flex-col gap-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Welcome back to your administration command center.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 border-border/60">
                        <Download className="size-4" />
                        Export Data
                    </Button>
                    <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                        <Plus className="size-4" />
                        New Tour
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi) => (
                    <Card key={kpi.label} className="border-border/60 bg-card/60 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ${kpi.bg}`}>
                                    <kpi.icon className={`size-6 ${kpi.color}`} />
                                </div>
                                <div className={`flex items-center gap-1 text-sm font-medium ${kpi.delta.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {kpi.delta.startsWith('+') ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                                    {kpi.delta}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                                <h3 className="text-3xl font-bold mt-1 text-foreground">{kpi.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <Card className="lg:col-span-2 border-border/60 bg-card/40 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-6 px-8">
                        <div>
                            <CardTitle className="text-xl font-semibold text-foreground">Revenue Analytics</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">Daily booking performance overview</p>
                        </div>
                        <AppSelect
                            className="w-[120px] bg-accent/50 border-border/60"
                            placeholder="Period"
                            data={dataSelect}
                            valueSelect={valueSelect ?? 'Ngày'}
                            onChange={(value) => setValueSelect(value)}
                        />
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-[400px]">
                            <BarCharDashboard />
                        </div>
                    </CardContent>
                </Card>

                {/* Activity Feed */}
                <Card className="border-border/60 bg-card/40 backdrop-blur-md">
                    <CardHeader className="border-b border-border/60 pb-6 px-8 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-semibold text-foreground">Recent Activity</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">Real-time system events</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="size-5" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="flex flex-col max-h-[500px] overflow-y-auto custom-scrollbar p-6 gap-6">
                            {notifications.length > 0 ? notifications.map((n, index) => {
                                const Icon = n.is_error ? XCircle : n.is_user ? UserCog : Star;
                                const colorClass = n.is_error ? "text-rose-500 bg-rose-500/10" : "text-blue-500 bg-blue-500/10";
                                return (
                                    <div key={index} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                                        <div className={`size-10 shrink-0 rounded-xl ${colorClass} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                            <Icon className="size-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold text-foreground truncate">{n.title}</div>
                                            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.type}</div>
                                            <div className="text-[10px] text-muted-foreground/60 mt-2 font-medium">Just now</div>
                                        </div>
                                    </div>
                                )
                            }) : (
                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                    <Star className="size-12 opacity-10 mb-4" />
                                    <p className="text-sm">No recent activity found</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table Section */}
            <Card className="border-border/60 bg-card/40 backdrop-blur-md overflow-hidden">
                <CardHeader className="border-b border-border/60 pb-6 px-8 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-semibold text-foreground">Recent Transactions</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Detailed list of tour booking deals</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-primary border-primary/20 bg-primary/5 hover:bg-primary/10">
                        View All Deals
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-border/40">
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">ID</th>
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Customer</th>
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Status</th>
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Amount</th>
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground/80 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {bookings.map((booking, index) => (
                                    <tr key={index} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                                        <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-muted-foreground">#{booking.id}</td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                                                    {booking.contact_name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-foreground">{booking.contact_name}</span>
                                                    <span className="text-xs text-muted-foreground">{booking.contact_email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    booking.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                                        'bg-rose-500/10 text-rose-500'
                                                }`}>
                                                <span className={`size-1.5 rounded-full mr-1.5 ${booking.status === 'confirmed' ? 'bg-emerald-500' :
                                                        booking.status === 'pending' ? 'bg-amber-500' :
                                                            'bg-rose-500'
                                                    }`} />
                                                {booking.status?.toUpperCase() || 'UNKNOWN'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className="text-sm font-bold text-foreground">
                                                ${Number(booking.total_amount).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-right">
                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreHorizontal className="size-5" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default AdminDashboard