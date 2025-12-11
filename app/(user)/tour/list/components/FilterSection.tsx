"use client";

import { VStack, Heading } from "@chakra-ui/react";

type FilterSectionProps = {
  title: string;
  children: React.ReactNode;
};

export function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <VStack
      align="stretch"
      bg="white"
      borderRadius="2xl"
      border="1px solid"
      borderColor="blackAlpha.100"
      boxShadow="0 10px 30px rgba(15,35,95,0.08)"
      width="100%"
      p={5}
      gap={5}
    >
      <Heading fontSize="lg" color="gray.800">
        {title}
      </Heading>
      {children}
    </VStack>
  );
}


