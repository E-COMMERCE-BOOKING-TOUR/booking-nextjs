"use client";
import NextLink from "next/link";
import { Box, HStack, VStack, Text, Image, Badge, Button, Icon, Avatar, Grid, IconButton, useDisclosure } from "@chakra-ui/react";
import { FiMessageCircle, FiEye, FiThumbsUp, FiMapPin, FiCalendar, FiClock, FiCloud, FiShare2, FiBookmark, FiArrowRight } from "react-icons/fi";
import type { IArticlePopular } from "@/types/response/article";
import { ArrowRight, Bookmark } from "lucide-react";
import { dateFormat } from "@/libs/function";
import { PopUpComment } from "./comments";

type ItemBlogProps = IArticlePopular & {
    href?: string;
    authorName?: string;
    authorAvatar?: string;
    tagLabel?: string;
    images?: string[];
    tourId?: string;
}

function TagList({ tags }: { tags: string[] }) {
    return (
        <HStack gap={2} flexWrap="wrap">
            {tags.map((tag, i) => (
                <Badge key={i} colorScheme="blue" variant="subtle" borderRadius="full" px={3} py={1} fontSize="xs">
                    {tag}
                </Badge>
            ))}
        </HStack>
    );
}

function Stat({ icon, value }: { icon: React.ComponentType; value?: number }) {
    return (
        <HStack gap={1} color="whiteAlpha.800" fontSize="xs">
            <Icon as={icon} />
            <Text>{typeof value === "number" ? value : 0}</Text>
        </HStack>
    );
}

const ImagesGrid = ({ data, title }: { data: string[]; title: string }) => {
    const n = data.length;
    if (n === 1) {
        return (
            <Box borderRadius="md" overflow="hidden" mb={3} paddingX={100}>
                <Image src={data[0]} alt={title} w="full" h="auto" objectFit="cover" />
            </Box>
        );
    }
    if (n === 2) {
        return (
            <Grid templateColumns="1fr 1fr" gap={1} borderRadius="md" overflow="hidden" mb={3}>
                <Box>
                    <Image src={data[0]} alt={title} w="full" h="300px" objectFit="cover" />
                </Box>
                <Box>
                    <Image src={data[1]} alt={title} w="full" h="300px" objectFit="cover" />
                </Box>
            </Grid>
        );
    }
    if (n === 3) {
        return (
            <Grid templateColumns="2fr 1fr" gap={2} borderRadius="md" overflow="hidden" mb={3}>
                <Box>
                    <Image src={data[0]} alt={title} w="full" h="400px" objectFit="cover" />
                </Box>
                <VStack gap={2}>
                    <Box w="full">
                        <Image src={data[1]} alt={title} w="full" h="198px" objectFit="cover" />
                    </Box>
                    <Box w="full">
                        <Image src={data[2]} alt={title} w="full" h="198px" objectFit="cover" />
                    </Box>
                </VStack>
            </Grid>
        );
    }
    const shown = data.slice(0, 4);
    const extra = data.length - shown.length;
    return (
        <Grid templateColumns="1fr 1fr" gap={1} borderRadius="md" overflow="hidden" mb={3}>
            {shown.map((src, i) => (
                <Box key={i} position="relative">
                    <Image src={src} alt={title} w="full" h="200px" objectFit="cover" />
                    {extra > 0 && i === 3 ? (
                        <Box position="absolute" inset={0} bg="blackAlpha.600" display="flex" alignItems="center" justifyContent="center">
                            <Text fontSize="2xl" fontWeight="bold" color="white">+{extra}</Text>
                        </Box>
                    ) : null}
                </Box>
            ))}
        </Grid>
    );
};

export default function ItemBlog(props: ItemBlogProps) {
    const { images, title, tags, timestamp, views, likes, comments, href, user, id } = props;
    const { open, onOpen, onClose } = useDisclosure();

    const content = (
        <Box
            bg="blackAlpha.300"
            color="black"
            borderRadius="md"
            p={4}
            boxShadow="sm"
            w={'full'}
            justifyContent={'center'}
            alignItems={'center'}
            gap={5}
        >
            {/* Header */}
            <HStack align="center" gap={5} mb={2} justifyContent={'center'}>
                {user?.avatar ? (
                    <Avatar.Root size="md">
                        <Avatar.Fallback name={user.name} />
                        <Avatar.Image src={user.avatar} />
                    </Avatar.Root>
                ) : (
                    <Avatar.Root size="md">
                        <Avatar.Fallback name={user?.name || "Unknown"} />
                        {user?.avatar ? <Avatar.Image src={user.avatar} /> : null}
                    </Avatar.Root>
                )}
                <VStack align="start" gap={0} flex={1}>
                    <Text fontWeight="bold" color="white">{user?.name || "John Doe"}</Text>
                    <HStack gap={2} fontSize="xs" color="gray.600">
                        {timestamp ? <Text>{dateFormat(timestamp)}</Text> : null}
                    </HStack>
                </VStack>
                <HStack gap={2}>
                    <Button size="md" bg={'whiteAlpha.300'} borderWidth={1} borderColor={'white'}>
                        <FiBookmark size={25} color="white" />
                    </Button>
                    <Button size="md" bg={'whiteAlpha.300'} borderWidth={1} borderColor={'white'}>
                        <Text color={'white'}>View Tour</Text>
                        <FiArrowRight size={25} color="white" />
                    </Button>
                </HStack>
            </HStack>

            {/* Text */}
            <Text fontSize="md" color="white" mb={3}>
                {title}
            </Text>

            {images && images.length > 0 ? <ImagesGrid key={'das'} title={title} data={images} /> : null}

            {/* Footer options */}
            <VStack align="stretch" gap={4}>
                <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap={0} w="full">
                    {[
                        { key: 'city', label: 'City', icon: FiMapPin, subLabel: 'Ho Chi Minh City' },
                        { key: 'date', label: 'Date', icon: FiCalendar, subLabel: dateFormat(timestamp) },
                        { key: 'weather', label: 'Weather', icon: FiCloud, subLabel: 'Sunny' },
                    ]?.map((it) => (
                        <Box
                            key={it.key}
                            bg="blackAlpha.400"
                            borderWidth={"1px"}
                            borderColor={'whiteAlpha.600'}
                            px={3}
                            py={2}
                            minH={16}
                        >
                            <HStack gap={2} align="center">
                                <Icon as={it.icon} color="whiteAlpha.800" />
                                <Text color={'whiteAlpha.900'} fontWeight={'semibold'}> {it.label}</Text>
                            </HStack>
                            <Text mt={1} color={'whiteAlpha.800'} fontSize={'sm'} lineClamp={1}>{it.subLabel}</Text>
                        </Box>
                    ))}
                </Grid>
                <HStack gap={4}>
                    <Button size="xl" variant="ghost" gap={2} color={'whiteAlpha.800'} _hover={{color: 'blackAlpha.800'}}><Icon as={FiThumbsUp}/>{likes ?? 0}</Button>
                    <Button size="xl" variant="ghost" gap={2} color={'whiteAlpha.800'} _hover={{color: 'blackAlpha.800'}} onClick={onOpen}><Icon as={FiMessageCircle}/>{comments ?? 0}</Button>
                    <Button size="xl" variant="ghost" gap={2} color={'whiteAlpha.800'} _hover={{color: 'blackAlpha.800'}}><Icon as={FiShare2}/>0</Button>
                </HStack>
            </VStack>
            <PopUpComment isOpen={open} onClose={onClose} tourId={Number(id)} images={images} />
        </Box>
    );

    return content;
}

ItemBlog.large = function Large(props: ItemBlogProps) {
    const { images, title, description, tags, timestamp, views, likes, comments, href } = props;

    const content = (
        <Box bg="white" color="black" borderRadius="md" overflow="hidden" boxShadow="sm">
            {images && images.length > 0 ? (
                images.length === 1 ? (
                    <Box h="240px" w="full">
                        <Image src={images[0]} alt={title} w="full" h="full" objectFit="cover" />
                    </Box>
                ) : (
                    <Box p={4}>
                        <ImagesGrid title={title} data={images ?? []} />
                    </Box>
                )
            ) : null}
            <Box p={4}>
                <TagList tags={tags} />
                <Text fontSize="xl" fontWeight="bold" mt={2}>{title}</Text>
                <Text fontSize="sm" color="gray.700" mt={1}>{description}</Text>
                <HStack mt={3} justify="space-between">
                    <HStack gap={1}>
                        <Stat icon={FiEye} value={views} />
                        <Stat icon={FiThumbsUp} value={likes} />
                        <Stat icon={FiMessageCircle} value={comments} />
                    </HStack>
                    {timestamp ? <Text fontSize="xs" color="gray.600">{timestamp}</Text> : null}
                </HStack>
            </Box>
        </Box>
    );

    return content;
}
