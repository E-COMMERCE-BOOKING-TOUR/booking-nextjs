"use client";

import { Box, Button, Flex, Heading, HStack, Icon, Text } from "@chakra-ui/react";
import { FiChevronDown, FiMapPin } from "react-icons/fi";

type PageHeaderProps = {
  totalLabel: string;
  destinationLabel: string;
};

export function PageHeader({ totalLabel, destinationLabel }: PageHeaderProps) {
  return (
    <Flex mb={10} justify="space-between" align={{ base: "flex-start", md: "center" }} gap={4}>
      <Box>
        <Heading fontSize={{ base: "2xl", md: "3xl" }} color="gray.900">
          Discover Featured Tours
        </Heading>
        <HStack gap={2} color="gray.500" fontSize="sm" mt={2}>
          <Text>{totalLabel}</Text>
          <Text>•</Text>
          <HStack gap={1}>
            <Icon as={FiMapPin} />
            <Text>{destinationLabel}</Text>
          </HStack>
        </HStack>
      </Box>
      <HStack gap={3} align="center">
        <Text color="gray.500">Sort by:</Text>
        <Button bg="white" borderRadius="full" variant="outline" borderColor="gray.200" px={5}>
          <HStack gap={2}>
            <Text>Popularity</Text>
            <Icon as={FiChevronDown} />
          </HStack>
        </Button>
      </HStack>
    </Flex>
  );
}


