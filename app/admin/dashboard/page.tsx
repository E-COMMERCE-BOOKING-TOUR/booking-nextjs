"use client";

import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useState, useMemo } from "react"
import {
    TrendingUp,
    Users as UsersIcon,
    Package,
    DollarSign,
    Plus,
    Download,
    History,
    Flame,
    Navigation
} from "lucide-react";
import { AppSelect } from "@/components/AppSelect";
import { BarCharDashboard } from "./components/BarChart.dashboard";
import { adminDashboardApi } from "@/apis/admin/dashboard";
import { IDashboardStats } from "@/types/admin/dashboard";
import { useSession } from "next-auth/react";
import Link from "next/link";

const dataSelect = ['Last 6 Months', 'Last Year']

const AdminDashboard = () => {
    const { data: session } = useSession();
    const token = session?.user?.accessToken;

    const [valueSelect, setValueSelect] = useState('Last 6 Months');
    const [stats, setStats] = useState<IDashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!token) return;

        const fetchStats = async () => {
            setIsLoading(true);
            try {
                const data = await adminDashboardApi.getStats(token);
                setStats(data);
            } catch (e) {
                console.error('Error fetching dashboard stats:', e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    const kpis = useMemo(() => {
        if (!stats) return [];
        const { kpis: k } = stats;
        return [
            {
                label: "Today's Revenue",
                value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND' }).format(k.todayRevenue),
                delta: "Since 00:00",
                icon: DollarSign,
                color: "text-emerald-400",
                bg: "bg-emerald-400/10",
                trend: "up"
            },
            {
                label: "Monthly Revenue",
                value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND' }).format(k.monthlyRevenue),
                delta: "In " + new Date().toLocaleString('en-US', { month: 'long' }),
                icon: TrendingUp,
                color: "text-blue-400",
                bg: "bg-blue-400/10",
                trend: "up"
            },
            {
                label: "Active Tours",
                value: k.activeToursCount.toString(),
                delta: k.activeToursCount.toString() + " total",
                icon: Package,
                color: "text-amber-400",
                bg: "bg-amber-400/10",
                trend: "neutral"
            },
            {
                label: "Users",
                value: k.totalUsers.toString(),
                delta: "Total Members",
                icon: UsersIcon,
                color: "text-purple-400",
                bg: "bg-purple-400/10",
                trend: "up"
            },
        ];
    }, [stats]);

    const chartData = useMemo(() => {
        if (!stats) return [];
        return stats.chartData || [];
    }, [stats]);

    const trendingTours = useMemo(() => {
        if (!stats) return [];
        return stats.trendingTours || [];
    }, [stats]);

    const recentBookings = useMemo(() => {
        if (!stats) return [];
        return stats.recentBookings || [];
    }, [stats]);

    if (isLoading || !stats) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Welcome back! Here is your business summary.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                        <Download className="size-4" />
                        Export Report
                    </Button>
                    <Button asChild className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20">
                        <Link href="/admin/tour/create">
                            <Plus className="size-4" />
                            Add New Tour
                        </Link>
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi) => (
                    <Card key={kpi.label} className="border-white/5 bg-card/20 backdrop-blur-xl hover:border-primary/30 hover:bg-card/30 transition-all group overflow-hidden relative">
                        <div className={`absolute top-0 right-0 size-24 -mt-8 -mr-8 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${kpi.bg}`} />
                        <CardContent className="p-6 relative">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-2xl ${kpi.bg}`}>
                                    <kpi.icon className={`size-6 ${kpi.color}`} />
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 bg-white/5 px-2 py-1 rounded-md">
                                    {kpi.delta}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest">{kpi.label}</p>
                                <h3 className="text-2xl font-black mt-1 text-foreground tabular-nums">{kpi.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <Card className="lg:col-span-2 border-white/5 bg-card/20 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6 px-8">
                        <div>
                            <CardTitle className="text-xl font-black text-foreground">Revenue Analysis</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">Recent revenue growth chart</p>
                        </div>
                        <AppSelect
                            className="w-[160px] bg-white/5 border-white/10"
                            placeholder="Time Range"
                            data={dataSelect}
                            valueSelect={valueSelect}
                            onChange={(value) => setValueSelect(value)}
                        />
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-[400px]">
                            <BarCharDashboard data={chartData} />
                        </div>
                    </CardContent>
                </Card>

                {/* Trending Tours */}
                <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
                    <CardHeader className="border-b border-white/5 pb-6 px-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-500/10">
                                <Flame className="size-5 text-orange-500 animate-pulse" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold text-foreground">Trending Tours</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">Top 5 best-selling tours</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {trendingTours.length > 0 ? trendingTours.map((tour, idx: number) => (
                            <div key={idx} className="flex items-center gap-4 group">
                                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-primary text-sm border border-white/10 group-hover:bg-primary group-hover:text-white transition-all">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold truncate text-foreground/90 group-hover:text-primary transition-colors">{tour.title}</div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-bold">
                                            <Navigation className="size-3" />
                                            {tour.count} bookings
                                        </div>
                                        <div className="text-[10px] text-emerald-400 font-bold">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND' }).format(tour.revenue)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="py-10 text-center text-muted-foreground">
                                No trending data available.
                            </div>
                        )}
                        <div className="pt-6 border-t border-white/5">
                            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-1">General Data</p>
                                    <p className="text-3xl font-black text-primary">
                                        {stats.kpis.totalBookings} Orders
                                    </p>
                                </div>
                                <TrendingUp className="size-10 text-primary opacity-20" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions Table */}
            <Card className="border-white/5 bg-card/20 backdrop-blur-xl overflow-hidden shadow-2xl">
                <CardHeader className="border-b border-white/5 pb-6 px-8 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-black text-foreground">Recent Transactions</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Latest transaction history</p>
                    </div>
                    <Button asChild variant="ghost" className="text-primary hover:bg-primary/10 font-bold">
                        <Link href="/admin/booking">View All</Link>
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">ID</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Customer</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Status</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Revenue</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-right">Booking Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {recentBookings.map((booking) => (
                                    <tr key={booking.id} className="group hover:bg-white/[0.05] transition-all cursor-pointer">
                                        <td className="px-8 py-5 whitespace-nowrap text-xs font-mono font-bold text-muted-foreground group-hover:text-primary">#{booking.id}</td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-primary text-sm font-black border border-white/10 group-hover:border-primary/50 group-hover:scale-105 transition-all">
                                                    {booking.contact_name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-foreground truncate max-w-[150px]">{booking.contact_name}</span>
                                                    <span className="text-[10px] text-muted-foreground font-medium">{booking.contact_email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                booking.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                    'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                }`}>
                                                <div className={`size-1.5 rounded-full mr-2 shadow-[0_0_8px] ${booking.status === 'confirmed' ? 'bg-emerald-400 shadow-emerald-400' :
                                                    booking.status === 'pending' ? 'bg-amber-400 shadow-amber-400' : 'bg-rose-400 shadow-rose-400'
                                                    }`} />
                                                {booking.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap font-mono text-sm font-black text-foreground">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND' }).format(Number(booking.total_amount))}
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-right text-xs text-muted-foreground font-bold">
                                            {booking.created_at ? new Date(booking.created_at).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                                {recentBookings.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-muted-foreground bg-white/5">
                                            <History className="size-12 mx-auto mb-4 opacity-10" />
                                            No booking transactions recorded.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default AdminDashboard