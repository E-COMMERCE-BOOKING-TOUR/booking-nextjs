"use client";

import { Box, HStack, Image, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";

interface TravelItemProps {
  id: number;
  image?: string;
  title: string;
  toursCount: number;
  flag?: string;
}

const LargeTravelItem = ({ id, image, title, toursCount, flag = "🇻🇳" }: TravelItemProps) => (
  <Link href={`/tour/list?division_ids=${id}`}>
    <Box
      position="relative"
      w="full"
      h="220px"
      borderRadius="15px"
      overflow="hidden"
      cursor="pointer"
      transition="all 0.3s"
      _hover={{ transform: "scale(1.02)" }}
      _before={{
        content: '""',
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "40px",
        height: "40px",
        bg: "transparent",
        borderBottomLeftRadius: "15px",
        boxShadow: "0 20px 0 0 white",
        zIndex: 2,
      }}
      _after={{
        content: '""',
        position: "absolute",
        bottom: 0,
        right: 0,
        width: "40px",
        height: "40px",
        bg: "transparent",
        borderBottomRightRadius: "15px",
        boxShadow: "0 20px 0 0 white",
        zIndex: 2,
      }}
    >
      <Image src={image} alt={title} w="full" h="full" objectFit="cover" />
      <Box
        position="absolute"
        inset={0}
        bg="linear-gradient(170deg,rgba(0, 0, 0, 1) 0%, rgba(255, 255, 255, 0) 100%)"
      />
      <VStack position="absolute" top={6} left={6} align="start" gap={1} zIndex={3}>
        <HStack gap={2}>
          <Text fontSize="2xl" fontWeight="bold" color="white" textTransform="uppercase">
            {title}
          </Text>
          <Text fontSize="xl">{flag}</Text>
        </HStack>
        <Text fontSize="sm" color="whiteAlpha.900">
          {toursCount} tours
        </Text>
      </VStack>
    </Box>
  </Link>
);

const SmallTravelItem = ({ id, image, title, toursCount, flag = "🇻🇳" }: TravelItemProps) => (
  <Link href={`/tour/list?division_ids=${id}`}>
    <Box
      position="relative"
      w="full"
      h="160px"
      borderRadius="15px"
      overflow="hidden"
      cursor="pointer"
      transition="all 0.3s"
      _hover={{ transform: "scale(1.02)" }}
      _before={{
        content: '""',
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "30px",
        height: "30px",
        bg: "transparent",
        borderBottomLeftRadius: "15px",
        boxShadow: "0 15px 0 0 white",
        zIndex: 2,
      }}
      _after={{
        content: '""',
        position: "absolute",
        bottom: 0,
        right: 0,
        width: "30px",
        height: "30px",
        bg: "transparent",
        borderBottomRightRadius: "15px",
        boxShadow: "0 15px 0 0 white",
        zIndex: 2,
      }}
    >
      <Image src={image} alt={title} w="full" h="full" objectFit="cover" />
      <Box
        position="absolute"
        inset={0}
        bg="linear-gradient(170deg,rgba(0, 0, 0, 1) 0%, rgba(255, 255, 255, 0) 100%)"
      />
      <VStack position="absolute" top={4} left={4} align="start" gap={1} zIndex={3}>
        <HStack gap={2}>
          <Text fontSize="xl" fontWeight="bold" color="white" textTransform="uppercase">
            {title}
          </Text>
          <Text fontSize="lg">{flag}</Text>
        </HStack>
        <Text fontSize="xs" color="whiteAlpha.900">
          {toursCount} tours
        </Text>
      </VStack>
    </Box>
  </Link>
);

export default function TravelItem(props: TravelItemProps) {
  return <SmallTravelItem {...props} />;
}

export { LargeTravelItem, SmallTravelItem };
