import { Heading, Text, VStack } from "@chakra-ui/react";

export default function Header() {
  return <VStack marginY="15rem">
    <Heading as="h1" size="4xl" fontWeight="bold">
      Welcome to <Text as="span">TripConnect&apos;s</Text> Travel Platform
    </Heading>
    <Text>
      Discover the best destinations for your next trip with TripConnect&apos;s Travel Platform
    </Text>
  </VStack >
}
