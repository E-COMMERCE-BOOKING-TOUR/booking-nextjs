"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Box,
  Button,
  HStack,
  Input,
  Text,
  VStack,
  Popover,
  Portal,
} from "@chakra-ui/react";
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaUsers } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface SearchData {
  destination: string;
  checkIn: Date;
  checkOut: Date;
  rooms: number;
  adults: number;
  children: number;
}

interface SearchInputProps {
  defaultDestination?: string;
}

export default function SearchInput({ defaultDestination = "" }: SearchInputProps = {}) {
  const initialCheckOut = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  }, []);

  const router = useRouter();

  const [searchData, setSearchData] = useState<SearchData>({
    destination: defaultDestination,
    checkIn: new Date(),
    checkOut: initialCheckOut,
    rooms: 1,
    adults: 2,
    children: 0,
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getNightCount = () => {
    const diff = searchData.checkOut.getTime() - searchData.checkIn.getTime();
    return Math.round(diff / 86400000);
  };

  const toDateParam = (date: Date) => date.toISOString().split("T")[0];

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    const destination = searchData.destination.trim();

    if (destination) {
      params.set("keyword", destination);
    }

    params.set("checkIn", toDateParam(searchData.checkIn));
    params.set("checkOut", toDateParam(searchData.checkOut));
    params.set("rooms", String(searchData.rooms));
    params.set("adults", String(searchData.adults));
    params.set("children", String(searchData.children));

    const queryString = params.toString();
    router.push(queryString ? `/tour/list?${queryString}` : "/tour/list");
  }, [router, searchData]);

  return (
    <HStack
      bg="white"
      borderRadius="25px"
      boxShadow="lg"
      p={2}
      gap={2}
      alignItems="stretch"
      mx="auto"
      mb={10}
    >
      {/* Destination Field */}
      <VStack
        alignItems="flex-start"
        flex={2}
        px={5}
        py={4}
        gap={1}
        cursor="pointer"
        bg="gray.100"
        _hover={{ bg: "gray.200" }}
        borderRadius="15px"
        transition="all 0.2s"
        position="relative"
      >
        <HStack gap={2} mb={1}>
          <Box color="main" fontSize="lg">
            <FaMapMarkerAlt />
          </Box>
          <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase" letterSpacing="wide">
            Destination
          </Text>
        </HStack>
        <Input
          placeholder="Where are you going?"
          border="none"
          p={0}
          bg="transparent"
          fontSize="md"
          fontWeight="medium"
          _placeholder={{ color: "gray.400" }}
          _focus={{ boxShadow: "none" }}
          value={searchData.destination}
          onChange={(e) =>
            setSearchData({ ...searchData, destination: e.target.value })
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSearch();
            }
          }}
        />
      </VStack>

      {/* Check-in Field */}
      <Popover.Root>
        <Popover.Trigger asChild>
          <VStack
            alignItems="flex-start"
            flex={1}
            px={5}
            py={4}
            gap={1}
            cursor="pointer"
            bg="gray.100"
            _hover={{ bg: "gray.200" }}
            borderRadius="15px"
            transition="all 0.2s"
          >
            <HStack gap={2} mb={1}>
              <Box color="main" fontSize="lg">
                <FaCalendarAlt />
              </Box>
              <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                Check-in
              </Text>
            </HStack>
            <VStack alignItems="flex-start" gap={0}>
              <Text fontSize="md" fontWeight="semibold" color="gray.800">
                {formatDate(searchData.checkIn)}
              </Text>
              <Text fontSize="xs" color="main" fontWeight="medium">
                {getNightCount()} night{getNightCount() !== 1 ? "s" : ""}
              </Text>
            </VStack>
          </VStack>
        </Popover.Trigger>
        <Portal>
          <Popover.Positioner>
            <Popover.Content>
              <Popover.Body>
                <Input
                  type="date"
                  value={searchData.checkIn.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setSearchData({
                      ...searchData,
                      checkIn: new Date(e.target.value),
                    })
                  }
                />
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>

      {/* Check-out Field */}
      <Popover.Root>
        <Popover.Trigger asChild>
          <VStack
            alignItems="flex-start"
            flex={1}
            px={5}
            py={4}
            gap={1}
            cursor="pointer"
            bg="gray.100"
            _hover={{ bg: "gray.200" }}
            borderRadius="15px"
            transition="all 0.2s"
          >
            <HStack gap={2} mb={1}>
              <Box color="main" fontSize="lg">
                <FaCalendarAlt />
              </Box>
              <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                Check-out
              </Text>
            </HStack>
            <Text fontSize="md" fontWeight="semibold" color="gray.800">
              {formatDate(searchData.checkOut)}
            </Text>
          </VStack>
        </Popover.Trigger>
        <Portal>
          <Popover.Positioner>
            <Popover.Content>
              <Popover.Body>
                <Input
                  type="date"
                  value={searchData.checkOut.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setSearchData({
                      ...searchData,
                      checkOut: new Date(e.target.value),
                    })
                  }
                />
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>

      {/* Rooms and Guests Field */}
      <Popover.Root>
        <Popover.Trigger asChild>
          <VStack
            alignItems="flex-start"
            flex={1.5}
            px={5}
            py={4}
            gap={1}
            cursor="pointer"
            bg="gray.100"
            _hover={{ bg: "gray.200" }}
            borderRadius="15px"
            transition="all 0.2s"
          >
            <HStack gap={2} mb={1}>
              <Box color="main" fontSize="lg">
                <FaUsers />
              </Box>
              <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                Rooms and Guests
              </Text>
            </HStack>
            <Text fontSize="md" fontWeight="semibold" color="gray.800">
              {searchData.rooms} room{searchData.rooms !== 1 ? "s" : ""},{" "}
              {searchData.adults} adult{searchData.adults !== 1 ? "s" : ""},{" "}
              {searchData.children} children
            </Text>
          </VStack>
        </Popover.Trigger>
        <Portal>
          <Popover.Positioner>
            <Popover.Content p={4} minW="300px">
              <Popover.Body>
                <VStack gap={5} align="stretch">
                  <HStack justifyContent="space-between">
                    <Text fontSize="sm" fontWeight="medium">Rooms</Text>
                    <HStack gap={3}>
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="blue"
                        onClick={() =>
                          setSearchData({
                            ...searchData,
                            rooms: Math.max(1, searchData.rooms - 1),
                          })
                        }
                        disabled={searchData.rooms <= 1}
                      >
                        -
                      </Button>
                      <Text w="40px" textAlign="center" fontWeight="semibold">
                        {searchData.rooms}
                      </Text>
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="blue"
                        onClick={() =>
                          setSearchData({
                            ...searchData,
                            rooms: searchData.rooms + 1,
                          })
                        }
                      >
                        +
                      </Button>
                    </HStack>
                  </HStack>
                  <Box h="1px" bg="gray.200" />
                  <HStack justifyContent="space-between">
                    <Text fontSize="sm" fontWeight="medium">Adults</Text>
                    <HStack gap={3}>
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="blue"
                        onClick={() =>
                          setSearchData({
                            ...searchData,
                            adults: Math.max(1, searchData.adults - 1),
                          })
                        }
                        disabled={searchData.adults <= 1}
                      >
                        -
                      </Button>
                      <Text w="40px" textAlign="center" fontWeight="semibold">
                        {searchData.adults}
                      </Text>
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="blue"
                        onClick={() =>
                          setSearchData({
                            ...searchData,
                            adults: searchData.adults + 1,
                          })
                        }
                      >
                        +
                      </Button>
                    </HStack>
                  </HStack>
                  <Box h="1px" bg="gray.200" />
                  <HStack justifyContent="space-between">
                    <Text fontSize="sm" fontWeight="medium">Children</Text>
                    <HStack gap={3}>
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="blue"
                        onClick={() =>
                          setSearchData({
                            ...searchData,
                            children: Math.max(0, searchData.children - 1),
                          })
                        }
                        disabled={searchData.children <= 0}
                      >
                        -
                      </Button>
                      <Text w="40px" textAlign="center" fontWeight="semibold">
                        {searchData.children}
                      </Text>
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="blue"
                        onClick={() =>
                          setSearchData({
                            ...searchData,
                            children: searchData.children + 1,
                          })
                        }
                      >
                        +
                      </Button>
                    </HStack>
                  </HStack>
                </VStack>
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>

      {/* Search Button */}
      <Button
        bg="main"
        color="white"
        size="lg"
        flex={1}
        px={8}
        onClick={handleSearch}
        fontSize="md"
        fontWeight="bold"
        borderRadius="15px"
        height="auto"
        _hover={{
          bg: "secondary",
          opacity: 0.9,
          transform: "translateY(-1px)"
        }}
        _active={{
          transform: "translateY(0px)"
        }}
        transition="all 0.2s"
      >
        <HStack gap={2}>
          <FaSearch />
          <Text>Search</Text>
        </HStack>
      </Button>
    </HStack>
  );
}
