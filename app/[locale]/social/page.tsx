import { Box, Tabs, Heading, Text, VStack } from "@chakra-ui/react";
import ForYou from "./component/ForYou";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
    const { locale: lng } = await params;
    const t = await getTranslations('common');

    return (
        <Box w={'full'}>
            {/* Social Hero Section */}
            <Box
                w="full"
                h={{ base: "200px", md: "300px" }}
                position="relative"
                borderRadius="xl"
                overflow="hidden"
                mb={6}
                boxShadow="xl"
            >
                <Box
                    bgImage="url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')"
                    bgSize="cover"
                    bgPos="center"
                    w="full"
                    h="full"
                    transition="transform 0.5s ease-out"
                    _hover={{ transform: "scale(1.05)" }}
                />
                <Box
                    position="absolute"
                    inset={0}
                    bg="linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))"
                />
                <VStack
                    position="absolute"
                    bottom={0}
                    left={0}
                    p={{ base: 6, md: 10 }}
                    align="start"
                    gap={2}
                    w="full"
                >
                    <Heading as="h1" size="4xl" color="white" fontWeight="black" letterSpacing="tight">
                        {t('social_hub_title', { defaultValue: 'Travel Social Hub' })}
                    </Heading>
                    <Text color="whiteAlpha.900" fontSize="lg" fontWeight="medium" maxW="500px">
                        {t('social_hub_desc', { defaultValue: 'Share your journey, discover new horizons, and connect with fellow explorers.' })}
                    </Text>
                </VStack>
            </Box>

            <Tabs.Root w={'full'} defaultValue="foryou" variant="line">
                <Box position="sticky" top="-20px" zIndex={50} backdropFilter="blur(12px)" bg="gray.100/70" py={2} mb={4} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.300">
                    <Tabs.List w={'full'} gap={{ base: 4, md: 8 }} borderBottom="none" px={4}>
                        <Tabs.Trigger
                            value="foryou"
                            h={12}
                            color="gray.500"
                            _selected={{
                                color: 'main',
                                _after: {
                                    transform: 'scaleX(1)',
                                }
                            }}
                            position="relative"
                            fontSize="lg"
                            fontWeight="bold"
                            px={2}
                            _after={{
                                content: '""',
                                position: 'absolute',
                                bottom: '-2px',
                                left: 0,
                                w: 'full',
                                h: '3px',
                                bg: 'main',
                                borderRadius: 'full',
                                transition: 'transform 0.2s',
                                transform: 'scaleX(0)',
                            }}
                        >
                            {t('for_you', { defaultValue: 'For you' })}
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            value="following"
                            h={12}
                            color="gray.500"
                            _selected={{
                                color: 'main',
                                _after: {
                                    transform: 'scaleX(1)',
                                }
                            }}
                            position="relative"
                            fontSize="lg"
                            fontWeight="bold"
                            px={2}
                            _after={{
                                content: '""',
                                position: 'absolute',
                                bottom: '-2px',
                                left: 0,
                                w: 'full',
                                h: '3px',
                                bg: 'main',
                                borderRadius: 'full',
                                transition: 'transform 0.2s',
                                transform: 'scaleX(0)',
                            }}
                        >
                            {t('following', { defaultValue: 'Following' })}
                        </Tabs.Trigger>
                    </Tabs.List>
                </Box>
                <Box px={0}>
                    <Tabs.Content value="foryou">
                        <ForYou mode="foryou" />
                    </Tabs.Content>
                    <Tabs.Content value="following">
                        <ForYou mode="following" />
                    </Tabs.Content>
                </Box>
            </Tabs.Root>
        </Box>
    );
}
