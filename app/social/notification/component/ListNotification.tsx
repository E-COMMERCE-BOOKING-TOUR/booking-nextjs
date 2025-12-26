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

    const mapNotificationToItemData = (notif: INotification) => {
        // Mapping INotification to the structure expected by ItemNotification
        // Since INotification doesn't have sender info, we use title as user and description as content for now.
        // Or we might need to adjust ItemNotification to better suit the real data model.
        return {
            user: notif.title,
            avatar: "", // Placeholder or default avatar
            content: notif.description,
            time: new Date(notif.created_at).toLocaleString() // Simple formatting
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
