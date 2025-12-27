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
            <Box borderRadius="md" w="full" display="flex" justifyContent="center" alignItems="center" overflow="hidden" mb={3}>
                <Image src={data[0]} alt={title} w="full" h="300px" objectFit="cover" />
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
            borderRadius="2xl"
            p={6}
            shadow="sm"
            border="1px solid"
            borderColor="gray.100"
            w={'full'}
            justifyContent={'center'}
            alignItems={'center'}
            gap={5}
            mx={3}
        >
            {/* Header */}
            <HStack align="center" gap={4} mb={4} justifyContent={'center'}>
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
                    <Text fontWeight="bold" color="black" fontSize="md">{user?.name || "John Doe"}</Text>
                    <HStack gap={2} fontSize="xs" color="gray.500">
                        {created_at ? <Text>{dateFormat(created_at)}</Text> : null}
                    </HStack>
                </VStack>
                {/* <HStack gap={2}>
                    <Button size="md" bg={'blackAlpha.300'} >
                        <FiBookmark size={25} color="black" />
                    </Button>
                    <Button size="md" bg={'blackAlpha.300'} >
                        <Text color={'black'}>View Tour</Text>
                        <FiArrowRight size={25} color="black" />
                    </Button>
                </HStack> */}
            </HStack>

            {/* Text */}
            <Text fontSize="lg" fontWeight="600" color="black" mb={2}>
                {title}
            </Text>
            {tags && tags.length > 0 && <TagList tags={tags} />}
            <Box mb={4} />

            {images && images.length > 0 ? (
                <Box borderRadius="xl" overflow="hidden" mb={5}>
                    <ImagesGrid key={'das'} title={title} data={imageUrls} />
                </Box>
            ) : null}

            {/* Stats Grid */}
            <Grid templateColumns={{ base: "repeat(3, 1fr)" }} gap={3} w="full" mb={5}>
                {[
                    { key: 'city', label: 'LOCATION', value: 'Ho Chi Minh', icon: FiMapPin },
                    { key: 'date', label: 'DATE', value: dateFormat(created_at), icon: FiCalendar },
                    { key: 'weather', label: 'WEATHER', value: 'Sunny', icon: FiCloud },
                ]?.map((it) => (
                    <Box
                        key={it.key}
                        bg="gray.50"
                        borderRadius="lg"
                        p={3}
                        textAlign="center"
                    >
                        <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.5px" mb={1}>{it.label}</Text>
                        <Text fontSize="sm" fontWeight="600" color="gray.800" lineClamp={1}>{it.value}</Text>
                    </Box>
                ))}
            </Grid>

            {/* Actions */}
            <HStack gap={6} pt={4} borderTop="1px solid" borderColor="gray.100">
                <Button size="sm" variant="ghost" color="gray.500" _hover={{ color: "blue.500" }} px={0} gap={2}>
                    <Icon as={FiThumbsUp} /> <Text>{count_likes ?? 0} Likes</Text>
                </Button>
                <Button size="sm" variant="ghost" color="gray.500" _hover={{ color: "blue.500" }} px={0} gap={2} onClick={onOpen}>
                    <Icon as={FiMessageCircle} /> <Text>{count_comments ?? 0} Comments</Text>
                </Button>
                <Button size="sm" variant="ghost" color="gray.500" _hover={{ color: "blue.500" }} px={0} gap={2}>
                    <Icon as={FiShare2} /> <Text>Share</Text>
                </Button>
            </HStack>
            <PopUpComment
                isOpen={open}
                onClose={onClose}
                images={imageUrls}
                comments={comments || []}
                articleId={props.id ? props.id.toString() : undefined}
                author={{ name: user?.name || "Unknown", avatar: user?.avatar ?? undefined }}
                caption={props.content}
                createdAt={created_at}
                likeCount={count_likes}
            />
        </Box>
    );

    return content;
}

export function ItemBlogLarge(props: ItemBlogProps) {
    const { images, title, content, tags, created_at, count_views, count_likes, count_comments, comments, href } = props;
    const imageUrls = images?.map(img => img.image_url) || [];

    const cardContent = (
        <Box bg="white" color="black" borderRadius="xl" overflow="hidden" shadow="sm" border="1px solid" borderColor="gray.100">
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
