"use client";

import { Box, Image, Text, Icon, Flex } from "@chakra-ui/react";
import { FaHeart, FaComment } from "react-icons/fa6";
import { IArticlePopular } from "@/types/response/article";

const ProfilePostCard = ({ article }: { article: IArticlePopular }) => {
    return (
        <Box
            position="relative"
            borderRadius="xl"
            overflow="hidden"
            cursor="pointer"
            aspectRatio={3 / 4} // Portrait aspect ratio for grid
            bg="gray.100"
        >
            {/* Image */}
            <Image
                src={article.images?.[0]?.image_url || "https://placehold.co/400x600?text=No+Image"}
                alt={article.title}
                objectFit="cover"
                w="full"
                h="full"
                transition="transform 0.3s ease"
                _groupHover={{ transform: "scale(1.05)" }}
            />

            {/* Overlay Gradient */}
            <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                h="50%"
                bgGradient="to-t"
                gradientFrom="blackAlpha.800"
                gradientTo="transparent"
                opacity={0.8}
            />

            {/* Content Overlay */}
            <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                p={3}
                color="white"
            >
                <Text
                    fontSize="md"
                    fontWeight="bold"
                    lineHeight="1.2"
                    maxLines={2}
                    mb={2}
                    textShadow="0 1px 2px rgba(0,0,0,0.5)"
                >
                    {article.title}
                </Text>

                <Flex gap={3} fontSize="sm" fontWeight="medium">
                    <Flex align="center" gap={1}>
                        <Icon as={FaHeart} />
                        <Text>{article.count_likes}</Text>
                    </Flex>
                    <Flex align="center" gap={1}>
                        <Icon as={FaComment} />
                        <Text>{article.count_comments}</Text>
                    </Flex>
                </Flex>
            </Box>
        </Box>
    );
};

export default ProfilePostCard;
