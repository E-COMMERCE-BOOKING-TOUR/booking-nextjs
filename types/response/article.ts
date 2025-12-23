export interface IArticleImage {
    image_url: string;
}

export interface IArticlePopular {
    id: number | string;
    title: string;
    content: string;
    tags: string[];
    images: IArticleImage[];
    created_at?: string;
    count_views: number;
    count_likes: number;
    count_comments: number;
    user: { name: string; avatar: string };
    tour_id?: number | string;
    is_visible?: boolean;
}

