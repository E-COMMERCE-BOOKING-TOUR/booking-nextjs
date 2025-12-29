"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  HStack,
  Input,
  Portal,
  Separator,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchCalendar from "./SearchCalendar";
import { useTranslation } from "@/libs/i18n/client";
import { fallbackLng } from "@/libs/i18n/settings";
import { FaCalendarAlt, FaMapMarkerAlt, FaMinus, FaPlus, FaSearch, FaUsers } from "react-icons/fa";

interface ChildrenData {
  youth: number; // 12-17
  children: number; // 3-11
  infants: number; // 0-2
}

interface GuestData {
  adults: number; // 18-59
  seniors: number; // 60+
  children: ChildrenData;
}

interface SearchData {
  destination: string;
  startDate: Date | null;
  endDate: Date | null;
  guests: GuestData;
}

interface SearchInputProps {
  defaultDestination?: string;
  lng?: string;
}

// Counter Component
const Counter = ({
  value,
  onDecrement,
  onIncrement,
  min = 0,
  max = 10,
  suffix = "",
}: {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  min?: number;
  max?: number;
  suffix?: string;
}) => (
  <HStack gap={2}>
    <Button
      size="sm"
      variant="outline"
      colorPalette="blue"
      borderRadius="full"
      w="32px"
      h="32px"
      p={0}
      onClick={onDecrement}
      disabled={value <= min}
      _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
    >
      <FaMinus size={10} />
    </Button>
    <Text w="50px" textAlign="center" fontWeight="semibold" color="main">
      {value}{suffix}
    </Text>
    <Button
      size="sm"
      variant="outline"
      colorPalette="blue"
      borderRadius="full"
      w="32px"
      h="32px"
      p={0}
      onClick={onIncrement}
      disabled={value >= max}
      _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
    >
      <FaPlus size={10} />
    </Button>
  </HStack>
);

// Guest Row Component  
const GuestRow = ({
  label,
  ageRange,
  icon: Icon,
  value,
  onChange,
  min = 0,
  suffix = "",
  indented = false,
}: {
  label: string;
  ageRange?: string;
  icon?: React.ElementType;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  suffix?: string;
  indented?: boolean;
}) => (
  <HStack justifyContent="space-between" w="full" py={3} pl={indented ? 6 : 0}>
    <HStack gap={3}>
      {Icon && (
        <Box color="main" fontSize="lg">
          <Icon />
        </Box>
      )}
      <VStack align="start" gap={0}>
        <Text fontSize="md" color={indented ? "gray.700" : "gray.900"} fontWeight={indented ? "medium" : "semibold"}>
          {label}
        </Text>
        {ageRange && (
          <Text fontSize="xs" color="gray.500" fontWeight="normal">
            {ageRange}
          </Text>
        )}
      </VStack>
    </HStack>
    <Counter
      value={value}
      onDecrement={() => onChange(Math.max(min, value - 1))}
      onIncrement={() => onChange(value + 1)}
      min={min}
      suffix={suffix}
    />
  </HStack>
);

export default function SearchInput({ defaultDestination = "", lng: propLng }: SearchInputProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // On the server, we can only rely on props or searchParams.
  // Cookies.get is client-side only and would cause hydration mismatch.
  const lng = propLng || searchParams.get('lng') || fallbackLng;
  const { t } = useTranslation(lng as string);

  const [searchData, setSearchData] = useState<SearchData>({
    destination: defaultDestination,
    startDate: null,
    endDate: null,
    guests: {
      adults: 2,
      seniors: 0,
      children: {
        youth: 0,
        children: 0,
        infants: 0,
      },
    },
  });

  // Dialog states
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [isGuestDialogOpen, setIsGuestDialogOpen] = useState(false);

  // Temp guests state for dialog editing
  const [tempGuests, setTempGuests] = useState<GuestData>(searchData.guests);

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
    return date.toLocaleDateString(lng === 'vi' ? 'vi-VN' : 'en-US', {
      month: "short",
      day: "numeric",
    });
  };

  const formatDateRange = () => {
    if (!searchData.startDate && !searchData.endDate) return t('select_dates', { defaultValue: 'Select dates' });
    const start = formatDate(searchData.startDate);
    const end = formatDate(searchData.endDate);
    if (start && end) return `${start} - ${end}`;
    return start || end || t('select_dates', { defaultValue: 'Select dates' });
  };

  const getNightCount = () => {
    if (!searchData.startDate || !searchData.endDate) return 0;
    const diff = searchData.endDate.getTime() - searchData.startDate.getTime();
    return Math.max(0, Math.round(diff / 86400000));
  };

  const getTotalTravelers = () => {
    const { adults, seniors, children } = searchData.guests;
    const totalChildren = Object.values(children).reduce((a, b) => a + b, 0);
    return adults + seniors + totalChildren;
  };

  const getTotalChildren = (childrenData: ChildrenData) => {
    return Object.values(childrenData).reduce((a, b) => a + b, 0);
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

    const { adults, seniors, children } = searchData.guests;
    const totalChildren = Object.values(children).reduce((a, b) => a + b, 0);
    const totalTravelers = adults + seniors + totalChildren;

    if (totalTravelers > 0) {
      params.set("travelers", String(totalTravelers));
      params.set("adults", String(adults));
      params.set("seniors", String(seniors));
      params.set("youth", String(children.youth));
      params.set("children", String(children.children));
      params.set("infants", String(children.infants));
    }

    const queryString = params.toString();
    router.push(queryString ? `/tour/list?${queryString}` : "/tour/list");
  }, [router, searchData]);

  // Open guest dialog and sync temp state
  const openGuestDialog = () => {
    setTempGuests({ ...searchData.guests });
    setIsGuestDialogOpen(true);
  };

  // Confirm guest selection
  const confirmGuests = () => {
    setSearchData(prev => ({ ...prev, guests: tempGuests }));
    setIsGuestDialogOpen(false);
  };

  // Cancel guest selection
  const cancelGuests = () => {
    setTempGuests(searchData.guests);
    setIsGuestDialogOpen(false);
  };

  const updateTempChildren = (key: keyof ChildrenData, value: number) => {
    setTempGuests(prev => ({
      ...prev,
      children: { ...prev.children, [key]: value }
    }));
  };

  return (
    <Stack
      direction={{ base: "column", lg: "row" }}
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
        w={{ base: "100%", lg: "auto" }}
        flex={{ base: "none", lg: 2 }}
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
            {t('destination_label', { defaultValue: 'Destination' })}
          </Text>
        </HStack>
        <Input
          placeholder={t('destination_placeholder', { defaultValue: 'Where are you going?' })}
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

      {/* Date Range Field - Dialog Modal */}
      <Dialog.Root
        size="xl"
        lazyMount
        unmountOnExit
        placement="center"
        motionPreset="slide-in-bottom"
        open={isDateDialogOpen}
        onOpenChange={(e) => setIsDateDialogOpen(e.open)}
      >
        <Dialog.Trigger asChild>
          <VStack
            alignItems="flex-start"
            w={{ base: "100%", lg: "auto" }}
            flex={{ base: "none", lg: 1.5 }}
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
                {t('dates_label', { defaultValue: 'Dates' })}
              </Text>
            </HStack>
            <VStack alignItems="flex-start" gap={0}>
              <Text fontSize="md" fontWeight="semibold" color="gray.800">
                {formatDateRange()}
              </Text>
              <Text fontSize="xs" color="main" fontWeight="medium">
                {getNightCount()} {t('night', { count: getNightCount(), defaultValue: 'night' })}
              </Text>
            </VStack>
          </VStack>
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
          <Dialog.Positioner>
            <Dialog.Content borderRadius="xl" boxShadow="2xl" maxW="700px">
              <Dialog.Header>
                <Dialog.Title>{t('select_travel_dates', { defaultValue: 'Select Travel Dates' })}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <SearchCalendar
                  initialStartDate={searchData.startDate}
                  initialEndDate={searchData.endDate}
                  onSelectDate={(start, end) => {
                    setSearchData(prev => ({
                      ...prev,
                      startDate: start,
                      endDate: end,
                    }));
                    setIsDateDialogOpen(false);
                  }}
                />
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">{t('cancel', { defaultValue: 'Cancel' })}</Button>
                </Dialog.ActionTrigger>
              </Dialog.Footer>
              <Dialog.CloseTrigger />
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Travelers Field - Dialog Modal */}
      <Dialog.Root
        size="md"
        lazyMount
        unmountOnExit
        placement="center"
        motionPreset="slide-in-bottom"
        open={isGuestDialogOpen}
        onOpenChange={(e) => {
          if (!e.open) cancelGuests();
        }}
      >
        <Dialog.Trigger asChild>
          <VStack
            alignItems="flex-start"
            w={{ base: "100%", lg: "auto" }}
            flex={{ base: "none", lg: 1 }}
            px={5}
            py={4}
            gap={1}
            cursor="pointer"
            bg="gray.100"
            _hover={{ bg: "gray.200" }}
            borderRadius="15px"
            transition="all 0.2s"
            onClick={openGuestDialog}
          >
            <HStack gap={2} mb={1}>
              <Box color="main" fontSize="lg">
                <FaUsers />
              </Box>
              <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                {t('travelers', { defaultValue: 'Travelers' })}
              </Text>
            </HStack>
            <Text fontSize="md" fontWeight="semibold" color="gray.800">
              {getTotalTravelers()} {t('travelers', { defaultValue: 'Travelers' })}
            </Text>
          </VStack>
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
          <Dialog.Positioner>
            <Dialog.Content borderRadius="2xl" boxShadow="2xl" maxW="500px" p={2}>
              <Dialog.Header pb={4}>
                <Dialog.Title fontSize="xl">{t('select_travelers', { defaultValue: 'Select Travelers' })}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <VStack gap={5} align="stretch">
                  {/* Adults/Seniors Section */}
                  <VStack gap={3} align="stretch">
                    <GuestRow
                      label={t('adults', { defaultValue: 'Adults' })}
                      ageRange={t('age_18_59', { defaultValue: 'Ages 18-59' })}
                      icon={FaUsers}
                      value={tempGuests.adults}
                      onChange={(val) => setTempGuests(prev => ({ ...prev, adults: val }))}
                      min={1}
                    />
                    <GuestRow
                      label={t('seniors', { defaultValue: 'Seniors' })}
                      ageRange={t('age_60', { defaultValue: 'Ages 60+' })}
                      icon={FaUsers}
                      value={tempGuests.seniors}
                      onChange={(val) => setTempGuests(prev => ({ ...prev, seniors: val }))}
                    />
                  </VStack>

                  <Separator />

                  {/* Children Section */}
                  <Box>
                    <HStack justifyContent="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="bold" color="gray.800">
                        {t('children', { defaultValue: 'Children' })} & {t('infants', { defaultValue: 'Infants' })}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {t('total', { defaultValue: 'Total' })}: {getTotalChildren(tempGuests.children)}
                      </Text>
                    </HStack>

                    <VStack gap={1} align="stretch" bg="gray.50" borderRadius="xl" p={4} border="1px solid" borderColor="gray.100">
                      <GuestRow
                        label={t('youth', { defaultValue: 'Youth' })}
                        ageRange={t('age_12_17', { defaultValue: 'Ages 12-17' })}
                        value={tempGuests.children.youth}
                        onChange={(val) => updateTempChildren('youth', val)}
                        indented
                      />
                      <GuestRow
                        label={t('children', { defaultValue: 'Children' })}
                        ageRange={t('age_3_11', { defaultValue: 'Ages 3-11' })}
                        value={tempGuests.children.children}
                        onChange={(val) => updateTempChildren('children', val)}
                        indented
                      />
                      <GuestRow
                        label={t('infants', { defaultValue: 'Infants' })}
                        ageRange={t('age_0_2', { defaultValue: 'Ages 0-2' })}
                        value={tempGuests.children.infants}
                        onChange={(val) => updateTempChildren('infants', val)}
                        indented
                      />
                    </VStack>
                  </Box>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer pt={4}>
                <Button variant="ghost" color="gray.500" onClick={cancelGuests}>
                  {t('cancel', { defaultValue: 'Cancel' })}
                </Button>
                <Button bg="main" color="white" borderRadius="full" px={10} size="lg" onClick={confirmGuests}>
                  {t('confirm', { defaultValue: 'Confirm' })}
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger />
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Search Button */}
      <Button
        bg="main"
        color="white"
        size="lg"
        w={{ base: "100%", lg: "auto" }}
        flex={{ base: "none", lg: 1 }}
        px={8}
        minHeight="50px"
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
          <Text>{t('search', { defaultValue: 'Search' })}</Text>
        </HStack>
      </Button>
    </Stack>
  );
}
