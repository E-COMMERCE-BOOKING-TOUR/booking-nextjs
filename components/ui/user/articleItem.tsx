import { Box, HStack, Image, Text, VStack } from "@chakra-ui/react";
import ArticleDescription from "./articleDescription";

interface ArticleItemProps {
  image?: string;
  title: string;
  description: string;
  tags: string[];
  timestamp?: string;
}

const TagList = ({ tags }: { tags: string[] }) => (
  <HStack gap={2} flexWrap="wrap">
    {tags.map((tag, i) => (
      <Text key={i} fontSize="sm" fontWeight="medium" color="blue.600">
        {tag}
      </Text>
    ))}
  </HStack>
);

const LargeArticleItem = ({ image, title, description, tags }: ArticleItemProps) => (
  <Box position="relative">
    <VStack align="stretch" gap={4} bg="white" borderRadius="15px" shadow="sm">
      <Box w="full" h="250px" bg="gray.200" borderRadius="15px 15px 0 0" overflow="hidden">
        {image && <Image src={image} alt={title} w="full" h="full" objectFit="cover" />}
      </Box>
      <VStack align="stretch" px={6} pb={6} gap={3}>
        <TagList tags={tags} />
        <Text fontSize="xl" fontWeight="bold" lineHeight="1.4" color="gray.900">
          {title}
        </Text>
        <ArticleDescription description={description} />
      </VStack>
    </VStack>
    <Box position="absolute" top={4} left="-10px" w="50px" h="50px" bg="orange.500" borderRadius="md" display="flex" alignItems="center" justifyContent="center" fontWeight="bold" color="white" zIndex={1}>
      1
    </Box>
  </Box>
);

const SmallArticleItem = ({ image, title, tags, timestamp }: ArticleItemProps) => (
  <HStack align="start" gap={4} bg="white" p={4} borderRadius="15px" shadow="sm" w="full">
    <Box width="250px" height="100%" borderRadius="15px" overflow="hidden">
      <Image src={image} alt={title} w="full" h="full" objectFit="cover" />
    </Box>
    <VStack align="stretch" flex={1} gap={2}>
      <TagList tags={tags} />
      <Text fontSize="md" fontWeight="bold" lineHeight="1.4" lineClamp={2} color="gray.900">
        {title}
      </Text>
      {/* <ArticleDescription description={description} /> */}
      {timestamp && (
        <Text fontSize="xs" color="gray.500" textAlign="right">
          {timestamp}
        </Text>
      )}
    </VStack>
  </HStack>
);

export default function ArticleItem(props: ArticleItemProps) {
  return <SmallArticleItem {...props} />;
}

ArticleItem.large = function (props: ArticleItemProps) {
  return <LargeArticleItem {...props} />;
};
