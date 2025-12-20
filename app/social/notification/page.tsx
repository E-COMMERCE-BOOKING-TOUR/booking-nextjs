'use client';

import {
    Box,
    Flex,
    Heading,
    Text,
    Icon,
    IconButton,
    VStack,
    Tabs,
} from '@chakra-ui/react';
import { IoSettingsOutline } from 'react-icons/io5';
import { HiDotsHorizontal } from 'react-icons/hi';
import ListNotification from './component/ListNotificaion';

export default function NotificationsPage() {
    return (
        <Box w="full" bg="transparent" color="white">
            {/* Header */}
            <Flex
                justify="space-between"
                align="center"
                h={"50px"}
                px={4}
                py={3}
                borderBottom="1px solid"
                borderColor="whiteAlpha.200"
            >
                <Heading as="h1" size="xl" fontWeight="bold" color={'gray'}>
                    Notifications
                </Heading>
                <IconButton
                    aria-label="Settings"
                    variant="ghost"
                    colorScheme="whiteAlpha"
                    size="sm"
                    fontSize="20px"
                    _hover={{ bg: 'whiteAlpha.200' }}
                >
                    <IoSettingsOutline />
                </IconButton>
            </Flex>
            <ListNotification />
        </Box>
    );
}
