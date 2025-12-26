"use client";

import { useState, useCallback, useEffect } from "react";
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
  startDate: Date | null;
  endDate: Date | null;
  travelers: number;
}

interface SearchInputProps {
  defaultDestination?: string;
}

export default function SearchInput({ defaultDestination = "" }: SearchInputProps = {}) {
  const router = useRouter();

  const [searchData, setSearchData] = useState<SearchData>({
    destination: defaultDestination,
    startDate: null,
    endDate: null,
    travelers: 2,
  });

  // Initialize dates on client side only to avoid hydration mismatch
  useEffect(() => {
    const initDates = () => {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      setSearchData(prev => ({
        ...prev,
        startDate: today,
        endDate: nextWeek,
      }));
    };

    requestAnimationFrame(initDates);
  }, []);

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatDateRange = () => {
    if (!searchData.startDate && !searchData.endDate) return "Select dates";
    const start = formatDate(searchData.startDate);
    const end = formatDate(searchData.endDate);
    if (start && end) return `${start} - ${end}`;
    return start || end || "Select dates";
  };

  const getNightCount = () => {
    if (!searchData.startDate || !searchData.endDate) return 0;
    const diff = searchData.endDate.getTime() - searchData.startDate.getTime();
    return Math.max(0, Math.round(diff / 86400000));
  };

  const toDateParam = (date: Date | null) => date ? date.toISOString().split("T")[0] : "";

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    const destination = searchData.destination.trim();

    if (destination) {
      params.set("keyword", destination);
    }

    if (searchData.startDate) {
      params.set("startDate", toDateParam(searchData.startDate));
    }
    if (searchData.endDate) {
      params.set("endDate", toDateParam(searchData.endDate));
    }
    if (searchData.travelers > 0) {
      params.set("travelers", String(searchData.travelers));
    }

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
      mb={5}
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

      {/* Date Range Field */}
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
                <FaCalendarAlt />
              </Box>
              <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                Dates
              </Text>
            </HStack>
            <VStack alignItems="flex-start" gap={0}>
              <Text fontSize="md" fontWeight="semibold" color="gray.800">
                {formatDateRange()}
              </Text>
              <Text fontSize="xs" color="main" fontWeight="medium">
                {getNightCount()} night{getNightCount() !== 1 ? "s" : ""}
              </Text>
            </VStack>
          </VStack>
        </Popover.Trigger>
        <Portal>
          <Popover.Positioner>
            <Popover.Content p={4} minW="280px">
              <Popover.Body>
                <VStack gap={4} align="stretch">
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Start Date</Text>
                    <Input
                      type="date"
                      value={searchData.startDate ? searchData.startDate.toISOString().split("T")[0] : ""}
                      onChange={(e) =>
                        setSearchData({
                          ...searchData,
                          startDate: e.target.value ? new Date(e.target.value) : null,
                        })
                      }
                    />
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>End Date</Text>
                    <Input
                      type="date"
                      value={searchData.endDate ? searchData.endDate.toISOString().split("T")[0] : ""}
                      min={searchData.startDate ? searchData.startDate.toISOString().split("T")[0] : ""}
                      onChange={(e) =>
                        setSearchData({
                          ...searchData,
                          endDate: e.target.value ? new Date(e.target.value) : null,
                        })
                      }
                    />
                  </Box>
                </VStack>
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>

      {/* Travelers Field */}
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
                <FaUsers />
              </Box>
              <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                Travelers
              </Text>
            </HStack>
            <Text fontSize="md" fontWeight="semibold" color="gray.800">
              {searchData.travelers} traveler{searchData.travelers !== 1 ? "s" : ""}
            </Text>
          </VStack>
        </Popover.Trigger>
        <Portal>
          <Popover.Positioner>
            <Popover.Content p={4} minW="200px">
              <Popover.Body>
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" fontWeight="medium">Travelers</Text>
                  <HStack gap={3}>
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="blue"
                      onClick={() =>
                        setSearchData({
                          ...searchData,
                          travelers: Math.max(1, searchData.travelers - 1),
                        })
                      }
                      disabled={searchData.travelers <= 1}
                    >
                      -
                    </Button>
                    <Text w="40px" textAlign="center" fontWeight="semibold">
                      {searchData.travelers}
                    </Text>
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="blue"
                      onClick={() =>
                        setSearchData({
                          ...searchData,
                          travelers: searchData.travelers + 1,
                        })
                      }
                    >
                      +
                    </Button>
                  </HStack>
                </HStack>
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
