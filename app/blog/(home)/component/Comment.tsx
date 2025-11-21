"use client";
import { useMemo, useState, useEffect } from "react";
import { Box, Button, Grid, GridItem, HStack, Icon, Image, Input, Text, VStack, Dialog, CloseButton, Portal } from "@chakra-ui/react";
import { FiHeart, FiMessageCircle, FiMoreHorizontal, FiSend, FiChevronLeft, FiChevronRight } from "react-icons/fi";

export const flatTourComments = [
  // ===== TOUR 201 - Đà Lạt 3N2Đ =====
  { id: 1,  content: "Tour đi rất vui, phong cảnh đẹp.",      tour_id: 0, user_id: 101, parent_id: null },
  { id: 2,  content: "Hướng dẫn viên rất nhiệt tình.",        tour_id: 0, user_id: 102, parent_id: null },
  { id: 3,  content: "Đồ ăn ngon, hợp khẩu vị.",              tour_id: 0, user_id: 103, parent_id: null },

  // children of 1
  { id: 4,  content: "Bạn đi vào tháng mấy vậy?",             tour_id: 0, user_id: 104, parent_id: 1 },
  { id: 5,  content: "Mình cũng thích Đà Lạt lắm.",           tour_id: 0, user_id: 105, parent_id: 1 },

  // children of 4
  { id: 6,  content: "Mình đi vào tháng 12, rất lạnh.",       tour_id: 0, user_id: 106, parent_id: 4 },
  { id: 7,  content: "Đi mùa đó có hoa dã quỳ không?",         tour_id: 0, user_id: 107, parent_id: 4 },

  // children of 6
  { id: 8,  content: "Có nhé, chụp hình rất đẹp.",           tour_id: 0, user_id: 108, parent_id: 6 },

  // children of 2
  { id: 9,  content: "Hướng dẫn viên tên gì vậy bạn?",        tour_id: 0, user_id: 109, parent_id: 2 },

  // children of 9
  { id: 10, content: "Anh tên Minh, rất thân thiện.",         tour_id: 0, user_id: 110, parent_id: 9 },


  // ===== TOUR 202 - Phú Quốc 4N3Đ =====
  { id: 11, content: "Biển Phú Quốc đẹp mê luôn.",            tour_id: 1, user_id: 111, parent_id: null },
  { id: 12, content: "Khách sạn sạch sẽ và tiện nghi.",       tour_id: 1, user_id: 112, parent_id: null },
  { id: 13, content: "Di chuyển hơi nhiều nhưng rất đáng.",    tour_id: 1, user_id: 113, parent_id: null },

  // children of 11
  { id: 14, content: "Bạn đi vào mùa nào?",                   tour_id: 1, user_id: 114, parent_id: 11 },
  { id: 15, content: "Mình thích Bãi Sao nhất.",              tour_id: 1, user_id: 115, parent_id: 11 },

  // children of 14
  { id: 16, content: "Mình đi tháng 5, nắng đẹp.",            tour_id: 1, user_id: 116, parent_id: 14 },

  // children of 12
  { id: 17, content: "Khách sạn tên gì vậy bạn?",             tour_id: 1, user_id: 117, parent_id: 12 },

  // children of 17
  { id: 18, content: "Mường Thanh Phú Quốc bạn nhé.",        tour_id: 1, user_id: 118, parent_id: 17 },

  // children of 13
  { id: 19, content: "Đi nhiều mới thấy Phú Quốc đáng tiền.",  tour_id: 1, user_id: 119, parent_id: 13 },

  // reply level 3
  { id: 20, content: "Đúng rồi, nên đi ít nhất 1 lần.",        tour_id: 1, user_id: 120, parent_id: 19 },
];


type FlatComment = typeof flatTourComments[number];
type CommentNode = FlatComment & { children: CommentNode[] };

function buildTree(data: FlatComment[], tourId?: number) {
  const filteredById = typeof tourId === "number" ? data.filter(d => d.tour_id === tourId) : data;
  const filtered = Array.isArray(filteredById) && filteredById.length > 0 ? filteredById : data;
  const map = new Map<number, CommentNode>();
  filtered.forEach(c => map.set(c.id, { ...c, children: [] }));
  const roots: CommentNode[] = [];
  map.forEach(node => {
    if (node.parent_id) {
      const p = map.get(node.parent_id);
      if (p) p.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

export function PopUpComment({
  isOpen,
  onClose,
  tourId,
  images,
  comments = flatTourComments,
}: {
  isOpen: boolean;
  onClose: () => void;
  tourId?: number;
  images?: string[];
  comments?: FlatComment[];
}) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [text, setText] = useState("");
  const nodes = useMemo(() => buildTree(comments, tourId), [comments, tourId]);
  const [imgIndex, setImgIndex] = useState(0);
  useEffect(() => { if (isOpen) setImgIndex(0); }, [isOpen]);

  const toggle = (id: number) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const CommentItem = ({ node, depth = 0 }: { node: CommentNode; depth?: number }) => {
    const hasChildren = node.children.length > 0;
    const isOpenChild = !!expanded[node.id];
    return (
      <Box pl={depth ? 8 : 0} py={3} borderBottomWidth={depth ? 0 : 1} borderColor="whiteAlpha.200">
        <HStack align="start" gap={3} paddingLeft={4}>
          <Box bg="whiteAlpha.300" rounded="full" minW={8} minH={8} />
          <VStack align="start" gap={1} flex={1}>
            <Text color="white" fontSize="sm" fontWeight={"bold"}>Sơn Tùng MTP</Text>
            <Text color="gray.300" fontSize="sm">{node.content}</Text>
            <HStack gap={3} color="whiteAlpha.700" fontSize="xs">
              <Text>3d</Text>
              <Text>Reply</Text>
              {hasChildren ? (
                <Button variant="outline" colorScheme="blue" size="xs" onClick={() => toggle(node.id)}>
                  {isOpenChild ? "Hide replies" : "View replies"}
                </Button>
              ) : null}
            </HStack>
            {hasChildren && isOpenChild ? (
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
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }} size="cover" placement="center" motionPreset="slide-in-bottom">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="black" color="white" borderRadius="xl" overflow="hidden">
            <Dialog.Header>
              <HStack justify="space-between" px={4} py={2}>
                <Text fontWeight="semibold" fontSize="lg">Comments</Text>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" onClick={onClose} />
                </Dialog.CloseTrigger>
              </HStack>
            </Dialog.Header>
            <Dialog.Body p={0}>
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }}>
                <GridItem>
                  <Box bg="black" w="full" h={{ base: "70vh", md: "80vh" }} position="relative">
                    {images && images.length > 0 ? (
                      <Image src={images[imgIndex]} alt="tour" w="full" h="full" objectFit="cover" />
                    ) : (
                      <Box w="full" h="full" bg="whiteAlpha.200" />
                    )}
                    {images && images.length > 1 ? (
                      <>
                        <Button aria-label="Prev" variant="ghost" colorScheme="whiteAlpha" position="absolute" left={2} top="50%" transform="translateY(-50%)" onClick={() => setImgIndex((p) => (p - 1 + images.length) % images.length)}>
                          <Icon as={FiChevronLeft} />
                        </Button>
                        <Button aria-label="Next" variant="ghost" colorScheme="whiteAlpha" position="absolute" right={2} top="50%" transform="translateY(-50%)" onClick={() => setImgIndex((p) => (p + 1) % images.length)}>
                          <Icon as={FiChevronRight} />
                        </Button>
                      </>
                    ) : null}
                  </Box>
                </GridItem>
                <GridItem borderLeftWidth={{ base: 0, md: 1 }} borderColor="whiteAlpha.200">
                  <VStack align="stretch" h={{ base: "70vh", md: "80vh" }} wordSpacing={0} overflow="hidden">
                    <VStack align="stretch" flex={1} overflowY="auto">
                      {nodes.map(n => (
                        <CommentItem key={n.id} node={n} />
                      ))}
                    </VStack>
                    <Box p={3} borderTopWidth={1} borderColor="whiteAlpha.200" bg="black">
                      <HStack gap={3}>
                        <Icon as={FiMessageCircle} />
                        <Input placeholder="Add a comment..." value={text} onChange={e => setText(e.target.value)} color="white" />
                        <Button colorScheme="blue"><FiSend />Post</Button>
                      </HStack>
                    </Box>
                  </VStack>
                </GridItem>
              </Grid>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}