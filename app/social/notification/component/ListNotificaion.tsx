import { Box, Flex, Icon, Spinner, Text, VStack, Button, Center } from "@chakra-ui/react"
import { FiAlertTriangle, FiGift, FiSettings, FiCalendar, FiInfo, FiCheckCircle } from "react-icons/fi";
import { HiDotsHorizontal } from "react-icons/hi";
import { useInfiniteQuery } from "@tanstack/react-query";
import notificationApi from "@/apis/notification";
import { useSession } from "next-auth/react";
import { INotification, NotificationType } from "@/types/notification";
import { Fragment } from "react";

const mapNotificationTypeToIcon = (type: NotificationType, isError: boolean) => {
    if (isError) return { icon: FiAlertTriangle, color: "red.500" };
    switch (type) {
        case NotificationType.welcome:
        case NotificationType.reward:
        case NotificationType.promotion:
            return { icon: FiGift, color: "purple.500" };
        case NotificationType.alert:
            return { icon: FiAlertTriangle, color: "red.500" };
        case NotificationType.booking:
        case NotificationType.payment:
        case NotificationType.reminder:
            return { icon: FiCalendar, color: "blue.500" };
        case NotificationType.feature:
            return { icon: FiSettings, color: "green.500" };
        default:
            return { icon: FiInfo, color: "gray.500" };
    }
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const ItemNotification = ({ notif }: { notif: INotification }) => {
    const { icon, color } = mapNotificationTypeToIcon(notif.type, notif.is_error);

    return (
        <Flex
            p={4}
            backgroundColor="whiteAlpha.100"
            borderBottom="1px solid"
            borderColor="whiteAlpha.200"
            gap={3}
            _hover={{ bg: "whiteAlpha.200" }}
            cursor="pointer"
            transition="background 0.2s"
        >
            {/* Icon Column */}
            <Box pt={1}>
                <Icon as={icon} boxSize={6} color={color} />
            </Box>

            {/* Text Column */}
            <VStack align="start" gap={1} flex={1}>
                <Text fontSize="15px" lineHeight="1.4" color="whiteAlpha.900" fontWeight="medium">
                    {notif.title}
                </Text>
                <Text fontSize="14px" lineHeight="1.4" color="whiteAlpha.600">
                    {notif.description}
                </Text>
            </VStack>

            {/* Action/Date Column */}
            <VStack align="end" justify="space-between" gap={2}>
                <Icon as={HiDotsHorizontal} color="whiteAlpha.500" boxSize={5} />
                <Text fontSize="xs" color="whiteAlpha.500" whiteSpace="nowrap">
                    {formatDate(notif.created_at)}
                </Text>
            </VStack>
        </Flex>
    )
}

const ListNotification = () => {
    const { data: session } = useSession();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['notifications', session?.user?.accessToken],
        queryFn: async ({ pageParam = 1 }) => {
            if (!session?.user?.accessToken) return null;
            const res = await notificationApi.getMe(session.user.accessToken, pageParam as number, 10);
            console.log(res);
            if (res.ok && res.data) {
                return res.data; // This matches IPaginatedNotifications
            }
            throw new Error(res.error || "Failed to fetch notifications");
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage) return undefined;
            return lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined;
        },
        enabled: !!session?.user?.accessToken,
    });

    if (status === 'pending') {
        return (
            <Center py={10}>
                <Spinner color="white" />
            </Center>
        );
    }

    if (status === 'error') {
        return (
            <Center py={10}>
                <Text color="red.400">Failed to load notifications.</Text>
            </Center>
        );
    }

    return (
        <VStack align="stretch" gap={0}>
            {data?.pages.map((page, i) => (
                <Fragment key={i}>
                    {page?.data?.map((notif) => (
                        <ItemNotification key={notif.id} notif={notif} />
                    ))}
                </Fragment>
            ))}

            {(hasNextPage || isFetchingNextPage) && (
                <Box p={4}>
                    <Button
                        onClick={() => fetchNextPage()}
                        disabled={!hasNextPage || isFetchingNextPage}
                        loading={isFetchingNextPage}
                        variant="ghost"
                        colorScheme="whiteAlpha"
                        w="full"
                        size="sm"
                    >
                        {isFetchingNextPage ? 'Loading more...' : 'Load more'}
                    </Button>
                </Box>
            )}

            {!hasNextPage && data?.pages[0]?.data.length === 0 && (
                <Box p={8} textAlign="center">
                    <Text color="whiteAlpha.500">No notifications yet</Text>
                </Box>
            )}
        </VStack>
    )
}

export default ListNotification;
