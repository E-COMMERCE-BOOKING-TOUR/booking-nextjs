'use client';

import { Box, Center, Spinner, Text, VStack, Button } from '@chakra-ui/react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Fragment } from 'react';
import notificationApi from '@/apis/notification';
import { ItemNotification } from './ItemNotification';
import { INotification } from '@/types/notification';

const ListNotification = () => {
    const { data: session } = useSession();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        error
    } = useInfiniteQuery({
        queryKey: ['notifications', session?.user?.accessToken],
        queryFn: async ({ pageParam = 1 }) => {
            if (!session?.user?.accessToken) return null;
            const res = await notificationApi.getMe(session.user.accessToken, pageParam as number, 10);
            if (res.ok && res.data) {
                return res.data;
            }
            throw new Error(res.error || "Failed to fetch notifications");
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (!lastPage) return undefined;
            return lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined;
        },
        enabled: !!session?.user?.accessToken,
    });

    if (status === 'pending') {
        return (
            <Center py={10}>
                <Spinner color="teal.500" />
            </Center>
        );
    }

    if (status === 'error') {
        return (
            <Center py={10}>
                <Text color="red.500">Failed to load notifications: {(error as Error).message}</Text>
            </Center>
        );
    }

    if (data?.pages[0]?.data.length === 0) {
        return (
            <Center py={10}>
                <Text color="gray.500">No notifications yet.</Text>
            </Center>
        );
    }

    const formatRelativeTime = (date: string | Date) => {
        const now = new Date();
        const past = new Date(date);
        const diffInMs = now.getTime() - past.getTime();
        const diffInSeconds = Math.floor(diffInMs / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays < 7) return `${diffInDays}d ago`;
        return past.toLocaleDateString();
    };

    const mapNotificationToItemData = (notif: INotification) => {
        return {
            user: notif.title,
            avatar: "",
            content: notif.description,
            time: formatRelativeTime(notif.created_at)
        };
    };

    return (
        <VStack align="stretch" gap={0}>
            {data?.pages.map((page, i) => (
                <Fragment key={i}>
                    {page?.data?.map((notif) => (
                        <ItemNotification
                            key={notif.id}
                            type={notif.type}
                            data={mapNotificationToItemData(notif)}
                        />
                    ))}
                </Fragment>
            ))}

            {(hasNextPage) && (
                <Box p={4} display="flex" justifyContent="center">
                    <Button
                        onClick={() => fetchNextPage()}
                        loading={isFetchingNextPage}
                        variant="ghost"
                        colorScheme="teal"
                        size="sm"
                    >
                        Load more
                    </Button>
                </Box>
            )}
        </VStack>
    );
};

export default ListNotification;
