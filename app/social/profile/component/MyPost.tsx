"use client";
import React from 'react';
import { Box, List, Spinner, Center, Text } from "@chakra-ui/react";
import ItemBlog from "@/app/social/component/ItemBlog";
import { useQuery } from "@tanstack/react-query";
import type { IArticlePopular } from "@/types/response/article";
import article from "@/apis/article";
import { useSession } from "next-auth/react";

const MyPost = () => {
    const { data: session } = useSession();

    const { data: articles, isLoading } = useQuery<IArticlePopular[]>({
        queryKey: ['my-articles', session?.user?.accessToken],
        queryFn: async (): Promise<IArticlePopular[]> => {
            if (!session?.user?.accessToken) return [];
            const res = await article.getMyArticles(session.user.accessToken);
            console.log(res);
            return res;
        },
        enabled: !!session?.user?.accessToken,
        staleTime: 1000 * 60 * 5,
    });

    if (isLoading) {
        return <Center py={10}><Spinner size="xl" color="white" /></Center>;
    }

    if (!articles || articles.length === 0) {
        return (
            <Box p={8} textAlign="center">
                <Text color="whiteAlpha.500">You haven't posted any articles yet.</Text>
            </Box>
        );
    }

    return (
        <List.Root w="full" variant="marker" gap={3} display="flex" flexDirection="column" alignItems={'center'}>
            {articles.map((item: IArticlePopular, index: number) => (
                <List.Item key={index.toString()}
                    w="full"
                    display={'flex'}
                    alignItems={'center'}
                    justifyContent={'center'}
                >
                    <ItemBlog {...item} />
                </List.Item>
            ))}
        </List.Root>
    );
};

export default MyPost;
