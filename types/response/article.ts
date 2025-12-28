export interface IArticleImage {
    image_url: string;
}

export interface IArticlePopular {
    id: number | string;
    _id?: string;
    title: string;
    content: string;
    tags: string[];
    images: IArticleImage[];
    created_at?: string;
    count_views: number;
    count_likes: number;
    count_comments: number;
    user: { name: string; avatar: string };
    user_id: string;
    tour_id?: number | string;
    tour?: { id: number; title: string; slug: string };
    is_visible?: boolean;
    comments?: any[];
    users_like?: string[];
    users_bookmark?: string[];
}

