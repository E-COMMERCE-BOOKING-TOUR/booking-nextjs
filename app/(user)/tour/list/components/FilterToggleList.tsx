"use client";

import { Button, HStack, Stack, Text, Icon } from "@chakra-ui/react";
import { FiCheck } from "react-icons/fi";

type FilterToggleListProps = {
  options: string[];
  selected: string[];
  toggleOption: (value: string) => void;
};

export function FilterToggleList({ options, selected, toggleOption }: FilterToggleListProps) {
  return (
    <Stack gap={2}>
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <Button
            key={option}
            justifyContent="space-between"
            borderRadius="lg"
            variant={active ? "solid" : "ghost"}
            colorScheme="teal"
            bg={active ? "teal.500" : "transparent"}
            color={active ? "white" : "gray.700"}
            px={4}
            py={5}
            h="auto"
            fontWeight="semibold"
            _hover={{ bg: active ? "teal.600" : "blackAlpha.50" }}
            onClick={() => toggleOption(option)}
          >
            <Text>{option}</Text>
            {active && <Icon as={FiCheck} />}
          </Button>
        );
      })}
    </Stack>
  );
}


