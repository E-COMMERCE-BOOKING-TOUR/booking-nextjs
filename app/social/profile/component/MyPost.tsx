"use client";
import React from 'react';
import { Box, Spinner, Center, Text, SimpleGrid } from "@chakra-ui/react";
import ProfilePostCard from "./ProfilePostCard";
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
            return res;
        },
        enabled: !!session?.user?.accessToken,
        staleTime: 1000 * 60 * 5,
    });

    if (isLoading) {
        return <Center py={10}><Spinner size="xl" color="#00cec9" /></Center>;
    }

    if (!articles || articles.length === 0) {
        return (
            <Box p={8} textAlign="center" w="full">
                <Text color="gray.500">You haven't posted any articles yet.</Text>
            </Box>
        );
    }

    return (
        <SimpleGrid columns={{ base: 2, md: 3 }} gap={4} w="full">
            {articles.map((item: IArticlePopular,index: number) => (
                <ProfilePostCard key={index} article={item} />
            ))}
        </SimpleGrid>
    );
};

export default MyPost;
