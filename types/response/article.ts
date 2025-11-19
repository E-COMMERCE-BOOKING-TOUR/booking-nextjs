export interface IArticlePopular {
    id: number;
    title: string;
    description: string;
    image: string;
    tags: string[];
    timestamp?: string;
    views: number;
    likes: number;
    comments: number;
}

