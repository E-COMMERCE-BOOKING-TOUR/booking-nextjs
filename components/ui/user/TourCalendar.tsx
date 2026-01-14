'use client';

import { Box, Button, Flex, Grid, Heading, HStack, Text, Spinner } from "@chakra-ui/react";
import { useState, useMemo } from "react";
import tour from "@/apis/tour";
import { IUserTourSession } from "@/types/response/tour.type";
import { useQuery } from "@tanstack/react-query";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { toaster } from "@/components/chakra/toaster";
import { useTranslations, useLocale } from "next-intl";

interface TourCalendarProps {
    tourSlug: string;
    variantId: number;
    durationDays: number;
    onSelectDate: (start: Date, end: Date) => void;
    minDate?: Date;
    initialSelectedDate?: string; // YYYY-MM-DD format
}

const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function TourCalendar({ tourSlug, variantId, durationDays, onSelectDate, initialSelectedDate }: TourCalendarProps) {
    const t = useTranslations('common');
    const locale = useLocale();
    const DAYS = locale === 'vi' ? DAYS_VI : DAYS_EN;

    const [currentMonth, setCurrentMonth] = useState(() => {
        // If there's an initial date, start on that month
        if (initialSelectedDate) {
            return new Date(initialSelectedDate + 'T00:00:00');
        }
        return new Date();
    });
    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(() => {
        // Initialize with existing selection if provided
        if (initialSelectedDate) {
            return new Date(initialSelectedDate + 'T00:00:00');
        }
        return null;
    });

    // Helper: Format date to YYYY-MM-DD
    const formatDate = (date: Date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    // Fetch sessions
    const { data: sessions, isLoading } = useQuery({
        queryKey: ['tourSessions', tourSlug, variantId, currentMonth.getMonth(), currentMonth.getFullYear()],
        queryFn: async () => {
            // Fetch 2 months range
            const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 0);
            const formatDateLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            return tour.getSessions(tourSlug, variantId, formatDateLocal(start), formatDateLocal(end));
        },
        enabled: !!tourSlug && !!variantId
    });

    const sessionMap = useMemo(() => {
        const map = new Map<string, IUserTourSession[]>();
        sessions?.forEach((s: IUserTourSession) => {
            const dateStr = s.date;
            if (!map.has(dateStr)) {
                map.set(dateStr, []);
            }
            map.get(dateStr)?.push(s);
        });
        return map;
    }, [sessions]);

    const getDaysArray = (year: number, month: number) => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay(); // 0 = Sun

        const days = [];
        // Empty slots
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(null);
        }
        // Actual days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const handleDateClick = (date: Date) => {
        const dateStr = formatDate(date);
        const daySessions = sessionMap.get(dateStr);

        // A date is available if ANY session on that date is open and has capacity
        const hasAvailableSession = daySessions?.some(s => s.status === 'open' && s.capacity_available > 0);

        if (!hasAvailableSession) return;
        if (date < new Date(new Date().setHours(0, 0, 0, 0))) return;

        // Check if any day in the range is "off" (disabled)
        if (durationDays > 1) {
            for (let i = 1; i < durationDays; i++) {
                const checkDate = new Date(date);
                checkDate.setDate(checkDate.getDate() + i);
                const checkDateStr = formatDate(checkDate);
                const checkDaySessions = sessionMap.get(checkDateStr);

                // A day is considered "off" if there are no open sessions with capacity
                const isOff = !checkDaySessions?.some(s => s.status === 'open' && s.capacity_available > 0);

                if (isOff) {
                    toaster.create({
                        title: t('selected_range_includes_off_days'),
                        description: t('tour_cannot_run_on_date', { date: checkDate.toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US') }),
                        type: "error",
                        duration: 5000,
                    });
                    return;
                }
            }
        }

        setSelectedStartDate(date);

        // Calculate end date
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + (durationDays > 1 ? durationDays - 1 : 0));

        onSelectDate(date, endDate);
    };

    const renderMonth = (offset: number) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = getDaysArray(year, month);
        const monthName = date.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', year: 'numeric' });

        return (
            <Box flex={1} minW="320px">
                <Heading size="md" textAlign="center" mb={4} color="gray.700">{monthName}</Heading>
                <Grid templateColumns="repeat(7, 1fr)" mb={3}>
                    {DAYS.map(d => (
                        <Text key={d} textAlign="center" fontSize="xs" fontWeight="semibold" color="gray.400" textTransform="uppercase">{d}</Text>
                    ))}
                </Grid>
                <Grid templateColumns="repeat(7, 1fr)">
                    {days.map((d, i) => {
                        if (!d) return <Box key={`empty-${i}`} />;

                        const dateStr = formatDate(d);
                        const daySessions = sessionMap.get(dateStr);
                        const isPast = d < new Date(new Date().setHours(0, 0, 0, 0));

                        // Available if not past and has at least one open session with capacity
                        const hasAvailableSession = daySessions?.some(s => s.status === 'open' && s.capacity_available > 0);
                        const isDisabled = isPast || !hasAvailableSession;
                        const isStartDate = selectedStartDate && d.getTime() === selectedStartDate.getTime();

                        // Check range (if selected and tour has multiple days)
                        let inRange = false;
                        let isEndDate = false;
                        if (selectedStartDate && durationDays > 1) {
                            const endDate = new Date(selectedStartDate);
                            endDate.setDate(endDate.getDate() + durationDays - 1);
                            inRange = d > selectedStartDate && d < endDate;
                            isEndDate = d.getTime() === endDate.getTime();
                        }

                        // Determine if this date is part of selection (start, middle, or end)
                        const isPartOfSelection = isStartDate || inRange || isEndDate;

                        // Calculate total available spots for display
                        const totalAvailable = daySessions?.reduce((sum, s) => sum + (s.capacity_available || 0), 0) || 0;

                        return (
                            <Box
                                key={dateStr}
                                p={2}
                                border="1px solid"
                                borderColor={isStartDate || isEndDate ? "blue.500" : inRange ? "blue.400" : "gray.200"}
                                bg={isStartDate ? "blue.500" : isEndDate ? "blue.400" : inRange ? "blue.100" : isDisabled ? "gray.100" : "white"}
                                color={isStartDate || isEndDate ? "white" : isDisabled ? "gray.400" : "gray.700"}
                                cursor={isDisabled ? "not-allowed" : "pointer"}
                                onClick={() => !isDisabled && handleDateClick(d)}
                                minH="80px"
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="center"
                                transition="all 0.2s ease"
                                _hover={!isDisabled && !isStartDate ? { bg: "gray.50", borderColor: "blue.300" } : undefined}
                                position="relative"
                            >
                                {/* Day label for start/end */}
                                {isStartDate && durationDays > 1 && (
                                    <Text fontSize="2xs" color="whiteAlpha.800" position="absolute" top={1}>{t('start')}</Text>
                                )}
                                {isEndDate && (
                                    <Text fontSize="2xs" color="whiteAlpha.800" position="absolute" top={1}>{t('end')}</Text>
                                )}
                                <Text fontSize="md" fontWeight={isPartOfSelection ? "bold" : "medium"}>{d.getDate()}</Text>

                                {!isDisabled && totalAvailable > 0 && (
                                    <Text fontSize="10px" color={isPartOfSelection ? "whiteAlpha.800" : "blue.500"} fontWeight="bold" mt={1}>
                                        {totalAvailable} {t("spots_left")}
                                    </Text>
                                )}
                            </Box>
                        );
                    })}
                </Grid>
            </Box>
        );
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
        if (prev >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)) {
            setCurrentMonth(prev);
        }
    };

    return (
        <Box p={6} borderRadius="xl" bg="white">
            <Flex justify="space-between" align="center" mb={6}>
                <Button
                    aria-label="Previous month"
                    onClick={prevMonth}
                    disabled={currentMonth <= new Date()}
                    variant="ghost"
                    size="sm"
                    borderRadius="full"
                    _hover={{ bg: "gray.100" }}
                >
                    <BsChevronLeft />
                </Button>
                <Text fontWeight="bold" color="gray.600">{t('select_travel_date', { defaultValue: 'Select your travel date' })}</Text>
                <Button
                    aria-label="Next month"
                    onClick={nextMonth}
                    variant="ghost"
                    size="sm"
                    borderRadius="full"
                    _hover={{ bg: "gray.100" }}
                >
                    <BsChevronRight />
                </Button>
            </Flex>
            <Flex gap={8} direction={{ base: 'column', md: 'row' }}>
                {renderMonth(0)}
                <Box display={{ base: 'none', md: 'block' }} width="1px" bg="gray.200" />
                {renderMonth(1)}
            </Flex>
            {isLoading && (
                <Flex justify="center" mt={4}>
                    <Spinner color="blue.500" />
                </Flex>
            )}
            <Flex mt={6} justify="center" align="center" gap={6} flexWrap="wrap">
                <HStack>
                    <Box w={4} h={4} bg="blue.500" borderRadius="md" />
                    <Text fontSize="sm" color="gray.600">{t('selected', { defaultValue: 'Selected' })}</Text>
                </HStack>
                <HStack>
                    <Box w={4} h={4} bg="white" border="1px solid" borderColor="gray.200" borderRadius="md" />
                    <Text fontSize="sm" color="gray.600">{t('available', { defaultValue: 'Available' })}</Text>
                </HStack>
                <HStack>
                    <Box w={4} h={4} bg="gray.100" borderRadius="md" />
                    <Text fontSize="sm" color="gray.600">{t('unavailable', { defaultValue: 'Unavailable' })}</Text>
                </HStack>
            </Flex>
        </Box>
    );
}
