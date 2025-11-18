export interface TourTestimonial {
    name: string;
    country: string;
    text: string;
}

export interface TourData {
    title: string;
    location: string;
    price: number;
    oldPrice?: number;
    rating: number;
    reviewCount: number;
    score: number;
    scoreLabel: string;
    staffScore: number;
    images: string[];
    testimonial: TourTestimonial;
    mapUrl: string;
    mapPreview?: string;
    description: string;
    activity: {
        title: string;
        items: string[];
    };
    included: string[];
    notIncluded: string[];
    details: {
        language: string[];
        duration: string;
        capacity: string;
    };
    meetingPoint: string;
}

export interface RelatedTour {
    id: string;
    image: string;
    title: string;
    location: string;
    rating: number;
    reviews: number;
    ratingText: string;
    capacity: string;
    originalPrice?: number;
    currentPrice: number;
    tags: string[];
    slug: string;
}

export interface Review {
    id: string;
    userName: string;
    userAvatar: string;
    rating: number;
    date: string;
    title: string;
    content: string;
    verified: boolean;
    helpfulCount?: number;
}

export interface ReviewCategory {
    label: string;
    score: number;
}

