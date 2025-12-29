'use client';

import {
    Box,
    Flex,
    Heading,
    Text,
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
                <Text
                    as="button"
                    color="#00cec9" // Teal color
                    fontSize="sm"
                    fontWeight="semibold"
                    cursor="pointer"
                    _hover={{ textDecoration: "underline" }}
                >
                    Mark all as read
                </Text>
            </Flex>


            {/* List */}
            <ListNotification />
        </Box>
    );
}
