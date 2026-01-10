export interface IRevenuesByCurrency {
    [currencyCode: string]: {
        symbol: string;
        todayRevenue: number;
        monthlyRevenue: number;
        totalRevenue: number;
    };
}

export interface IDashboardStats {
    kpis: {
        todayRevenue: number;
        monthlyRevenue: number;
        totalRevenue: number;
        activeToursCount: number;
        totalUsers: number;
        totalBookings: number;
        revenuesByCurrency?: IRevenuesByCurrency;
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
        currency_code?: string;
        currency_symbol?: string;
    }>;
    recentBookings: Array<{
        id: number;
        contact_name: string;
        contact_email: string;
        status: string;
        total_amount: number;
        created_at: string;
        currency_code?: string;
        currency_symbol?: string;
    }>;
}

