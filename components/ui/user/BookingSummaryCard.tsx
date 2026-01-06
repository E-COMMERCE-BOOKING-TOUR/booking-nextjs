import { Box, Heading, VStack, HStack, Image, Text, DataList, Stack, Flex } from "@chakra-ui/react";
import { IBookingDetail } from "@/types/booking";
import { numberFormat } from "@/libs/function";
import { useTranslations, useLocale } from "next-intl";

export const BookingSummaryCard = ({ booking }: { booking: IBookingDetail }) => {
    const t = useTranslations('common');
    const locale = useLocale();
    const lng = locale; // Keep for date formatting logic below if needed

    return (
        <VStack gap={4}>
            <Box boxShadow="sm" rounded="2xl" overflow="hidden" bg="white">
                <Box p={5} borderBottom="1px solid" borderColor="gray.200">
                    <Heading as="h2" fontSize="2xl" fontWeight="bold">{t('order_summary', { defaultValue: 'Order summary' })}</Heading>
                    <VStack align="start" mt={4}>
                        <HStack>
                            <Image src={booking.tour_image} alt="Tour" width={20} height={20} objectFit="cover" borderRadius="md" />
                            <Box flex={1}>
                                <Text fontSize="lg" fontWeight="bold">{booking.tour_title}</Text>
                                <Text>{numberFormat(booking.total_amount, false)} {booking.currency}</Text>
                            </Box>
                        </HStack>
                    </VStack>
                    <DataList.Root orientation="horizontal" mt={4}>
                        <DataList.Item>
                            <DataList.ItemLabel>
                                {t('location_label', { defaultValue: 'Location' })}
                            </DataList.ItemLabel>
                            <DataList.ItemValue display="flex" flexDirection="column" gap={1}>
                                <Text>{booking.tour_location}</Text>
                            </DataList.ItemValue>
                        </DataList.Item>
                        <DataList.Item>
                            <DataList.ItemLabel>
                                {t('start_time_label', { defaultValue: 'Start Time' })}
                            </DataList.ItemLabel>
                            <DataList.ItemValue display="flex" flexDirection="column" gap={1}>
                                <Text>{new Date(booking.start_date).toLocaleDateString(lng === 'vi' ? 'vi-VN' : 'en-US')} {booking.session_start_time ? `(${booking.session_start_time.substring(0, 5)})` : ''}</Text>
                            </DataList.ItemValue>
                        </DataList.Item>
                        {booking.session_end_time && (
                            <DataList.Item>
                                <DataList.ItemLabel>
                                    {t('end_time_label', { defaultValue: 'End Time' })}
                                </DataList.ItemLabel>
                                <DataList.ItemValue display="flex" flexDirection="column" gap={1}>
                                    <Text>{booking.session_end_time.substring(0, 5)}</Text>
                                </DataList.ItemValue>
                            </DataList.Item>
                        )}
                        <DataList.Item>
                            <DataList.ItemLabel>
                                {t('date_end_label', { defaultValue: 'Date end' })}
                            </DataList.ItemLabel>
                            <DataList.ItemValue display="flex" flexDirection="column" gap={1}>
                                {(() => {
                                    const d = new Date(booking.start_date);
                                    d.setDate(d.getDate() + Math.max(0, booking.duration_days - 1));
                                    return d.toLocaleDateString(lng === 'vi' ? 'vi-VN' : 'en-US');
                                })()}
                            </DataList.ItemValue>
                        </DataList.Item>
                        <DataList.Item>
                            <DataList.ItemLabel>
                                {t('duration_label', { defaultValue: 'Duration days' })}
                            </DataList.ItemLabel>
                            <DataList.ItemValue display="flex" flexDirection="column" gap={1}>
                                {booking.duration_days}
                            </DataList.ItemValue>
                        </DataList.Item>
                        <DataList.Item>
                            <DataList.ItemLabel>
                                {t('details_label', { defaultValue: 'Details' })}
                            </DataList.ItemLabel>
                            <DataList.ItemValue display="flex" flexDirection="column" gap={1} width="full">
                                {booking.items.map((item, idx) => (
                                    <HStack key={idx} justify="space-between" w="full">
                                        <Text>{item.quantity} x {item.pax_type_name}</Text>
                                        <Text>{numberFormat(item.total_amount, false)} {booking.currency}</Text>
                                    </HStack>
                                ))}
                            </DataList.ItemValue>
                        </DataList.Item>
                    </DataList.Root>
                </Box>
                <HStack justify="space-between" p={8} align="flex-start">
                    <Heading as="h3" fontSize="xl" fontWeight="bold">{t('total_label', { defaultValue: 'Total' })}</Heading>
                    <VStack align="end">
                        <Text fontSize="xl" fontWeight="bold">{numberFormat(booking.total_amount, false)} {booking.currency}</Text>
                        <Text fontSize="sm" color="fg.muted">{t('taxes_included', { defaultValue: 'All taxes and fees included' })}</Text>
                    </VStack>
                </HStack>
            </Box>
            {booking.policy && (
                <Box p={5} boxShadow="sm" rounded="2xl" mb={4}>
                    <Heading as="h3" fontSize="lg" fontWeight="bold" color="blue.800" mb={3}>
                        {t('refund_policy_title', { defaultValue: "Cancellation & Refund Policy" })}: {booking.policy.name}
                    </Heading>
                    <Stack gap={2}>
                        {([...(booking.policy.rules || [])]).sort((a, b) => b.before_hours - a.before_hours).map((rule, idx) => {
                            const isDayMultiple = rule.before_hours > 0 && rule.before_hours % 24 === 0;
                            const days = rule.before_hours / 24;

                            return (
                                <Flex key={idx} justify="space-between" fontSize="sm">
                                    <Text>
                                        {rule.before_hours === 0
                                            ? t('cancel_anytime')
                                            : isDayMultiple
                                                ? t('cancel_before_days', { count: days })
                                                : t('cancel_before_hours', { count: rule.before_hours })
                                        }
                                    </Text>
                                    <Text fontWeight="bold" color={rule.fee_pct === 0 ? "green.600" : "red.600"}>
                                        {rule.fee_pct === 0
                                            ? t('free_cancellation')
                                            : t('cancellation_fee_pct', { pct: rule.fee_pct })
                                        }
                                    </Text>
                                </Flex>
                            );
                        })}
                    </Stack>
                </Box>
            )}
        </VStack>
    );
};
