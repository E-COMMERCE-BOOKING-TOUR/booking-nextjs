"use client";

import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useState, useMemo, useCallback } from "react"
import {
    TrendingUp,
    Users as UsersIcon,
    Package,
    DollarSign,
    Plus,
    Download,
    History,
    Flame,
    Navigation,
    Loader2,
    ChevronDown,
    FileSpreadsheet,
    Map,
    Wallet,
    LayoutDashboard
} from "lucide-react";
import { AppSelect } from "@/components/AppSelect";
import { BarCharDashboard } from "./components/BarChart.dashboard";
import { adminDashboardApi } from "@/apis/admin/dashboard";
import { IDashboardStats } from "@/types/admin/dashboard";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useTranslations, useFormatter } from "next-intl";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AdminDashboard = () => {
    const t = useTranslations("admin");
    const format = useFormatter();
    const { data: session } = useSession();
    const token = session?.user?.accessToken;

    const dataSelect = [t('last_6_months'), t('last_1_year')]
    const [valueSelect, setValueSelect] = useState(t('last_6_months'));
    const [stats, setStats] = useState<IDashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    // Export dialog state
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [exportType, setExportType] = useState<'bookings' | 'tours' | 'revenue' | null>(null);
    const [exportStartDate, setExportStartDate] = useState('');
    const [exportEndDate, setExportEndDate] = useState('');

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

    const isSupplier = session?.user?.role?.name?.toLowerCase() === 'supplier';

    // Export report as CSV
    const exportReport = useCallback(() => {
        if (!stats) return;

        setIsExporting(true);
        try {
            const now = new Date();
            const dateStr = format.dateTime(now, { year: 'numeric', month: '2-digit', day: '2-digit' });

            // Build CSV content
            const lines: string[] = [];

            // Header
            lines.push(`Dashboard Report - ${dateStr}`);
            lines.push('');

            // KPIs Section with multi-currency support
            lines.push('=== KPIs ===');

            const revenuesByCurrency = stats.kpis.revenuesByCurrency || {};
            const currencies = Object.keys(revenuesByCurrency);

            if (currencies.length > 0) {
                lines.push('');
                lines.push('Revenue by Currency:');
                currencies.forEach(code => {
                    const data = revenuesByCurrency[code];
                    lines.push(`${code} - Today,${data.symbol} ${data.todayRevenue}`);
                    lines.push(`${code} - Monthly,${data.symbol} ${data.monthlyRevenue}`);
                    lines.push(`${code} - Total,${data.symbol} ${data.totalRevenue}`);
                });
            } else {
                lines.push(`Today Revenue,${stats.kpis.todayRevenue}`);
                lines.push(`Monthly Revenue,${stats.kpis.monthlyRevenue}`);
                lines.push(`Total Revenue,${stats.kpis.totalRevenue}`);
            }

            lines.push(`Active Tours,${stats.kpis.activeToursCount}`);
            lines.push(`Total Bookings,${stats.kpis.totalBookings}`);
            if (stats.kpis.totalUsers) {
                lines.push(`Total Users,${stats.kpis.totalUsers}`);
            }
            lines.push('');

            // Chart Data Section
            lines.push('=== Monthly Revenue (Last 6 Months) ===');
            lines.push('Month,Revenue');
            stats.chartData.forEach(item => {
                lines.push(`${item.name},${item.value}`);
            });
            lines.push('');

            // Trending Tours Section with currency
            lines.push('=== Trending Tours (Top 5) ===');
            lines.push('Rank,Tour Title,Bookings,Revenue,Currency');
            stats.trendingTours.forEach((tour, idx: number) => {
                // Escape tour title if it contains comma
                const safeTitle = tour.title.includes(',') ? `"${tour.title}"` : tour.title;
                const currencySymbol = tour.currency_symbol || '₫';
                lines.push(`${idx + 1},${safeTitle},${tour.count},${currencySymbol} ${tour.revenue},${tour.currency_code || 'VND'}`);
            });
            lines.push('');

            // Recent Bookings Section with currency
            lines.push('=== Recent Bookings ===');
            lines.push('ID,Customer,Email,Status,Amount,Currency,Date');
            stats.recentBookings.forEach(booking => {
                const safeName = booking.contact_name?.includes(',') ? `"${booking.contact_name}"` : (booking.contact_name || '');
                const safeEmail = booking.contact_email?.includes(',') ? `"${booking.contact_email}"` : (booking.contact_email || '');
                const dateFormatted = booking.created_at ? format.dateTime(new Date(booking.created_at), { year: 'numeric', month: '2-digit', day: '2-digit' }) : '';
                const currencySymbol = booking.currency_symbol || '₫';
                lines.push(`${booking.id},${safeName},${safeEmail},${booking.status},${currencySymbol} ${booking.total_amount},${booking.currency_code || 'VND'},${dateFormatted}`);
            });

            // Create and download file
            const csvContent = lines.join('\n');
            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel UTF-8
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `dashboard-report-${now.toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success(t('export_report_success', { defaultValue: 'Report exported successfully' }));
        } catch (e) {
            console.error('Export failed:', e);
            toast.error(t('export_report_error', { defaultValue: 'Failed to export report' }));
        } finally {
            setIsExporting(false);
        }
    }, [stats, format, t]);

    // Helper function to download CSV
    const downloadCSV = (content: string, filename: string) => {
        const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Export All Bookings
    const exportBookings = useCallback(async () => {
        if (!token) return;
        setIsExporting(true);
        try {
            const data = await adminDashboardApi.exportBookings(token, {
                startDate: exportStartDate || undefined,
                endDate: exportEndDate || undefined,
            });

            const lines: string[] = [];
            lines.push('ID,Customer,Email,Phone,Status,Payment Status,Amount,Currency,Created At');

            data.forEach((b: any) => {
                const safeName = b.contact_name?.includes(',') ? `"${b.contact_name}"` : (b.contact_name || '');
                const safeEmail = b.contact_email?.includes(',') ? `"${b.contact_email}"` : (b.contact_email || '');
                const dateFormatted = b.created_at ? format.dateTime(new Date(b.created_at), { year: 'numeric', month: '2-digit', day: '2-digit' }) : '';
                lines.push(`${b.id},${safeName},${safeEmail},${b.contact_phone || ''},${b.status},${b.payment_status},${b.currency_symbol} ${b.total_amount},${b.currency_code},${dateFormatted}`);
            });

            downloadCSV(lines.join('\n'), `bookings-export-${new Date().toISOString().split('T')[0]}.csv`);
            toast.success(t('export_report_success', { defaultValue: 'Report exported successfully' }));
        } catch (e) {
            console.error('Export failed:', e);
            toast.error(t('export_report_error', { defaultValue: 'Failed to export report' }));
        } finally {
            setIsExporting(false);
            setExportDialogOpen(false);
        }
    }, [token, exportStartDate, exportEndDate, format, t]);

    // Export All Tours
    const exportTours = useCallback(async () => {
        if (!token) return;
        setIsExporting(true);
        try {
            const data = await adminDashboardApi.exportTours(token);

            const lines: string[] = [];
            lines.push('ID,Title,Status,Duration Days,Duration Hours,Address,Min Price,Max Price,Currency,Supplier,Variants,Created At');

            data.forEach((t: any) => {
                const safeTitle = t.title?.includes(',') ? `"${t.title}"` : (t.title || '');
                const safeAddress = t.address?.includes(',') ? `"${t.address}"` : (t.address || '');
                const safeSupplier = t.supplier_name?.includes(',') ? `"${t.supplier_name}"` : (t.supplier_name || '');
                const dateFormatted = t.created_at ? format.dateTime(new Date(t.created_at), { year: 'numeric', month: '2-digit', day: '2-digit' }) : '';
                lines.push(`${t.id},${safeTitle},${t.status},${t.duration_days || 0},${t.duration_hours || 0},${safeAddress},${t.currency_symbol} ${t.cached_min_price || 0},${t.currency_symbol} ${t.cached_max_price || 0},${t.currency_code},${safeSupplier},${t.variants_count},${dateFormatted}`);
            });

            downloadCSV(lines.join('\n'), `tours-export-${new Date().toISOString().split('T')[0]}.csv`);
            toast.success(t('export_report_success', { defaultValue: 'Report exported successfully' }));
        } catch (e) {
            console.error('Export failed:', e);
            toast.error(t('export_report_error', { defaultValue: 'Failed to export report' }));
        } finally {
            setIsExporting(false);
        }
    }, [token, format, t]);

    // Export Revenue Report
    const exportRevenue = useCallback(async () => {
        if (!token) return;
        setIsExporting(true);
        try {
            const data = await adminDashboardApi.exportRevenue(token, {
                startDate: exportStartDate || undefined,
                endDate: exportEndDate || undefined,
            });

            const lines: string[] = [];
            lines.push('Date,Currency,Revenue,Bookings Count');

            data.forEach((r: any) => {
                lines.push(`${r.date},${r.currency_code},${r.currency_symbol} ${r.revenue},${r.bookings_count}`);
            });

            downloadCSV(lines.join('\n'), `revenue-export-${new Date().toISOString().split('T')[0]}.csv`);
            toast.success(t('export_report_success', { defaultValue: 'Report exported successfully' }));
        } catch (e) {
            console.error('Export failed:', e);
            toast.error(t('export_report_error', { defaultValue: 'Failed to export report' }));
        } finally {
            setIsExporting(false);
            setExportDialogOpen(false);
        }
    }, [token, exportStartDate, exportEndDate, format, t]);

    // Handle export with filter dialog
    const handleExportWithFilter = (type: 'bookings' | 'tours' | 'revenue') => {
        if (type === 'tours') {
            // Tours don't need date filter, export directly
            exportTours();
        } else {
            setExportType(type);
            setExportStartDate('');
            setExportEndDate('');
            setExportDialogOpen(true);
        }
    };

    // Confirm export from dialog
    const confirmExport = () => {
        if (exportType === 'bookings') {
            exportBookings();
        } else if (exportType === 'revenue') {
            exportRevenue();
        }
    };

    const kpis = useMemo(() => {
        if (!stats) return [];
        const { kpis: k } = stats;
        const revenuesByCurrency = k.revenuesByCurrency || {};
        const currencies = Object.keys(revenuesByCurrency);

        // Build multi-currency values for revenue cards
        const buildCurrencyValues = (type: 'today' | 'monthly') => {
            if (currencies.length === 0) {
                // Fallback to legacy single currency
                const value = type === 'today' ? k.todayRevenue : k.monthlyRevenue;
                return [{ symbol: '₫', amount: value, code: 'VND' }];
            }
            return currencies.map(code => ({
                symbol: revenuesByCurrency[code].symbol,
                amount: type === 'today'
                    ? revenuesByCurrency[code].todayRevenue
                    : revenuesByCurrency[code].monthlyRevenue,
                code
            })).filter(item => item.amount > 0); // Only show currencies with value
        };

        const todayValues = buildCurrencyValues('today');
        const monthlyValues = buildCurrencyValues('monthly');

        const revenueKpis = [
            {
                label: t('kpi_today_revenue'),
                values: todayValues,
                delta: t('kpi_from_start'),
                icon: DollarSign,
                color: "text-emerald-400",
                bg: "bg-emerald-400/10",
                trend: "up",
                isMultiCurrency: true
            },
            {
                label: t('kpi_monthly_revenue'),
                values: monthlyValues,
                delta: t('kpi_in_month') + " " + format.dateTime(new Date(), { month: 'long' }),
                icon: TrendingUp,
                color: "text-blue-400",
                bg: "bg-blue-400/10",
                trend: "up",
                isMultiCurrency: true
            },
        ];

        const otherKpis = [
            {
                label: t('kpi_active_tours'),
                value: k.activeToursCount.toString(),
                delta: k.activeToursCount.toString() + " " + t('kpi_total_suffix'),
                icon: Package,
                color: "text-amber-400",
                bg: "bg-amber-400/10",
                trend: "neutral"
            },
            {
                label: t('kpi_users'),
                value: k.totalUsers.toString(),
                delta: t('kpi_total_members'),
                icon: UsersIcon,
                color: "text-purple-400",
                bg: "bg-purple-400/10",
                trend: "up"
            },
        ];

        let allKpis = [...revenueKpis, ...otherKpis];

        if (isSupplier) {
            allKpis = allKpis.filter(kpi => !kpi.label.includes('Users') && !kpi.label.includes(t('kpi_users')));
        }
        return allKpis;
    }, [stats, isSupplier, t, format]);

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
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                        {isSupplier ? t('supplier_dashboard_title') : t('dashboard_title')}
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        {isSupplier
                            ? t('supplier_dashboard_desc')
                            : t('dashboard_welcome')}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="gap-2 border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                                disabled={isExporting}
                            >
                                {isExporting ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Download className="size-4" />
                                )}
                                {t('export_report')}
                                <ChevronDown className="size-4 ml-1" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-white/10">
                            <DropdownMenuItem
                                onClick={exportReport}
                                className="gap-2 cursor-pointer hover:bg-white/10 focus:bg-white/10"
                            >
                                <LayoutDashboard className="size-4" />
                                {t('export_dashboard_summary', { defaultValue: 'Dashboard Summary' })}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem
                                onClick={() => handleExportWithFilter('bookings')}
                                className="gap-2 cursor-pointer hover:bg-white/10 focus:bg-white/10"
                            >
                                <FileSpreadsheet className="size-4" />
                                {t('export_all_bookings', { defaultValue: 'All Bookings' })}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleExportWithFilter('tours')}
                                className="gap-2 cursor-pointer hover:bg-white/10 focus:bg-white/10"
                            >
                                <Map className="size-4" />
                                {t('export_all_tours', { defaultValue: 'All Tours' })}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleExportWithFilter('revenue')}
                                className="gap-2 cursor-pointer hover:bg-white/10 focus:bg-white/10"
                            >
                                <Wallet className="size-4" />
                                {t('export_revenue_report', { defaultValue: 'Revenue Report' })}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button asChild className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20">
                        <Link href="/admin/tour/create">
                            <Plus className="size-4" />
                            {t('add_new_tour')}
                        </Link>
                    </Button>
                </div>
            </div>


            {/* KPI Cards */}
            <div className={`grid grid-cols-1 md:grid-cols-2 ${isSupplier ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6`}>
                {kpis.map((kpi: any) => (
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
                                {kpi.isMultiCurrency && kpi.values ? (
                                    <div className="mt-2 space-y-1">
                                        {kpi.values.length > 0 ? kpi.values.map((v: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between">
                                                <span className="text-lg font-black text-foreground tabular-nums">
                                                    {v.symbol} {format.number(v.amount)}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-bold uppercase">
                                                    {v.code}
                                                </span>
                                            </div>
                                        )) : (
                                            <span className="text-lg font-black text-muted-foreground">—</span>
                                        )}
                                    </div>
                                ) : (
                                    <h3 className="text-2xl font-black mt-1 text-foreground tabular-nums">{kpi.value}</h3>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <Card className="lg:col-span-2 border-white/5 bg-card/20 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6 px-8" >
                        <div>
                            <CardTitle className="text-xl font-black text-foreground">{t('revenue_analysis')}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">{t('revenue_chart_desc')}</p>
                        </div>
                        <AppSelect
                            className="w-[160px] bg-white/5 border-white/10"
                            placeholder={t('time_select_placeholder')}
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
                                <CardTitle className="text-xl font-bold text-foreground">{t('trending_tours_title')}</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">{t('trending_tours_desc')}</p>
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
                                            {tour.count} {t('bookings_unit')}
                                        </div>
                                        <div className="text-[10px] text-emerald-400 font-bold">
                                            {tour.currency_symbol || '₫'} {format.number(tour.revenue)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="py-10 text-center text-muted-foreground">
                                {t('no_trending_data')}
                            </div>
                        )}
                        <div className="pt-6 border-t border-white/5">
                            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-1">{t('general_data')}</p>
                                    <p className="text-3xl font-black text-primary">
                                        {stats.kpis.totalBookings} {t('bookings_unit')}
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
                        <CardTitle className="text-xl font-black text-foreground">{t('recent_transactions_title')}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{t('recent_transactions_desc')}</p>
                    </div>
                    <Button asChild variant="ghost" className="text-primary hover:bg-primary/10 font-bold">
                        <Link href="/admin/booking">{t('view_all_button')}</Link>
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{t('col_id')}</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{t('col_customer')}</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{t('col_status')}</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{t('col_revenue')}</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-right">{t('col_booking_date')}</th>
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
                                            {booking.currency_symbol || '₫'} {format.number(Number(booking.total_amount))}
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-right text-xs text-muted-foreground font-bold">
                                            {booking.created_at ? format.dateTime(new Date(booking.created_at), { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                                {recentBookings.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-muted-foreground bg-white/5">
                                            <History className="size-12 mx-auto mb-4 opacity-10" />
                                            {t('no_bookings_recorded')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Export Filter Dialog */}
            <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>
                            {exportType === 'bookings'
                                ? t('export_all_bookings', { defaultValue: 'Export All Bookings' })
                                : t('export_revenue_report', { defaultValue: 'Export Revenue Report' })}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="startDate">{t('start_date', { defaultValue: 'Start Date' })}</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={exportStartDate}
                                onChange={(e) => setExportStartDate(e.target.value)}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="endDate">{t('end_date', { defaultValue: 'End Date' })}</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={exportEndDate}
                                onChange={(e) => setExportEndDate(e.target.value)}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t('export_date_hint', { defaultValue: 'Leave empty to export all data' })}
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setExportDialogOpen(false)}
                            className="border-white/10"
                        >
                            {t('cancel', { defaultValue: 'Cancel' })}
                        </Button>
                        <Button
                            onClick={confirmExport}
                            disabled={isExporting}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {isExporting ? (
                                <Loader2 className="size-4 animate-spin mr-2" />
                            ) : (
                                <Download className="size-4 mr-2" />
                            )}
                            {t('export', { defaultValue: 'Export' })}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AdminDashboard