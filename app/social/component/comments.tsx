"use client";
import { useEffect, useMemo, useState } from "react";
import { Box, Button, Grid, GridItem, HStack, Icon, Image, Input, Text, VStack, Dialog, CloseButton, Portal, Spinner } from "@chakra-ui/react";
import { FiMessageCircle, FiSend, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import articleApi from "@/apis/article";
import { userApi } from "@/apis/user";
// import { toaster } from "@/components/ui/toaster";

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

function buildTree(data: any[]) {
    if (!data) return [];

    // Create a map for quick lookup
    const map = new Map<string | number, CommentNode>();

    // Normalize data and initialize map
    const normalizedData = data.map(c => ({
        ...c,
        id: c.id ?? c._id, // Handle both id and _id
        children: []
    })).filter(c => c.id != null);

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
    refetch
}: {
    isOpen: boolean;
    onClose: () => void;
    articleId?: string;
    images?: string[];
    comments?: CommentParams[];
    refetch?: () => void;
}) {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [expanded, setExpanded] = useState<Record<string | number, boolean>>({});
    const [text, setText] = useState("");
    const [replyingTo, setReplyingTo] = useState<CommentParams | null>(null);
    const [users, setUsers] = useState<Record<number, any>>({});

    const nodes = useMemo(() => buildTree(comments), [comments]);

    const [imgIndex, setImgIndex] = useState(0);

    const toggle = (id: string | number) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    useEffect(() => {
        const fetchUsers = async () => {
            const userIds = Array.from(new Set(comments.map(c => c.user_id)));
            const newUsers: Record<number, any> = { ...users };
            let hasNew = false;

            for (const id of userIds) {
                if (!newUsers[id]) {
                    try {
                        const res = await userApi.getById(id);
                        if (res) {
                            newUsers[id] = res;
                            hasNew = true;
                        }
                    } catch (error) {
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
    }, [comments]);


    const postCommentMutation = useMutation({
        mutationFn: async (content: string) => {
            if (!session?.user?.accessToken || !articleId) return;
            return await articleApi.addComment(articleId, content, session.user.accessToken, replyingTo?.id || undefined);
        },
        onSuccess: () => {
            setText("");
            setReplyingTo(null);
            // toaster.create({ description: "Comment posted", type: "success" });
            console.log("Comment posted");
            if (refetch) refetch();
            // Invalidate queries if needed, mainly the article detail or list
            queryClient.invalidateQueries({ queryKey: ["articles"] });
            queryClient.invalidateQueries({ queryKey: ["popular-articles-infinite"] });
            queryClient.invalidateQueries({ queryKey: ["popular-articles"] });
        },
        onError: () => {
            // toaster.create({ description: "Failed to post comment", type: "error" });
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
        const canShowChildren = hasChildren && depth < 1;
        const isOpenChild = !!expanded[node.id];
        const user = users[node.user_id];

        return (
            <Box pl={depth ? 8 : 0} py={3} borderBottomWidth={depth ? 0 : 1} borderColor="whiteAlpha.200">
                <HStack align="start" gap={3} paddingLeft={4}>
                    <Box
                        bg="whiteAlpha.300"
                        rounded="full"
                        minW={8}
                        minH={8}
                        overflow="hidden"
                    >
                        {/* Avatar logic: no avatar from DB as per requirement, but if user object has it we use it, else placeholder/API result */}
                        {(user?.avatar || node.user?.avatar) && <Image src={user?.avatar || node.user?.avatar} alt={user?.name || node.user?.name} w="full" h="full" objectFit="cover" />}
                    </Box>
                    <VStack align="start" gap={1} flex={1}>
                        <Text color="white" fontSize="sm" fontWeight={"bold"}>{user?.name || node.user?.name || `User ${node.user_id}`}</Text>
                        <Text color="gray.300" fontSize="sm">
                            {node.content}
                        </Text>
                        <HStack gap={3} color="whiteAlpha.700" fontSize="xs">
                            <Text>{new Date(node.created_at).toLocaleDateString()}</Text>
                            <Text cursor="pointer" _hover={{ textDecoration: 'underline', color: 'blue.300' }} onClick={() => handleReply(node)}>Reply</Text>
                            {canShowChildren ? (
                                <Button variant="ghost" color="white" size="xs" onClick={() => toggle(node.id)} h="auto" p={0} _hover={{ bg: 'transparent', textDecoration: 'underline' }}>
                                    {isOpenChild ? "Hide replies" : `View ${node.children.length} replies`}
                                </Button>
                            ) : null}
                        </HStack>
                        {canShowChildren && isOpenChild ? (
                            <VStack align="stretch" gap={0} mt={2}>
                                {node.children.map(ch => (
                                    <CommentItem key={ch.id} node={ch} depth={depth + 1} />
                                ))}
                            </VStack>
                        ) : null}
                    </VStack>
                </HStack>
            </Box>
        );
    };


    return (
        <Dialog.Root open={isOpen} onOpenChange={(details) => { if (!details.open) onClose(); }} size="lg" placement="center" motionPreset="slide-in-bottom">
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content bg="black" color="white" borderRadius="xl" overflow="hidden" maxW="4xl" w="95vw">
                        <Dialog.Header>
                            <HStack justify="space-between" px={4} py={2}>
                                <Text fontWeight="semibold" fontSize="lg">Comments ({comments.length})</Text>
                                <Dialog.CloseTrigger asChild>
                                    <CloseButton size="sm" onClick={onClose} />
                                </Dialog.CloseTrigger>
                            </HStack>
                        </Dialog.Header>
                        <Dialog.Body p={0}>
                            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} h="full">
                                <GridItem>
                                    <Box
                                        bg="black"
                                        w="full"
                                        h={{ base: "40vh", md: "70vh" }}
                                        position="relative"
                                        display={"flex"}
                                        justifyContent={"center"}
                                        alignItems={"center"}
                                    >
                                        {images && images.length > 0 ? (
                                            <Image src={images[imgIndex]} alt="article" maxH="full" maxW="full" objectFit="contain" />
                                        ) : (
                                            <Box w="full" h="full" bg="whiteAlpha.200" display="flex" alignItems="center" justifyContent="center">
                                                <Text color="gray.500">No Image</Text>
                                            </Box>
                                        )}
                                        {images && images.length > 1 ? (
                                            <>
                                                <Button aria-label="Prev" variant="ghost" colorScheme="whiteAlpha" position="absolute" left={2} top="50%" transform="translateY(-50%)" onClick={() => setImgIndex((p) => (p - 1 + images.length) % images.length)}>
                                                    <Icon as={FiChevronLeft} color="white" boxSize={6} />
                                                </Button>
                                                <Button aria-label="Next" variant="ghost" colorScheme="whiteAlpha" position="absolute" right={2} top="50%" transform="translateY(-50%)" onClick={() => setImgIndex((p) => (p + 1) % images.length)}>
                                                    <Icon as={FiChevronRight} color="white" boxSize={6} />
                                                </Button>
                                            </>
                                        ) : null}
                                    </Box>
                                </GridItem>
                                <GridItem borderLeftWidth={{ base: 0, md: 1 }} borderColor="whiteAlpha.200" h={{ base: "40vh", md: "70vh" }} display="flex" flexDirection="column">
                                    <VStack align="stretch" flex={1} overflowY="auto" p={2}>
                                        {nodes.length > 0 ? (
                                            nodes.map(n => (
                                                <CommentItem key={n.id} node={n} />
                                            ))
                                        ) : (
                                            <Box py={10} textAlign="center">
                                                <Text color="gray.500">No comments yet. Be the first to say something!</Text>
                                            </Box>
                                        )}
                                    </VStack>
                                    <Box p={3} borderTopWidth={1} borderColor="whiteAlpha.200" bg="black">
                                        {replyingTo && (
                                            <HStack mb={2} bg="whiteAlpha.200" p={2} borderRadius="md" justify="space-between">
                                                <Text fontSize="xs" color="gray.300">Replying to {users[replyingTo.user_id]?.name || replyingTo.user_id}</Text>
                                                <Icon as={FiX} cursor="pointer" onClick={() => { setReplyingTo(null); setText(""); }} />
                                            </HStack>
                                        )}
                                        <HStack gap={3}>
                                            <Icon as={FiMessageCircle} />
                                            <Input
                                                placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
                                                value={text}
                                                onChange={e => setText(e.target.value)}
                                                color="white"
                                                bg="whiteAlpha.100"
                                                border="none"
                                                _focus={{ ring: 1, ringColor: "blue.500" }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !postCommentMutation.isPending) {
                                                        handlePost();
                                                    }
                                                }}
                                            />
                                            <Button
                                                colorScheme="blue"
                                                onClick={handlePost}
                                                disabled={postCommentMutation.isPending || !text.trim()}
                                                loading={postCommentMutation.isPending}
                                            >
                                                <FiSend />
                                            </Button>
                                        </HStack>
                                    </Box>
                                </GridItem>
                            </Grid>
                        </Dialog.Body>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}