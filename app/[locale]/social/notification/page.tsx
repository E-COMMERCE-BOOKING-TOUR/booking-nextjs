'use client';
export const dynamic = "force-dynamic";

import {
    Box,
    Flex,
    Heading,
} from '@chakra-ui/react';

import ListNotification from './component/ListNotification';

export default function NotificationsPage() {
    return (
        <Box w="full" bg="white" color="black" borderRadius="2xl" p={6} shadow="sm">
            {/* Header */}
            <Flex justify="space-between" align="center" mb={6}>
                <Heading as="h1" size="xl" fontWeight="bold" color="gray.800">
                    Notifications
                </Heading>
            </Flex>

            {/* List */}
            <ListNotification />
        </Box>
    );
}
