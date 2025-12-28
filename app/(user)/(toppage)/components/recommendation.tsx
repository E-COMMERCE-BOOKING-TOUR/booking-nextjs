import { HeaderList } from "@/components/ui/user";
import { Box, HStack, Image, SimpleGrid, Text, VStack } from "@chakra-ui/react";

export default function Recommendation() {
  return <Box>
    <HeaderList
      title="Recommend for you"
    />
    <SimpleGrid columns={4} gap={4} mb={4}>
      <RecentSearchItem image="/assets/images/icon.png" title="Hanoi" description="14 Nov-16 Nov, 2 people" />
      <RecentSearchItem image="/assets/images/icon.png" title="Hanoi" description="14 Nov-16 Nov, 2 people" />
      <RecentSearchItem image="/assets/images/icon.png" title="Hanoi" description="14 Nov-16 Nov, 2 people" />
    </SimpleGrid>
  </Box>;
}

const RecentSearchItem = ({ image, title, description }: { image: string; title: string; description: string }) => {
  return <HStack bg="gray.100" borderRadius="25px" p="10px" gap={4}>
    <Box width="80px" height="80px" borderRadius="15px" overflow="hidden">
      <Image src={image} alt={title} />
    </Box>
    <VStack alignItems="flex-start" gap={0}>
      <Text fontSize="lg" fontWeight="bold">{title}</Text>
      <Text>{description}</Text>
    </VStack>
  </HStack>
}