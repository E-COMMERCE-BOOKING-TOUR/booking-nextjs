import { Box, Flex, Heading, Text, Button, Badge, HStack, VStack } from "@chakra-ui/react";
import StarRating from "./starRating";

interface TourHeaderProps {
    title: string;
    location: string;
    rating: number;
    price: number;
    oldPrice?: number;
}

export default function TourHeader({ title, location, rating, price, oldPrice }: TourHeaderProps) {
    return (
        <Flex
            justifyContent="space-between"
            alignItems="center"
            mt={6}
            mb={4}
            gap={4}
        >
            <Box flex={1}>
                <Heading as="h1" size="xl" mb={2}>
                    {title}
                </Heading>
                <Text color="gray.600" mb={2}>
                    {location}
                </Text>
                <HStack gap={2}>
                    <Badge colorScheme="blue" borderRadius="full" px={2} py={1}>
                        {rating}
                    </Badge>
                    <StarRating rating={rating} />
                </HStack>
            </Box>

            <HStack gap={8} textAlign="right" justify="flex-end">
                <VStack align="flex-end">
                    <Heading as="h2" size="2xl" color="main" fontWeight="bold">
                        VND {price.toLocaleString()}
                    </Heading>
                    {oldPrice && (
                        <Text as="del" color="gray.400" fontSize="sm">
                            VND {oldPrice.toLocaleString()}
                        </Text>
                    )}
                </VStack>
                <Button bg="main" color="white" rounded="15px" px={12} py={8}>
                    Select Rooms
                </Button>
            </HStack>
        </Flex>
    );
}

