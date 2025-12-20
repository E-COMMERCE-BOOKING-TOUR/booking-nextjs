import { Box, Heading, VStack, HStack, Image, Text, DataList } from "@chakra-ui/react";
import { IBookingDetail } from "@/types/booking";
import { numberFormat } from "@/libs/function";

export const BookingSummaryCard = ({ booking }: { booking: IBookingDetail }) => {
    return (
        <Box boxShadow="sm" rounded="2xl" overflow="hidden" bg="white">
            <Box p={5} borderBottom="1px solid" borderColor="gray.200">
                <Heading as="h2" fontSize="2xl" fontWeight="bold">Order summary</Heading>
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
                            Location
                        </DataList.ItemLabel>
                        <DataList.ItemValue display="flex" flexDirection="column" gap={1}>
                            {/* Note: tour_location might be missing in some IBookingDetail definitions, checking usage */}
                            <Text>{booking.tour_location}</Text>
                        </DataList.ItemValue>
                    </DataList.Item>
                    <DataList.Item>
                        <DataList.ItemLabel>
                            Date start
                        </DataList.ItemLabel>
                        <DataList.ItemValue display="flex" flexDirection="column" gap={1}>
                            {new Date(booking.start_date).toLocaleDateString()}
                        </DataList.ItemValue>
                    </DataList.Item>
                    <DataList.Item>
                        <DataList.ItemLabel>
                            Date end
                        </DataList.ItemLabel>
                        <DataList.ItemValue display="flex" flexDirection="column" gap={1}>
                            {(() => {
                                const d = new Date(booking.start_date);
                                d.setDate(d.getDate() + Math.max(0, booking.duration_days - 1));
                                return d.toLocaleDateString();
                            })()}
                        </DataList.ItemValue>
                    </DataList.Item>
                    <DataList.Item>
                        <DataList.ItemLabel>
                            Duration days
                        </DataList.ItemLabel>
                        <DataList.ItemValue display="flex" flexDirection="column" gap={1}>
                            {booking.duration_days}
                        </DataList.ItemValue>
                    </DataList.Item>
                    <DataList.Item>
                        <DataList.ItemLabel>
                            Details
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
                <Heading as="h3" fontSize="xl" fontWeight="bold">Total</Heading>
                <VStack align="end">
                    <Text fontSize="xl" fontWeight="bold">{numberFormat(booking.total_amount, false)} {booking.currency}</Text>
                    <Text fontSize="sm" color="fg.muted">All taxes and fees included</Text>
                </VStack>
            </HStack>
        </Box>
    );
};
