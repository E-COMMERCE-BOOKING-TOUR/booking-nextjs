'use client';

import { Box, Button, Flex, Grid, Heading, HStack, Text } from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { useTranslations, useLocale } from "next-intl";

interface SearchCalendarProps {
    onSelectDate: (start: Date, end: Date) => void;
    initialStartDate?: Date | null;
    initialEndDate?: Date | null;
}

const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function SearchCalendar({ onSelectDate, initialStartDate, initialEndDate }: SearchCalendarProps) {
    const locale = useLocale();
    const t = useTranslations('common');
    const DAYS = locale === 'vi' ? DAYS_VI : DAYS_EN;

    const [currentMonth, setCurrentMonth] = useState(() => {
        if (initialStartDate) {
            return new Date(initialStartDate.getFullYear(), initialStartDate.getMonth(), 1);
        }
        return new Date();
    });

    const [startDate, setStartDate] = useState<Date | null>(initialStartDate || null);
    const [endDate, setEndDate] = useState<Date | null>(initialEndDate || null);
    const [selectingEnd, setSelectingEnd] = useState(false);

    const formatDate = (date: Date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const getDaysArray = (year: number, month: number) => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();

        const days = [];
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const handleDateClick = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) return;

        if (!selectingEnd || !startDate) {
            // Selecting start date
            setStartDate(date);
            setEndDate(null);
            setSelectingEnd(true);
        } else {
            // Selecting end date
            if (date < startDate) {
                // If clicked date is before start, swap
                setEndDate(startDate);
                setStartDate(date);
            } else {
                setEndDate(date);
            }
            setSelectingEnd(false);

            // Trigger callback with selected range
            const finalStart = date < startDate ? date : startDate;
            const finalEnd = date < startDate ? startDate : date;
            onSelectDate(finalStart, finalEnd);
        }
    };

    const isInRange = (date: Date) => {
        if (!startDate || !endDate) return false;
        return date > startDate && date < endDate;
    };

    const renderMonth = (offset: number) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = getDaysArray(year, month);
        const monthName = date.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', year: 'numeric' });

        return (
            <Box flex={1} minW="280px">
                <Heading size="md" textAlign="center" mb={4} color="gray.700">{monthName}</Heading>
                <Grid templateColumns="repeat(7, 1fr)" mb={3}>
                    {DAYS.map(d => (
                        <Text key={d} textAlign="center" fontSize="xs" fontWeight="semibold" color="gray.400" textTransform="uppercase">{d}</Text>
                    ))}
                </Grid>
                <Grid templateColumns="repeat(7, 1fr)" gap={1}>
                    {days.map((d, i) => {
                        if (!d) return <Box key={`empty-${i}`} />;

                        const dateStr = formatDate(d);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const isPast = d < today;
                        const isStart = startDate && d.getTime() === startDate.getTime();
                        const isEnd = endDate && d.getTime() === endDate.getTime();
                        const inRange = isInRange(d);
                        const isSelected = isStart || isEnd;

                        return (
                            <Box
                                key={dateStr}
                                p={2}
                                borderRadius={isStart ? "full 0 0 full" : isEnd ? "0 full full 0" : inRange ? "none" : "md"}
                                bg={isSelected ? "main" : inRange ? "blue.100" : isPast ? "gray.50" : "white"}
                                color={isSelected ? "white" : isPast ? "gray.300" : "gray.700"}
                                cursor={isPast ? "not-allowed" : "pointer"}
                                onClick={() => !isPast && handleDateClick(d)}
                                minH="40px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                transition="all 0.2s ease"
                                _hover={!isPast && !isSelected ? { bg: "gray.100", borderColor: "blue.300" } : undefined}
                                fontWeight={isSelected ? "bold" : "medium"}
                                fontSize="sm"
                            >
                                {d.getDate()}
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
        const now = new Date();
        if (prev >= new Date(now.getFullYear(), now.getMonth(), 1)) {
            setCurrentMonth(prev);
        }
    };

    const canGoPrev = useMemo(() => {
        const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
        const now = new Date();
        return prev >= new Date(now.getFullYear(), now.getMonth(), 1);
    }, [currentMonth]);

    return (
        <Box p={4} borderRadius="xl" bg="white">
            <Flex justify="space-between" align="center" mb={6}>
                <Button
                    aria-label="Previous month"
                    onClick={prevMonth}
                    disabled={!canGoPrev}
                    variant="ghost"
                    size="sm"
                    borderRadius="full"
                    _hover={{ bg: "gray.100" }}
                >
                    <BsChevronLeft />
                </Button>
                <Text fontWeight="bold" color="gray.600" fontSize="sm">
                    {selectingEnd && startDate ? t('select_end_date', { defaultValue: "Select end date" }) : t('select_start_date', { defaultValue: "Select start date" })}
                </Text>
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

            <Flex gap={6} direction={{ base: 'column', md: 'row' }}>
                {renderMonth(0)}
                <Box display={{ base: 'none', md: 'block' }} width="1px" bg="gray.200" />
                {renderMonth(1)}
            </Flex>

            <Flex mt={6} justify="center" align="center" gap={6} flexWrap="wrap">
                <HStack>
                    <Box w={4} h={4} bg="main" borderRadius="md" />
                    <Text fontSize="sm" color="gray.600">{t('selected', { defaultValue: 'Selected' })}</Text>
                </HStack>
                <HStack>
                    <Box w={4} h={4} bg="blue.100" borderRadius="md" />
                    <Text fontSize="sm" color="gray.600">{t('in_range', { defaultValue: 'In Range' })}</Text>
                </HStack>
                <HStack>
                    <Box w={4} h={4} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200" />
                    <Text fontSize="sm" color="gray.600">{t('unavailable', { defaultValue: 'Unavailable' })}</Text>
                </HStack>
            </Flex>

            {startDate && (
                <Box mt={4} p={3} bg="blue.50" borderRadius="lg" textAlign="center">
                    <Text fontSize="sm" color="gray.700">
                        {startDate.toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {endDate && (
                            <> → {endDate.toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</>
                        )}
                    </Text>
                </Box>
            )}
        </Box>
    );
}
