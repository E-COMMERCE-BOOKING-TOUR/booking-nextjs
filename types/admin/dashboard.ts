export interface IDashboardStats {
    kpis: {
        todayRevenue: number;
        monthlyRevenue: number;
        activeToursCount: number;
        totalUsers: number;
        totalBookings: number;
    };
    chartData: Array<{
        name: string;
        value: number;
        [key: string]: unknown;
    }>;
    trendingTours: Array<{
        title: string;
        count: number;
        revenue: number;
    }>;
    recentBookings: Array<{
        id: number;
        contact_name: string;
        contact_email: string;
        status: string;
        total_amount: number;
        created_at: string;
    }>;
}
