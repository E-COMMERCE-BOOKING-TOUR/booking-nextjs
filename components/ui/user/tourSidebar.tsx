import { Box, Flex, Text, Stack, VStack } from "@chakra-ui/react";
import type { TourTestimonial } from "@/types/tour";
import { getTranslations } from "next-intl/server";

interface TourSidebarProps {
    score: number;
    scoreLabel: string;
    reviewCount: number;
    staffScore: number;
    testimonial?: TourTestimonial;
}

export default async function TourSidebar({
    score,
    scoreLabel,
    reviewCount,
    staffScore,
    testimonial,
}: TourSidebarProps) {
    const t = await getTranslations('common');
    return (
        <Stack gap={6} w="full">
            {/* Unified Score Board Card */}
            <Box
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                p={6}
                borderRadius="2xl"
                boxShadow="rgba(0, 0, 0, 0.04) 0px 10px 24px"
            >
                <VStack align="stretch" gap={6}>
                    <Flex justifyContent="space-between" alignItems="center">
                        <Box>
                            <Text fontSize="2xl" fontWeight="black" color="gray.800" letterSpacing="tight">
                                {scoreLabel}
                            </Text>
                            <Text fontSize="xs" fontWeight="black" color="main" textTransform="uppercase" letterSpacing="widest">
                                {t("found_tours", { count: reviewCount })}
                            </Text>
                        </Box>
                        <Box
                            bg="main"
                            px={5}
                            py={4}
                            borderRadius="2xl"
                            boxShadow="0 8px 16px rgba(0, 59, 149, 0.25)"
                        >
                            <Text fontSize="3xl" fontWeight="black" color="white" lineHeight="1">
                                {score.toFixed(1)}
                            </Text>
                        </Box>
                    </Flex>

                    <Box pt={4} borderTop="1px solid" borderColor="gray.100">
                        <Stack gap={4}>
                            <Flex justifyContent="space-between" alignItems="center">
                                <VStack align="start" gap={0}>
                                    <Text fontWeight="black" color="gray.700" fontSize="sm">{t("staff")}</Text>
                                    <Text fontSize="xs" color="gray.500" fontWeight="bold">{t("staff_desc")}</Text>
                                </VStack>
                                <Box bg="blue.50" color="main" px={3} py={1} borderRadius="lg" fontWeight="black" fontSize="sm">
                                    {staffScore.toFixed(1)}
                                </Box>
                            </Flex>

                            <Flex justifyContent="space-between" alignItems="center">
                                <VStack align="start" gap={0}>
                                    <Text fontWeight="black" color="gray.700" fontSize="sm">{t("value_for_money")}</Text>
                                    <Text fontSize="xs" color="gray.500" fontWeight="bold">{t("value_for_money_desc")}</Text>
                                </VStack>
                                <Box bg="blue.50" color="main" px={3} py={1} borderRadius="lg" fontWeight="black" fontSize="sm">
                                    8.9
                                </Box>
                            </Flex>
                        </Stack>
                    </Box>
                </VStack>
            </Box>

            {testimonial && testimonial.text && (
                <Box
                    p={6}
                    bg="gray.50"
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor="gray.200"
                    position="relative"
                >
                    <Box
                        position="absolute"
                        top="-10px"
                        left="24px"
                        bg="main"
                        color="white"
                        fontSize="10px"
                        fontWeight="black"
                        px={3}
                        py={1}
                        rounded="full"
                        textTransform="uppercase"
                        boxShadow="md"
                    >
                        {t("guest_favorite")}
                    </Box>
                    <Text fontSize="sm" color="gray.700" mt={2} mb={5} fontStyle="italic" lineHeight="relaxed" fontWeight="medium">
                        &ldquo;{testimonial.text}&rdquo;
                    </Text>
                    <Flex gap={4} alignItems="center">
                        <Box
                            bg="white"
                            color="main"
                            borderRadius="full"
                            w={12}
                            h={12}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontWeight="black"
                            fontSize="md"
                            boxShadow="sm"
                            border="2px solid"
                            borderColor="main"
                            flexShrink={0}
                        >
                            {testimonial.name.charAt(0)}
                        </Box>
                        <Box>
                            <Text fontSize="sm" fontWeight="black" color="gray.800" lineClamp={1}>
                                {testimonial.name}
                            </Text>
                            <Text fontSize="xs" color="gray.500" fontWeight="black" textTransform="uppercase" letterSpacing="wider" lineClamp={1}>
                                {testimonial.country}
                            </Text>
                        </Box>
                    </Flex>
                </Box>
            )}
        </Stack>
    );
}
