"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Grid, GridItem, HStack, Icon, Image, Input, Text, VStack, Dialog, CloseButton, Portal, Flex, Avatar, Menu } from "@chakra-ui/react";
import { Link } from "@/i18n/navigation";
import { FiMessageCircle, FiChevronLeft, FiChevronRight, FiHeart, FiShare2, FiBookmark, FiSend } from "react-icons/fi";
import { FaXTwitter, FaFacebook, FaLine, FaLink } from "react-icons/fa6";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import articleApi from "@/apis/article";
import { userApi } from "@/apis/user";
import { dateFormat } from "@/libs/function";
import { useTranslations } from "next-intl";
import { toaster } from "@/components/chakra/toaster";
import { useForm } from "react-hook-form";

// Interfaces mapping to backend DTOs
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

type CommentNode = CommentParams & { children: CommentNode[] };

function buildTree(data: CommentParams[]): CommentNode[] {
    if (!data) return [];

    const map = new Map<string | number, CommentNode>();
    const normalizedData = data
        .map(c => ({
            ...c,
            id: c.id ?? (c as unknown as Record<string, unknown>)._id,
            children: []
        }))
        .filter(c => c.id != null) as CommentNode[];

    normalizedData.forEach(c => map.set(c.id, c));
    const roots: CommentNode[] = [];

    normalizedData.forEach(c => {
        const node = map.get(c.id);
        if (!node) return;

        if (c.parent_id) {
            const parent = map.get(c.parent_id);
            if (parent) {
                parent.children.push(node);
            } else {
                roots.push(node);
            }
        } else {
            roots.push(node);
        }
    });

    return roots;
}

// Comment Item Component
const CommentItem = ({
    node,
    depth = 0,
    users,
    expanded,
    toggle,
    onReply,
    t,
    isLoggedIn
}: {
    node: CommentNode;
    depth?: number;
    users: Record<number, { name: string; avatar?: string }>;
    expanded: Record<string | number, boolean>;
    toggle: (id: string | number) => void;
    onReply: (comment: CommentParams) => void;
    t: ReturnType<typeof useTranslations>;
    isLoggedIn: boolean;
}) => {
    const hasChildren = node.children.length > 0;
    const canShowChildren = hasChildren && depth < 2;
    const isOpenChild = !!expanded[node.id];
    const user = users[node.user_id] || node.user;

    return (
        <Flex gap={2} mt={depth === 0 ? 2 : 1.5} pl={depth ? 6 : 0}>
            <Link href={`/social/profile/${node.user_id}`}>
                <Avatar.Root size="xs" flexShrink={0} cursor="pointer" _hover={{ opacity: 0.8 }}>
                    <Avatar.Fallback name={user?.name || `U${node.user_id}`} />
                    {user?.avatar && <Avatar.Image src={user.avatar} />}
                </Avatar.Root>
            </Link>
            <VStack align="start" gap={0.5} flex={1} minW={0}>
                <Box bg="gray.50" px={3} py={1.5} borderRadius="xl" maxW="100%">
                    <Link href={`/social/profile/${node.user_id}`}>
                        <Text
                            as="span"
                            fontWeight="600"
                            fontSize="xs"
                            color="gray.700"
                            mr={2}
                            cursor="pointer"
                            _hover={{ color: "main", textDecoration: "underline" }}
                        >
                            {user?.name || `User ${node.user_id}`}
                        </Text>
                    </Link>
                    <Text as="span" fontSize="xs" color="gray.600" wordBreak="break-word">
                        {node.content}
                    </Text>
                </Box>
                <HStack gap={3} fontSize="2xs" color="gray.400" px={1}>
                    <Text>{node.created_at ? dateFormat(node.created_at) : 'Just now'}</Text>
                    {isLoggedIn && (
                        <Text fontWeight="600" cursor="pointer" _hover={{ color: "main" }} onClick={() => onReply(node)}>
                            {t('reply', { defaultValue: 'Reply' })}
                        </Text>
                    )}
                </HStack>

                {canShowChildren && !isOpenChild && (
                    <HStack gap={1} cursor="pointer" onClick={() => toggle(node.id)} px={1}>
                        <Box w={3} h="1px" bg="gray.300" />
                        <Text fontSize="2xs" color="gray.400" fontWeight="600" _hover={{ color: "main" }}>
                            {t('view_replies', { count: node.children.length, defaultValue: `View ${node.children.length} replies` })}
                        </Text>
                    </HStack>
                )}

                {(isOpenChild || depth > 0) && node.children.length > 0 && (
                    <Box w="full">
                        {node.children.map(ch => (
                            <CommentItem
                                key={ch.id}
                                node={ch}
                                depth={depth + 1}
                                users={users}
                                expanded={expanded}
                                toggle={toggle}
                                onReply={onReply}
                                t={t}
                                isLoggedIn={isLoggedIn}
                            />
                        ))}
                    </Box>
                )}
            </VStack>
        </Flex>
    );
};

// Share Menu Component
const ShareMenu = ({ articleId, title, t }: { articleId?: string; title?: string; t: ReturnType<typeof useTranslations> }) => {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/social/article/${articleId}` : '';
    const shareText = title || 'Check out this post!';

    const shareToTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    };

    const shareToFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    };

    const shareToLine = () => {
        window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`, '_blank');
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            toaster.create({ title: t('link_copied', { defaultValue: 'Link copied to clipboard!' }), type: 'success' });
        } catch {
            toaster.create({ title: t('copy_failed', { defaultValue: 'Failed to copy link' }), type: 'error' });
        }
    };

    return (
        <Menu.Root lazyMount unmountOnExit positioning={{ placement: "top-start" }}>
            <Menu.Trigger asChild>
                <Button variant="ghost" size="sm" p={0} minW="auto" h="auto" color="gray.600" _hover={{ color: "main" }}>
                    <Icon as={FiShare2} boxSize={5} />
                </Button>
            </Menu.Trigger>
            <Portal>
                <Menu.Positioner>
                    <Menu.Content bg="white" borderRadius="xl" shadow="xl" minW="180px" p={2} zIndex="popover">
                        <Menu.Item value="twitter" onClick={shareToTwitter} _hover={{ bg: "gray.50" }} borderRadius="lg" gap={3} cursor="pointer">
                            <Icon as={FaXTwitter} boxSize={4} />
                            <Text fontSize="sm">X (Twitter)</Text>
                        </Menu.Item>
                        <Menu.Item value="facebook" onClick={shareToFacebook} _hover={{ bg: "gray.50" }} borderRadius="lg" gap={3} cursor="pointer">
                            <Icon as={FaFacebook} boxSize={4} color="blue.600" />
                            <Text fontSize="sm">Facebook</Text>
                        </Menu.Item>
                        <Menu.Item value="line" onClick={shareToLine} _hover={{ bg: "gray.50" }} borderRadius="lg" gap={3} cursor="pointer">
                            <Icon as={FaLine} boxSize={4} color="green.500" />
                            <Text fontSize="sm">LINE</Text>
                        </Menu.Item>
                        <Menu.Item value="copy" onClick={copyLink} _hover={{ bg: "gray.50" }} borderRadius="lg" gap={3} cursor="pointer">
                            <Icon as={FaLink} boxSize={4} color="gray.600" />
                            <Text fontSize="sm">{t('copy_link', { defaultValue: 'Copy Link' })}</Text>
                        </Menu.Item>
                    </Menu.Content>
                </Menu.Positioner>
            </Portal>
        </Menu.Root>
    );
};

export function PopUpComment({
    isOpen,
    onClose,
    articleId,
    images,
    comments = [],
    refetch,
    author,
    caption,
    content,
    createdAt,
    likeCount
}: {
    isOpen: boolean;
    onClose: () => void;
    articleId?: string;
    images?: string[];
    comments?: CommentParams[];
    refetch?: () => void;
    author?: { name?: string; avatar?: string };
    caption?: string;
    content?: string;
    createdAt?: string;
    likeCount?: number;
}) {
    const { data: session } = useSession();
    const t = useTranslations('common');
    const queryClient = useQueryClient();

    const [expanded, setExpanded] = useState<Record<string | number, boolean>>({});
    const [replyingTo, setReplyingTo] = useState<CommentParams | null>(null);
    const [users, setUsers] = useState<Record<number, { name: string; avatar?: string }>>({});
    const [imgIndex, setImgIndex] = useState(0);
    const [localComments, setLocalComments] = useState<CommentParams[]>(comments);
    const [visibleCount, setVisibleCount] = useState(5); // Show 5 comments initially

    // Use react-hook-form for uncontrolled input to avoid lag
    const { register, handleSubmit, reset, setValue, setFocus } = useForm<{ comment: string }>({
        defaultValues: { comment: "" }
    });

    // Update local comments when prop changes
    useEffect(() => {
        console.log('[PopUpComment] Received comments prop:', comments?.length, comments);
        setLocalComments(comments);
    }, [comments]);

    const nodes = useMemo(() => {
        console.log('[PopUpComment] Building tree from localComments:', localComments?.length);
        return buildTree(localComments);
    }, [localComments]);

    // Limit displayed comments
    const displayedNodes = useMemo(() => nodes.slice(0, visibleCount), [nodes, visibleCount]);
    const hasMore = nodes.length > visibleCount;
    const remainingCount = nodes.length - visibleCount;

    const showMore = () => setVisibleCount(prev => Math.min(prev + 10, nodes.length));
    const showLess = () => setVisibleCount(5);

    const toggle = (id: string | number) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    // Fetch user data for comments
    useEffect(() => {
        if (localComments.length === 0) return;

        const fetchUsers = async () => {
            const userIds = Array.from(new Set(localComments.map(c => c.user_id)));
            const newUsers: Record<number, { name: string; avatar?: string }> = { ...users };
            let hasNew = false;

            for (const id of userIds) {
                if (!newUsers[id]) {
                    try {
                        const res = await userApi.getById(id) as { full_name?: string; name?: string; avatar?: string };
                        if (res) {
                            // API returns full_name, map to name for display
                            newUsers[id] = {
                                name: res.full_name || res.name || 'Anonymous',
                                avatar: res.avatar
                            };
                            hasNew = true;
                        }
                    } catch (error) {
                        console.error(`Failed to fetch user ${id}`, error);
                    }
                }
            }
            if (hasNew) setUsers(newUsers);
        };

        fetchUsers();
    }, [localComments, users]);

    const postCommentMutation = useMutation({
        mutationFn: async (commentContent: string) => {
            console.log('[Comment] Starting to post comment:', { articleId, commentContent, hasToken: !!session?.user?.accessToken });
            if (!session?.user?.accessToken || !articleId) {
                console.error('[Comment] Missing auth or articleId:', { hasToken: !!session?.user?.accessToken, articleId });
                throw new Error("Not authenticated or missing articleId");
            }
            const result = await articleApi.addComment(articleId, commentContent, session.user.accessToken, replyingTo?.id || undefined);
            console.log('[Comment] API response:', result);
            return result;
        },
        onSuccess: (data, variables) => {
            console.log('[Comment] Success:', data);
            // Add new comment to local state for immediate display
            if (data) {
                const newComment: CommentParams = {
                    id: data.id || Date.now().toString(),
                    content: variables,
                    parent_id: replyingTo?.id || null,
                    user_id: (session?.user as { id?: number })?.id || 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    user: {
                        id: (session?.user as { id?: number })?.id || 0,
                        name: session?.user?.name || 'You',
                        avatar: ''
                    }
                };
                setLocalComments(prev => [...prev, newComment]);
            }
            reset({ comment: "" });
            setReplyingTo(null);
            toaster.create({ title: t('comment_posted', { defaultValue: 'Comment posted!' }), type: 'success' });
            refetch?.();
            queryClient.invalidateQueries({ queryKey: ["articles-infinite"] });
        },
        onError: (error) => {
            console.error('[Comment] Error posting comment:', error);
            toaster.create({ title: t('comment_failed', { defaultValue: 'Failed to post comment' }), type: 'error' });
        }
    });

    const onSubmit = (data: { comment: string }) => {
        const commentText = data?.comment?.trim() || '';
        if (!commentText) {
            toaster.create({ title: t('empty_comment', { defaultValue: 'Please enter a comment' }), type: 'warning' });
            return;
        }
        if (!session?.user?.accessToken) {
            toaster.create({ title: t('login_required', { defaultValue: 'Please login first' }), type: 'warning' });
            return;
        }
        postCommentMutation.mutate(commentText);
    };

    const handleReply = (comment: CommentParams) => {
        setReplyingTo(comment);
        const userName = users[comment.user_id]?.name || comment.user?.name || `User ${comment.user_id}`;
        setValue("comment", `@${userName} `);
        setTimeout(() => setFocus("comment"), 100);
    };

    const cancelReply = () => {
        setReplyingTo(null);
        reset({ comment: "" });
    };

    const isLoggedIn = !!session?.user?.accessToken;
    const authorName = author?.name || t('anonymous', { defaultValue: 'Anonymous' });
    const displayContent = content || caption;

    return (
        <Dialog.Root open={isOpen} onOpenChange={(details) => { if (!details.open) onClose(); }} size="xl" placement="center" motionPreset="slide-in-bottom">
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.700" backdropFilter="blur(8px)" />
                <Dialog.Positioner>
                    <Dialog.Content
                        bg="white"
                        color="gray.800"
                        borderRadius="2xl"
                        overflow="hidden"
                        maxW="5xl"
                        w="95vw"
                        h={{ base: "90vh", md: "85vh" }}
                        p={0}
                        shadow="2xl"
                    >
                        <Box position="absolute" right={3} top={3} zIndex={10}>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton
                                    size="md"
                                    bg="gray.100"
                                    color="gray.600"
                                    borderRadius="full"
                                    _hover={{ bg: "gray.200" }}
                                    onClick={onClose}
                                />
                            </Dialog.CloseTrigger>
                        </Box>

                        <Grid templateColumns={{ base: "1fr", md: "1.3fr 1fr" }} h="full">
                            {/* Left: Image Carousel */}
                            <GridItem
                                bg="gray.900"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                position="relative"
                                h="full"
                            >
                                {images && images.length > 0 ? (
                                    <Image
                                        src={images[imgIndex]}
                                        alt="article"
                                        maxH="100%"
                                        maxW="100%"
                                        objectFit="contain"
                                    />
                                ) : (
                                    <VStack gap={2}>
                                        <Icon as={FiMessageCircle} boxSize={12} color="gray.600" />
                                        <Text color="gray.500" fontSize="sm">{t('no_image', { defaultValue: 'No Image' })}</Text>
                                    </VStack>
                                )}
                                {images && images.length > 1 && (
                                    <>
                                        <Button
                                            aria-label="Prev"
                                            variant="ghost"
                                            position="absolute"
                                            left={2}
                                            top="50%"
                                            transform="translateY(-50%)"
                                            onClick={() => setImgIndex((p) => (p - 1 + images.length) % images.length)}
                                            borderRadius="full"
                                            bg="whiteAlpha.800"
                                            color="gray.800"
                                            _hover={{ bg: "white" }}
                                            size="sm"
                                        >
                                            <Icon as={FiChevronLeft} boxSize={5} />
                                        </Button>
                                        <Button
                                            aria-label="Next"
                                            variant="ghost"
                                            position="absolute"
                                            right={2}
                                            top="50%"
                                            transform="translateY(-50%)"
                                            onClick={() => setImgIndex((p) => (p + 1) % images.length)}
                                            borderRadius="full"
                                            bg="whiteAlpha.800"
                                            color="gray.800"
                                            _hover={{ bg: "white" }}
                                            size="sm"
                                        >
                                            <Icon as={FiChevronRight} boxSize={5} />
                                        </Button>
                                        {/* Image indicators */}
                                        <HStack position="absolute" bottom={4} left="50%" transform="translateX(-50%)" gap={1}>
                                            {images.map((_, i) => (
                                                <Box
                                                    key={i}
                                                    w={2}
                                                    h={2}
                                                    borderRadius="full"
                                                    bg={i === imgIndex ? "white" : "whiteAlpha.500"}
                                                    cursor="pointer"
                                                    onClick={() => setImgIndex(i)}
                                                />
                                            ))}
                                        </HStack>
                                    </>
                                )}
                            </GridItem>

                            {/* Right: Details & Comments */}
                            <GridItem h="full" display="flex" flexDirection="column" bg="white">
                                {/* Header */}
                                <HStack p={4} borderBottom="1px solid" borderColor="gray.100" justify="space-between">
                                    <HStack gap={3}>
                                        <Avatar.Root size="md" ring="2px" ringColor="main" ringOffset="2px">
                                            <Avatar.Fallback name={authorName} />
                                            {author?.avatar && <Avatar.Image src={author.avatar} />}
                                        </Avatar.Root>
                                        <VStack align="start" gap={0}>
                                            <Text fontWeight="700" fontSize="md" color="gray.800">
                                                {authorName}
                                            </Text>
                                            <Text fontSize="xs" color="gray.500">
                                                {createdAt ? dateFormat(createdAt) : t('just_now', { defaultValue: 'Just now' })}
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </HStack>

                                {/* Caption/Content */}
                                {displayContent && (
                                    <Box px={4} py={3} borderBottom="1px solid" borderColor="gray.50">
                                        <Text fontSize="sm" color="gray.700" lineHeight="1.6" whiteSpace="pre-wrap">
                                            {displayContent}
                                        </Text>
                                    </Box>
                                )}

                                {/* Scrollable Comments - fills remaining space */}
                                <Box
                                    flex="1 1 0"
                                    minH={0}
                                    overflowY="auto"
                                    px={3}
                                    py={1}
                                    css={{
                                        '&::-webkit-scrollbar': { width: '4px' },
                                        '&::-webkit-scrollbar-track': { background: 'transparent' },
                                        '&::-webkit-scrollbar-thumb': { background: '#E2E8F0', borderRadius: '4px' },
                                    }}
                                >
                                    {displayedNodes.length > 0 ? (
                                        <>
                                            {displayedNodes.map(n => (
                                                <CommentItem
                                                    key={n.id}
                                                    node={n}
                                                    users={users}
                                                    expanded={expanded}
                                                    toggle={toggle}
                                                    onReply={handleReply}
                                                    t={t}
                                                    isLoggedIn={isLoggedIn}
                                                />
                                            ))}
                                            {hasMore && (
                                                <Box textAlign="center" py={2}>
                                                    <Text
                                                        as="button"
                                                        fontSize="xs"
                                                        color="main"
                                                        fontWeight="600"
                                                        cursor="pointer"
                                                        _hover={{ textDecoration: "underline" }}
                                                        onClick={showMore}
                                                    >
                                                        {t('show_more_comments', { count: remainingCount, defaultValue: `Show ${remainingCount} more comments` })}
                                                    </Text>
                                                </Box>
                                            )}
                                            {visibleCount > 5 && (
                                                <Box textAlign="center" py={1}>
                                                    <Text
                                                        as="button"
                                                        fontSize="2xs"
                                                        color="gray.400"
                                                        cursor="pointer"
                                                        _hover={{ color: "gray.600" }}
                                                        onClick={showLess}
                                                    >
                                                        {t('show_less', { defaultValue: 'Show less' })}
                                                    </Text>
                                                </Box>
                                            )}
                                        </>
                                    ) : (
                                        <VStack py={10} gap={2}>
                                            <Icon as={FiMessageCircle} boxSize={10} color="gray.300" />
                                            <Text color="gray.500" fontSize="sm" fontWeight="500">
                                                {t('no_comments_yet', { defaultValue: 'No comments yet.' })}
                                            </Text>
                                            <Text color="gray.400" fontSize="xs">
                                                {t('start_conversation', { defaultValue: 'Start the conversation.' })}
                                            </Text>
                                        </VStack>
                                    )}
                                </Box>

                                {/* Footer Actions */}
                                <Box p={4} borderTop="1px solid" borderColor="gray.100" bg="gray.50">
                                    <HStack justify="space-between" mb={3}>
                                        <HStack gap={4}>
                                            <HStack gap={1} color="gray.600">
                                                <Icon as={FiHeart} boxSize={5} />
                                                <Text fontWeight="700" fontSize="sm">{likeCount || 0}</Text>
                                            </HStack>
                                            <HStack gap={1} color="gray.600">
                                                <Icon as={FiMessageCircle} boxSize={5} />
                                                <Text fontWeight="700" fontSize="sm">{localComments.length}</Text>
                                            </HStack>
                                            <ShareMenu articleId={articleId} title={caption} t={t} />
                                        </HStack>
                                        <Icon as={FiBookmark} boxSize={5} color="gray.600" cursor="pointer" _hover={{ color: "main" }} />
                                    </HStack>

                                    {/* Reply indicator */}
                                    {replyingTo && (
                                        <HStack mb={2} px={3} py={2} bg="blue.50" borderRadius="lg" justify="space-between">
                                            <Text fontSize="xs" color="gray.600">
                                                {t('replying_to', { defaultValue: 'Replying to' })}{' '}
                                                <Text as="span" fontWeight="600" color="main">
                                                    @{users[replyingTo.user_id]?.name || replyingTo.user?.name}
                                                </Text>
                                            </Text>
                                            <CloseButton size="xs" onClick={cancelReply} />
                                        </HStack>
                                    )}

                                    {/* Input Area */}
                                    {isLoggedIn ? (
                                        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
                                            <HStack gap={2} bg="white" borderRadius="full" border="1px solid" borderColor="gray.200" px={4} py={2}>
                                                <Avatar.Root size="xs">
                                                    <Avatar.Fallback name={session?.user?.name || "U"} />
                                                    {(session?.user as any)?.avatar_url && <Avatar.Image src={(session?.user as any).avatar_url} />}
                                                </Avatar.Root>
                                                <Input
                                                    {...register("comment", { required: true })}
                                                    variant="flushed"
                                                    border="none"
                                                    placeholder={t('add_comment_placeholder', { defaultValue: 'Add a comment...' })}
                                                    fontSize="sm"
                                                    _placeholder={{ color: 'gray.400' }}
                                                    _focus={{ boxShadow: 'none' }}
                                                />
                                                <Button
                                                    type="submit"
                                                    size="sm"
                                                    borderRadius="full"
                                                    bg="main"
                                                    color="white"
                                                    px={4}
                                                    disabled={postCommentMutation.isPending}
                                                    loading={postCommentMutation.isPending}
                                                    _hover={{ bg: "blue.700" }}
                                                >
                                                    <Icon as={FiSend} />
                                                </Button>
                                            </HStack>
                                        </form>
                                    ) : (
                                        <HStack justify="center" py={2}>
                                            <Text fontSize="sm" color="gray.500">
                                                {t('login_to_comment', { defaultValue: 'Login to add a comment' })}
                                            </Text>
                                        </HStack>
                                    )}
                                </Box>
                            </GridItem>
                        </Grid>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}