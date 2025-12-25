export type ITourPopular = {
    id: string | number;
    image: string;
    title: string;
    location: string;
    rating: number;
    reviews: number;
    ratingText: string;
    capacity: string;
    originalPrice: number;
    currentPrice: number;
    tags: string[];
    slug: string;
    currencySymbol?: string;
    currencyCode?: string;
};

export type ITourSearchResponse = {
    data: ITourPopular[];
    total: number;
    offset?: number;
    limit?: number;
};

