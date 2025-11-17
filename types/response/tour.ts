export interface ITourLatest {
    id: number;
    name: string;
    description: string;
    image: string;
    price: number;
    discount: number;
    rating: number;
    reviews: number;
    tags: string[];
    district: string;
}

export interface ITourPopular {
    id: number;
    title: string;
    location: string;
    image: string;
    rating: number;
    reviews: number;
    ratingText: string;
    capacity: string;
    originalPrice?: number;
    currentPrice: number;
    tags: string[];
}