"use client";
import { Box, HStack, VStack, Text, Image, Button, Icon, Avatar, Grid, useDisclosure } from "@chakra-ui/react";
import Link from "next/link";
import { FiMessageCircle, FiEye, FiThumbsUp, FiMapPin, FiCalendar, FiCloud, FiShare2, FiBookmark, FiArrowRight } from "react-icons/fi";
import type { IArticlePopular } from "@/types/response/article";
import { dateFormat } from "@/libs/function";
import { PopUpComment } from "./comments";

type ItemBlogProps = IArticlePopular & {
    href?: string;
    authorName?: string;
    authorAvatar?: string;
    tagLabel?: string;
    articleId?: string;
    comments?: any[];
}

function TagList({ tags }: { tags: string[] }) {
    if (!tags || tags.length === 0) return null;
    return (
        <HStack gap={2} flexWrap="wrap" mt={2}>
            {tags.map((tag, i) => (
                <Link key={i} href={`/social/explore?tag=${tag}`}>
                    <Text
                        color="blue.500"
                        cursor="pointer"
                        _hover={{ textDecoration: "underline" }}
                    >
                        #{tag}
                    </Text>
                </Link>
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
            <Box borderRadius="md" w="full" display="flex" justifyContent="center" alignItems="center" overflow="hidden" mb={3} paddingX={100}>
                <Image src={data[0]} alt={title} w="300px" h="auto" objectFit="cover" />
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
    const { images, title, tags, created_at, count_views, count_likes, count_comments, comments, user } = props;
    const { open, onOpen, onClose } = useDisclosure();
    const imageUrls = images?.map(img => img.image_url) || [];

    const content = (
        <Box
            bg="white"
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
                    <Text fontWeight="bold" color="black">{user?.name || "John Doe"}</Text>
                    <HStack gap={2} fontSize="xs" color="gray.600">
                        {created_at ? <Text>{dateFormat(created_at)}</Text> : null}
                    </HStack>
                </VStack>
                <HStack gap={2}>
                    <Button size="md" bg={'blackAlpha.300'} >
                        <FiBookmark size={25} color="black" />
                    </Button>
                    <Button size="md" bg={'blackAlpha.300'} >
                        <Text color={'black'}>View Tour</Text>
                        <FiArrowRight size={25} color="black" />
                    </Button>
                </HStack>
            </HStack>

            {/* Text */}
            <Text fontSize="md" color="black" mb={1}>
                {title}
            </Text>
            {tags && tags.length > 0 && <TagList tags={tags} />}
            <Box mb={3} />

            {images && images.length > 0 ? <ImagesGrid key={'das'} title={title} data={imageUrls} /> : null}

            {/* Footer options */}
            <VStack align="stretch" gap={4}>
                <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap={1} w="full">
                    {[
                        { key: 'city', label: 'City', icon: FiMapPin, subLabel: 'Ho Chi Minh City' },
                        { key: 'date', label: 'Date', icon: FiCalendar, subLabel: dateFormat(created_at) },
                        { key: 'weather', label: 'Weather', icon: FiCloud, subLabel: 'Sunny' },
                    ]?.map((it) => (
                        <Box
                            key={it.key}
                            bg="blackAlpha.100"
                            borderWidth={"1px"}
                            borderColor={'black.600'}
                            px={3}
                            py={2}
                            minH={16}
                        >
                            <HStack gap={2} align="center">
                                <Icon as={it.icon} color="blackAlpha.800" />
                                <Text color={'blackAlpha.900'} fontWeight={'semibold'}> {it.label}</Text>
                            </HStack>
                            <Text mt={1} color={'blackAlpha.800'} fontSize={'sm'} lineClamp={1}>{it.subLabel}</Text>
                        </Box>
                    ))}
                </Grid>
                <HStack gap={4}>
                    <Button size="xl" variant="ghost" gap={2} color={'blackAlpha.800'} _hover={{ color: 'blackAlpha.800' }}><Icon as={FiThumbsUp} />{count_likes ?? 0}</Button>
                    <Button size="xl" variant="ghost" gap={2} color={'blackAlpha.800'} _hover={{ color: 'blackAlpha.800' }} onClick={onOpen}><Icon as={FiMessageCircle} />{count_comments ?? 0}</Button>
                    <Button size="xl" variant="ghost" gap={2} color={'blackAlpha.800'} _hover={{ color: 'blackAlpha.800' }}><Icon as={FiEye} />{count_views ?? 0}</Button>
                </HStack>
            </VStack>
            <PopUpComment isOpen={open} onClose={onClose} images={imageUrls} comments={comments || []} />
        </Box>
    );

    return content;
}

export function ItemBlogLarge(props: ItemBlogProps) {
    const { images, title, content, tags, created_at, count_views, count_likes, count_comments, comments, href } = props;
    const imageUrls = images?.map(img => img.image_url) || [];

    const cardContent = (
        <Box bg="white" color="black" borderRadius="md" overflow="hidden" boxShadow="sm">
            {images && images.length > 0 ? (
                images.length === 1 ? (
                    <Box h="240px" w="full">
                        <Image src={imageUrls[0]} alt={title} w="full" h="full" objectFit="cover" />
                    </Box>
                ) : (
                    <Box p={4}>
                        <ImagesGrid title={title} data={imageUrls ?? []} />
                    </Box>
                )
            ) : null}
            <Box p={4}>
                <Text fontSize="xl" fontWeight="bold" mt={2}>{title}</Text>
                <Text fontSize="sm" color="gray.700" mt={1}>{content}</Text>
                <TagList tags={tags} />
                <HStack mt={3} justify="space-between">
                    <HStack gap={1}>
                        <Stat icon={FiEye} value={count_views} />
                        <Stat icon={FiThumbsUp} value={count_likes} />
                        <Stat icon={FiMessageCircle} value={count_comments} />
                    </HStack>
                    {created_at ? <Text fontSize="xs" color="gray.600">{created_at}</Text> : null}
                </HStack>
            </Box>
        </Box>
    );

    return cardContent;
}
