import { Box, Container, Heading, Text, Button, VStack } from "@chakra-ui/react";
import Link from "next/link";

export default function TourNotFound() {
    return (
        <Container maxW="7xl" mx="auto" px={4} py={20}>
            <Box
                bg="white"
                rounded="25px"
                p={12}
                textAlign="center"
                boxShadow="sm"
            >
                <VStack gap={6}>
                    <Heading as="h1" size="2xl" color="gray.800">
                        Tour Not Found
                    </Heading>
                    <Text fontSize="lg" color="gray.600" maxW="md">
                        Sorry, we couldn&apos;t find the tour you&apos;re looking for.
                        It may have been removed or the link might be incorrect.
                    </Text>
                    <Link href="/">
                        <Button
                            colorScheme="blue"
                            size="lg"
                            mt={4}
                            _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                            transition="all 0.2s"
                        >
                            Back to Home
                        </Button>
                    </Link>
                </VStack>
            </Box>
        </Container>
    );
}

