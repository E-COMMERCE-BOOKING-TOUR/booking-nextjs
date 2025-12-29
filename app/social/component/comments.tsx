"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Grid, GridItem, HStack, Icon, Image, Input, Text, VStack, Dialog, CloseButton, Portal, Flex, Avatar } from "@chakra-ui/react";
import { FiMessageCircle, FiChevronLeft, FiChevronRight, FiHeart, FiShare2, FiBookmark } from "react-icons/fi";
import { HiDotsHorizontal } from "react-icons/hi";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import articleApi from "@/apis/article";
import { userApi } from "@/apis/user";
import { dateFormat } from "@/libs/function";

// Intefaces mapping to backend DTOs
export interface CommentParams {
    id: string | number;
    content: string;
    parent_id: string | number | null;
    user_id: number;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        avatar: string;
    };
}
// Extended for tree structure
type CommentNode = CommentParams & { children: CommentNode[] };

function buildTree(data: CommentParams[]) {
    if (!data) return [];

    // Create a map for quick lookup
    const map = new Map<string | number, CommentNode>();

    // Normalize data and initialize map
    const normalizedData = data.map(c => ({
        ...c,
        id: c.id ?? (c as unknown as Record<string, unknown>)._id, // Handle both id and _id
        children: []
    })).filter(c => c.id != null) as CommentNode[];

    normalizedData.forEach(c => map.set(c.id, c));

    const roots: CommentNode[] = [];

    normalizedData.forEach(c => {
        const node = map.get(c.id);
        if (!node) return;

        if (c.parent_id) {
            // It's a child, add to parent's children
            const parent = map.get(c.parent_id);
            if (parent) {
                parent.children.push(node);
            } else {
                // Orphaned node logic (optional: treat as root or ignore)
                roots.push(node); // Fallback
            }
        } else {
            // It's a root
            roots.push(node);
        }
    });

    return roots;
}

export function PopUpComment({
    isOpen,
    onClose,
    articleId,
    images,
    comments = [],
    refetch,
    author,
    caption,
    createdAt,
    likeCount
}: {
    isOpen: boolean;
    onClose: () => void;
    articleId?: string;
    images?: string[];
    comments?: CommentParams[];
    refetch?: () => void;
    author?: { name: string; avatar?: string };
    caption?: string;
    createdAt?: string;
    likeCount?: number;
}) {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [expanded, setExpanded] = useState<Record<string | number, boolean>>({});
    const [text, setText] = useState("");
    const [replyingTo, setReplyingTo] = useState<CommentParams | null>(null);
    const [users, setUsers] = useState<Record<number, { name: string; avatar?: string }>>({});

    const nodes = useMemo(() => buildTree(comments), [comments]);

    const [imgIndex, setImgIndex] = useState(0);

    const toggle = (id: string | number) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    useEffect(() => {
        const fetchUsers = async () => {
            const userIds = Array.from(new Set(comments.map(c => c.user_id)));
            const newUsers: Record<number, { name: string; avatar?: string }> = { ...users };
            let hasNew = false;

            for (const id of userIds) {
                if (!newUsers[id]) {
                    try {
                        const res = await userApi.getById(id) as { name: string; avatar?: string };
                        if (res) {
                            newUsers[id] = res;
                            hasNew = true;
                        }
                    } catch (error: unknown) {
                        console.error(`Failed to fetch user ${id}`, error);
                    }
                }
            }

            if (hasNew) {
                setUsers(newUsers);
            }
        };

        if (comments.length > 0) {
            fetchUsers();
        }
    }, [comments, users]);


    const postCommentMutation = useMutation({
        mutationFn: async (content: string) => {
            if (!session?.user?.accessToken || !articleId) return;
            return await articleApi.addComment(articleId, content, session.user.accessToken, replyingTo?.id || undefined);
        },
        onSuccess: () => {
            setText("");
            setReplyingTo(null);
            console.log("Comment posted");
            if (refetch) refetch();
            queryClient.invalidateQueries({ queryKey: ["articles"] });
            queryClient.invalidateQueries({ queryKey: ["popular-articles-infinite"] });
            queryClient.invalidateQueries({ queryKey: ["popular-articles"] });
        },
        onError: () => {
            console.error("Failed to post comment");
        }
    });

    const handlePost = () => {
        if (!text.trim()) return;
        postCommentMutation.mutate(text);
    };

    const handleReply = (comment: CommentParams) => {
        setReplyingTo(comment);
        setText(`@${users[comment.user_id]?.name || comment.user_id} `);
    };

    const CommentItem = ({ node, depth = 0 }: { node: CommentNode; depth?: number }) => {
        const hasChildren = node.children.length > 0;
        const canShowChildren = hasChildren && depth < 2; // Limit nesting visual depth if too deep, but functionality remains
        const isOpenChild = !!expanded[node.id];
        const user = users[node.user_id];

        return (
            <Flex gap={3} mt={4} pl={depth ? 8 : 0}>
                <Avatar.Root size="xs" flexShrink={0}>
                    <Avatar.Fallback name={user?.name || node.user?.name || `U${node.user_id}`} />
                    {(user?.avatar || node.user?.avatar) && <Avatar.Image src={user?.avatar || node.user?.avatar} />}
                </Avatar.Root>
                <VStack align="start" gap={1} flex={1}>
                    <Text fontSize="sm" lineHeight="1.4">
                        <Text as="span" fontWeight="bold" mr={2} cursor="pointer" _hover={{ textDecoration: 'underline' }}>
                            {user?.name || node.user?.name || `User ${node.user_id}`}
                        </Text>
                        <Text as="span" color="gray.200">
                            {node.content}
                        </Text>
                    </Text>

                    <HStack gap={4} fontSize="xs" color="gray.500" mt={0.5}>
                        <Text>{node.created_at ? new Date(node.created_at).toLocaleDateString() : 'Just now'}</Text>
                        {/* Placeholder for likes logic on comment */}
                        {/* <Text fontWeight="semibold" cursor="pointer">12 likes</Text> */}
                        <Text fontWeight="semibold" cursor="pointer" onClick={() => handleReply(node)}>Reply</Text>
                    </HStack>

                    {/* View replies button */}
                    {canShowChildren && (
                        <Box mt={1}>
                            {!isOpenChild ? (
                                <HStack gap={2} cursor="pointer" onClick={() => toggle(node.id)}>
                                    <Box w={6} h="1px" bg="gray.500" />
                                    <Text fontSize="xs" color="gray.500" fontWeight="semibold">
                                        View replies ({node.children.length})
                                    </Text>
                                </HStack>
                            ) : null}
                        </Box>
                    )}

                    {/* Nested Replies */}
                    {(isOpenChild || depth > 0) && node.children.length > 0 && (
                        <Box w="full">
                            {node.children.map(ch => (
                                <CommentItem key={ch.id} node={ch} depth={depth + 1} />
                            ))}
                        </Box>
                    )}
                </VStack>
                {/* Like button for comment - placeholder interaction */}
                <Icon as={FiHeart} boxSize={3} color="gray.500" cursor="pointer" mt={1} />
            </Flex>
        );
    };


    return (
        <Dialog.Root open={isOpen} onOpenChange={(details) => { if (!details.open) onClose(); }} size="xl" placement="center" motionPreset="slide-in-bottom">
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.800" backdropFilter="blur(5px)" />
                <Dialog.Positioner>
                    <Dialog.Content
                        bg="black"
                        color="white"
                        borderRadius="xl" // Less rounded?
                        overflow="hidden"
                        maxW="6xl" // Wider to resemble desktop instagram
                        w="90vw"
                        h="85vh" // Fixed height
                        p={0}
                    >
                        {/* Close Button on top right outside? Or inside header. Instagram puts it outside often. 
                             We'll use internal one for simplicity or custom absolute one.
                         */}
                        <Box position="absolute" right={2} top={2} zIndex={10}>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton size="md" color="white" onClick={onClose} />
                            </Dialog.CloseTrigger>
                        </Box>

                        <Grid templateColumns={{ base: "1fr", md: "1.2fr 1fr" }} h="full">
                            {/* Left: Image Carousel */}
                            <GridItem bg="black" display="flex" alignItems="center" justifyContent="center" position="relative" h="full" borderRight="1px solid" borderColor="whiteAlpha.200">
                                {images && images.length > 0 ? (
                                    <Image src={images[imgIndex]} alt="article" maxH="100%" maxW="100%" objectFit="contain" />
                                ) : (
                                    <Box w="full" h="full" display="flex" alignItems="center" justifyContent="center">
                                        <Text color="gray.500">No Image</Text>
                                    </Box>
                                )}
                                {images && images.length > 1 && (
                                    <>
                                        <Button aria-label="Prev" variant="ghost" colorScheme="whiteAlpha" position="absolute" left={2} top="50%" transform="translateY(-50%)" onClick={() => setImgIndex((p) => (p - 1 + images.length) % images.length)} borderRadius="full" p={0}>
                                            <Icon as={FiChevronLeft} color="white" boxSize={6} />
                                        </Button>
                                        <Button aria-label="Next" variant="ghost" colorScheme="whiteAlpha" position="absolute" right={2} top="50%" transform="translateY(-50%)" onClick={() => setImgIndex((p) => (p + 1) % images.length)} borderRadius="full" p={0}>
                                            <Icon as={FiChevronRight} color="white" boxSize={6} />
                                        </Button>
                                    </>
                                )}
                            </GridItem>

                            {/* Right: Details & Comments */}
                            <GridItem h="full" display="flex" flexDirection="column" bg="black">
                                {/* Header */}
                                <HStack p={4} borderBottom="1px solid" borderColor="whiteAlpha.200" justify="space-between">
                                    <HStack gap={3}>
                                        <Avatar.Root size="sm">
                                            <Avatar.Fallback name={author?.name} />
                                            {author?.avatar && <Avatar.Image src={author.avatar} />}
                                        </Avatar.Root>
                                        <Text fontWeight="bold" fontSize="sm">{author?.name || "Unknown"}</Text>
                                        {/* <Text fontSize="sm" color="blue.400" fontWeight="semibold" cursor="pointer">• Follow</Text> */}
                                    </HStack>
                                    <Icon as={HiDotsHorizontal} cursor="pointer" />
                                </HStack>

                                {/* Scrollable Content */}
                                <Box flex={1} overflowY="auto" p={4} css={{ '&::-webkit-scrollbar': { display: 'none' } }}>
                                    {/* Author Caption */}
                                    {caption && (
                                        <Flex gap={3} mb={4}>
                                            <Avatar.Root size="sm" flexShrink={0}>
                                                <Avatar.Fallback name={author?.name} />
                                                {author?.avatar && <Avatar.Image src={author.avatar} />}
                                            </Avatar.Root>
                                            <VStack align="start" gap={1}>
                                                <Text fontSize="sm" lineHeight="1.4">
                                                    <Text as="span" fontWeight="bold" mr={2}>{author?.name}</Text>
                                                    <Text as="span">{caption}</Text>
                                                </Text>
                                                <Text fontSize="xs" color="gray.500">{createdAt ? dateFormat(createdAt) : 'Just now'}</Text>
                                            </VStack>
                                        </Flex>
                                    )}

                                    {/* Comments Tree */}
                                    {nodes.length > 0 ? (
                                        nodes.map(n => (
                                            <CommentItem key={n.id} node={n} />
                                        ))
                                    ) : (
                                        !caption && (
                                            <Box py={10} textAlign="center">
                                                <Text color="gray.500" fontSize="sm">No comments yet.</Text>
                                                <Text color="gray.500" fontSize="xs">Start the conversation.</Text>
                                            </Box>
                                        )
                                    )}
                                </Box>

                                {/* Footer Actions */}
                                <Box p={4} borderTop="1px solid" borderColor="whiteAlpha.200">
                                    <HStack justify="space-between" mb={3} fontSize="2xl">
                                        <HStack gap={4}>
                                            <Icon as={FiHeart} cursor="pointer" _hover={{ color: 'gray.400' }} />
                                            <Icon as={FiMessageCircle} cursor="pointer" _hover={{ color: 'gray.400' }} />
                                            <Icon as={FiShare2} cursor="pointer" _hover={{ color: 'gray.400' }} />
                                        </HStack>
                                        <Icon as={FiBookmark} cursor="pointer" _hover={{ color: 'gray.400' }} />
                                    </HStack>
                                    <Text fontWeight="bold" fontSize="sm" mb={1}>{likeCount || 0} likes</Text>
                                    <Text fontSize="xs" color="gray.500" textTransform="uppercase" mb={4}>{createdAt ? dateFormat(createdAt) : 'Just now'}</Text>

                                    {/* Input Area */}
                                    <HStack gap={2} pt={2} borderTop="1px solid" borderColor="whiteAlpha.100">
                                        {/* Emoji Icon placeholder */}
                                        {/* <Icon as={MdTagFaces} color="white" boxSize={6} cursor="pointer" /> */}

                                        <Input
                                            variant="outline"
                                            border="none"
                                            placeholder="Add a comment..."
                                            value={text}
                                            onChange={e => setText(e.target.value)}
                                            color="white"
                                            fontSize="sm"
                                            p={0}
                                            _placeholder={{ color: 'gray.500' }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !postCommentMutation.isPending) handlePost();
                                            }}
                                        />
                                        <Button
                                            variant="plain"
                                            color="blue.400"
                                            fontWeight="semibold"
                                            size="sm"
                                            p={0}
                                            onClick={handlePost}
                                            disabled={!text.trim() || postCommentMutation.isPending}
                                            loading={postCommentMutation.isPending}
                                            _hover={{ color: 'blue.300', bg: 'transparent' }}
                                            _disabled={{ color: 'blue.800', cursor: 'not-allowed' }}
                                        >
                                            Post
                                        </Button>
                                    </HStack>
                                </Box>
                            </GridItem>
                        </Grid>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}