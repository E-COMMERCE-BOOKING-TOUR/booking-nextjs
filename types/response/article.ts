export interface IArticlePopular {
    id: number | string;
    title: string;
    description: string;
    image: string;
    tags: string[];
    images: string[];
    timestamp?: string;
    views: number;
    likes: number;
    comments: number;
    user: { name: string; avatar: string };
}

