import {
    Box,
    Flex,
    Text,
    Button,
    VStack,
    HStack,
    Avatar,
    Icon,
} from '@chakra-ui/react';
import { FaCheck, FaHeart, FaCommentDots, FaUserPlus, FaBell } from 'react-icons/fa6';
import { FiFileText } from "react-icons/fi";

export const ItemNotification = ({ type, data }: { type: string, data: { user: string, content: string, time: string, [key: string]: unknown } }) => {
    let bg = 'white';
    let iconComp = FaBell;
    const iconColor = 'white';
    let iconBg = 'gray.500';

    if (type === 'booking') {
        bg = 'blue.50';
        iconComp = FaCheck;
        iconBg = 'green.500';
    } else if (type === 'like' || type === 'reward') {
        bg = type === 'reward' ? 'orange.50' : 'white';
        iconComp = FaHeart;
        iconBg = 'red.500';
    } else if (type === 'comment') {
        bg = 'white';
        iconComp = FaCommentDots;
        iconBg = 'blue.500';
    } else if (type === 'follow') {
        bg = 'white';
        iconComp = FaUserPlus;
        iconBg = 'purple.500';
    } else if (type === 'welcome' || type === 'update') {
        bg = 'blue.50';
        iconComp = FaBell;
        iconBg = 'blue.400';
    }

    return (
        <Box
            w="full"
            bg={bg}
            p={4}
            borderRadius="xl"
            position="relative"
            mb={3}
        >
            <Flex gap={4} align="flex-start">
                <Box position="relative">
                    <Avatar.Root size="md">
                        <Avatar.Fallback name={String(data.user)} />
                        {data.avatar ? <Avatar.Image src={String(data.avatar)} /> : null}
                    </Avatar.Root>
                    <Box
                        position="absolute"
                        bottom="-2px"
                        right="-2px"
                        bg={iconBg}
                        borderRadius="full"
                        p={1}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        border="2px solid white"
                    >
                        <Icon as={iconComp} color={iconColor} boxSize={3} />
                    </Box>
                </Box>

                <VStack align="start" gap={1} flex={1}>
                    <Text fontSize="sm" color="gray.800">
                        <Text as="span" fontWeight="bold">{data.user}</Text>
                        {' '}{data.content}
                    </Text>

                    {type === 'booking' && (
                        <HStack mt={2} gap={4}>
                            <Button
                                size="sm"
                                bg="#00cec9"
                                color="white"
                                _hover={{ bg: "#00b5b0" }}
                                borderRadius="md"
                                fontWeight="semibold"
                            >
                                View Ticket
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                color="gray.600"
                            >
                                <Icon as={FiFileText} />
                                Invoice
                            </Button>
                        </HStack>
                    )}

                    {type === 'comment' && (
                        <Button
                            size="sm"
                            variant="plain"
                            color="gray.500"
                            fontWeight="semibold"
                            p={0}
                            h="auto"
                            _hover={{ color: "gray.700" }}
                        >
                            Reply
                        </Button>
                    )}

                    {type === 'follow' && (
                        <Button
                            size="sm"
                            bg="#00cec9"
                            color="white"
                            _hover={{ bg: "#00b5b0" }}
                            borderRadius="md"
                            fontWeight="semibold"
                            mt={1}
                        >
                            Follow Back
                        </Button>
                    )}

                    <Text fontSize="xs" color="gray.500" mt={1}>
                        {data.time}
                    </Text>
                </VStack>
                {/* Blue dot for unread */}
                <Box
                    w={2}
                    h={2}
                    bg="#00cec9"
                    borderRadius="full"
                    position="absolute"
                    right={4}
                    top="50%"
                    transform="translateY(-50%)"
                />
            </Flex>
        </Box>
    );
};
