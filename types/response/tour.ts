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
    slug: string;
}

export interface ITourActivity {
    title: string;
    items: string[];
}

export interface ITourDetails {
    language: string[];
    duration: string;
    capacity: string;
}

export interface ITourTestimonial {
    name: string;
    country: string;
    text: string;
}

export interface ITourDetail {
    id: number;
    title: string;
    slug: string;
    location: string;
    price: number;
    oldPrice?: number;
    rating: number;
    reviewCount: number;
    score: number;
    scoreLabel: string;
    staffScore: number;
    images: string[];
    testimonial?: ITourTestimonial;
    mapUrl: string;
    mapPreview?: string;
    description: string;
    summary: string;
    activity?: ITourActivity;
    included: string[];
    notIncluded: string[];
    details: ITourDetails;
    meetingPoint?: string;
    tags: string[];
}

export interface ITourReview {
    id: string;
    userName: string;
    userAvatar: string;
    rating: number;
    date: string;
    title: string;
    content: string;
    verified: boolean;
}

export interface ITourReviewCategory {
    label: string;
    score: number;
}

export interface IRelatedTour {
    id: string;
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
}

export interface ITourSearchResponse {
    data: ITourPopular[];
    total: number;
    limit: number;
    offset: number;
}