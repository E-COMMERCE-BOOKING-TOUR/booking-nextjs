"use client";

import type { ReactNode } from "react";
import { Box, Button, Container, Grid, Steps, GridItem, Alert, Text, Heading, Stack, Flex, Checkbox, DataList, VStack, Image, HStack, RadioGroup, Icon, Input, Badge } from "@chakra-ui/react";
import { InputUser } from "@/components/ui/user/form/input";
import { InfoTip } from "@/components/chakra/toggleTip";
import { FaCheckCircle } from "react-icons/fa";
import type { IconType } from "react-icons";

const steps = [
    { title: "Traveler details", description: "Provide traveler and participant information" },
    { title: "Payment", description: "Securely complete your purchase" },
    { title: "Confirmation", description: "Review your tickets and next steps" },
];

const paymentMethods: { value: string; title: string; description: string; }[] = [
    {
        value: "card",
        title: "Credit or debit card",
        description: "Visa, Mastercard, Amex, JCB",
    },
    {
        value: "wallet",
        title: "E-wallet or QR payment",
        description: "MoMo, ZaloPay, VNPay",
    },
    {
        value: "bank",
        title: "Bank transfer",
        description: "Processing may take up to 24h",
    },
];

const whatsNext: { title: string; description: string; }[] = [
    {
        title: "E-voucher sent to your inbox",
        description: "We emailed your tickets and receipt to hello@traveler.com.",
    },
    {
        title: "Add the tour to your calendar",
        description: "Reminder set for Friday, October 31, 2025 at 11:40 AM.",
    },
    {
        title: "We're here if you need us",
        description: "Call us any time at +84 96 000 888 for urgent changes.",
    },
];

export default function Checkout() {
    return <Container maxW="2xl">
        <Steps.Root count={steps.length}>
            <Steps.List mx="5rem" my={8}>
                {steps.map((step, index) => (
                    <Steps.Item key={index} index={index} title={step.title}>
                        <Steps.Indicator />
                        <Box>
                            <Steps.Title>{step.title}</Steps.Title>
                            <Steps.Description>{step.description}</Steps.Description>
                        </Box>
                        <Steps.Separator />
                    </Steps.Item>
                ))}
            </Steps.List>
            <Alert.Root status="info" title="Timed reservation">
                <Alert.Indicator />
                <Alert.Title>We'll hold your spot for <Text as="span" fontWeight="bold">14:15 minutes</Text></Alert.Title>
            </Alert.Root>
            <Steps.Content index={0} mb={8}>
                <Grid templateColumns="repeat(6, 1fr)" gap={4}>
                    <GridItem as={Flex} flexDirection="column" colSpan={{ base: 6, xl: 4 }} gap={4}>
                        <Box bg="white" p={8} borderRadius="15px">
                            <Heading as="h2" fontSize="2xl" fontWeight="bold">Enter your personal details</Heading>
                            <Stack mt={4}>
                                <InputUser label="Full name" placeholder="Enter your full name" isRequired />
                                <InputUser label="Email" placeholder="Enter your email" isRequired />
                                <InputUser label="Phone" placeholder="+84 90 123 4567" isRequired helperText="We'll only contact you with essential updates or changes to your booking" />
                            </Stack>
                        </Box>
                        <Box bg="white" p={8} borderRadius="15px">
                            <Heading as="h2" fontSize="2xl" fontWeight="bold">Traveler details</Heading>
                            <Stack mt={4} gap={4}>
                                <Stack gap={1}>
                                    <InputUser label="Adult 1" placeholder="Full legal name" isRequired />
                                    <InputUser placeholder="Phone number" />
                                </Stack>
                                <Stack gap={1}>
                                    <InputUser label="Adult 2" placeholder="Full legal name" isRequired />
                                    <InputUser placeholder="Phone number" />
                                </Stack>
                                <Stack gap={1}>
                                    <InputUser label="Child 1" placeholder="Full legal name" isRequired />
                                    <InputUser placeholder="Phone number" />
                                </Stack>
                            </Stack>

                            <Checkbox.Root gap="4" alignItems="flex-start" mt={4}>
                                <Checkbox.HiddenInput />
                                <Checkbox.Control />
                                <Stack gap="1">
                                    <Checkbox.Label>I agree to the terms and conditions</Checkbox.Label>
                                    <Box textStyle="sm" color="fg.muted">
                                        By clicking this, you agree to our Terms and Privacy Policy.
                                    </Box>
                                </Stack>
                            </Checkbox.Root>
                        </Box>
                    </GridItem>
                    <GridItem colSpan={{ base: 6, xl: 2 }}>
                        <SummaryAside>
                            <Steps.NextTrigger asChild>
                                <Button w="100%" borderRadius="15px" paddingY={6}>Continue to payment</Button>
                            </Steps.NextTrigger>
                        </SummaryAside>
                    </GridItem>
                </Grid>
            </Steps.Content>
            <Steps.Content index={1} mb={8}>
                <Grid templateColumns="repeat(6, 1fr)" gap={4}>
                    <GridItem as={Stack} colSpan={{ base: 6, xl: 4 }} gap={4}>
                        <Box bg="white" p={8} borderRadius="15px">
                            <Heading as="h2" fontSize="2xl" fontWeight="bold">Choose how you'd like to pay</Heading>
                            <Text mt={2} color="fg.muted">All transactions are encrypted and processed in VND.</Text>

                            <RadioGroup.Root>
                                <Stack gap={3} mt={6}>
                                    {paymentMethods.map((method) => (
                                        <RadioGroup.Item key={method.value} value={method.value}>
                                            <RadioGroup.ItemHiddenInput />
                                            <RadioGroup.ItemIndicator />
                                            <RadioGroup.ItemText>{method.title}</RadioGroup.ItemText>
                                        </RadioGroup.Item>
                                    ))}
                                </Stack>
                            </RadioGroup.Root>
                        </Box>

                        <Box bg="white" p={8} borderRadius="15px">
                            <Heading as="h2" fontSize="2xl" fontWeight="bold">Payment details</Heading>
                            <Stack mt={6} gap={4}>
                                <InputUser label="Cardholder name" placeholder="Enter name exactly as it appears on card" isRequired />
                                <InputUser label="Card number" placeholder="1234 5678 9012 3456" isRequired />
                                <Grid templateColumns={{ base: "repeat(1,1fr)", md: "repeat(2, 1fr)" }} gap={4}>
                                    <InputUser label="Expiration date" placeholder="MM / YY" isRequired />
                                    <InputUser label="CVV" placeholder="3-digit code" isRequired helperText="We never store this code." />
                                </Grid>
                                <InputUser label="Billing address" placeholder="Street, city, country" />
                            </Stack>

                            <Flex mt={6} gap={4} align="flex-start" border="1px solid" borderColor="gray.200" borderRadius="15px" p={4}>
                                {/* <Icon as={HiOutlineShieldCheck} boxSize={6} color="green.500" /> */}
                                <Box>
                                    <Text fontWeight="semibold">Your payment is secured</Text>
                                    <Text fontSize="sm" color="fg.muted">We use 256-bit SSL encryption and comply with PCI DSS standards.</Text>
                                </Box>
                            </Flex>

                            <Checkbox.Root gap="4" alignItems="flex-start" mt={4}>
                                <Checkbox.HiddenInput />
                                <Checkbox.Control />
                                <Stack gap="1">
                                    <Checkbox.Label>Save this card for faster checkout next time</Checkbox.Label>
                                    <Box textStyle="sm" color="fg.muted">
                                        You can manage saved payment methods in your profile settings.
                                    </Box>
                                </Stack>
                            </Checkbox.Root>
                        </Box>
                    </GridItem>
                    <GridItem colSpan={{ base: 6, xl: 2 }}>
                        <SummaryAside>
                            <Box bg="white" borderRadius="15px" p={6}>
                                <Heading as="h3" fontSize="lg">Price breakdown</Heading>
                                <Stack mt={4} gap={3}>
                                    <Flex justify="space-between">
                                        <Text color="fg.muted">Tour price</Text>
                                        <Text>80,000 VND</Text>
                                    </Flex>
                                    <Flex justify="space-between">
                                        <Text color="fg.muted">Taxes & fees</Text>
                                        <Text>15,000 VND</Text>
                                    </Flex>
                                    <Flex justify="space-between">
                                        <Text color="fg.muted">Service protection</Text>
                                        <Text>5,000 VND</Text>
                                    </Flex>
                                </Stack>
                                <Flex justify="space-between" fontWeight="bold" mt={4}>
                                    <Text>Total due today</Text>
                                    <Text>100,000 VND</Text>
                                </Flex>
                            </Box>
                            <Stack direction={{ base: "column", md: "row" }} gap={3}>
                                <Steps.PrevTrigger asChild>
                                    <Button variant="outline">Back to details</Button>
                                </Steps.PrevTrigger>
                                <Steps.NextTrigger asChild>
                                    <Button flex={1} colorPalette="blue">Pay 100,000 VND</Button>
                                </Steps.NextTrigger>
                            </Stack>
                        </SummaryAside>
                    </GridItem>
                </Grid>
            </Steps.Content>
            <Steps.Content index={2} mb={8}>
                <Grid templateColumns="repeat(6, 1fr)" gap={4}>
                    <GridItem as={Stack} colSpan={{ base: 6, xl: 4 }} gap={4}>
                        <Box bg="white" p={8} borderRadius="15px">
                            <Stack gap={4}>
                                <Badge colorPalette="green" variant="solid" px={3} py={1} borderRadius="full" width="fit-content">
                                    Paid and confirmed
                                </Badge>
                                <Flex align="center" gap={4}>
                                    <Icon as={FaCheckCircle} boxSize={10} color="green.500" />
                                    <Box>
                                        <Heading as="h2" fontSize="2xl" fontWeight="bold">You're all set!</Heading>
                                        <Text color="fg.muted">Confirmation #HBX-20394</Text>
                                    </Box>
                                </Flex>
                                <Text color="fg.muted">
                                    We've sent the receipt and voucher to <Text as="span" fontWeight="semibold" color="fg.emphasized">hello@traveler.com</Text>. Present the QR code on arrival with a valid ID.
                                </Text>
                                <Stack direction={{ base: "column", md: "row" }} gap={3}>
                                    <Button flex={1} colorPalette="blue">View booking</Button>
                                    <Button flex={1} variant="outline">Download receipt</Button>
                                </Stack>
                            </Stack>
                        </Box>

                        <Box bg="white" p={8} borderRadius="15px">
                            <Heading as="h2" fontSize="2xl" fontWeight="bold">Booking overview</Heading>
                            <DataList.Root mt={6}>
                                <DataList.Item>
                                    <DataList.ItemLabel>Tour</DataList.ItemLabel>
                                    <DataList.ItemValue>
                                        Halong Bay cruise with seafood lunch
                                    </DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item>
                                    <DataList.ItemLabel>Date & time</DataList.ItemLabel>
                                    <DataList.ItemValue>Friday, October 31, 2025 - 11:40 AM</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item>
                                    <DataList.ItemLabel>Guests</DataList.ItemLabel>
                                    <DataList.ItemValue>1 adult - 1 child</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item>
                                    <DataList.ItemLabel>Payment method</DataList.ItemLabel>
                                    <DataList.ItemValue>Visa ending in 2002</DataList.ItemValue>
                                </DataList.Item>
                                <DataList.Item>
                                    <DataList.ItemLabel>Lead traveler</DataList.ItemLabel>
                                    <DataList.ItemValue>Nguyen Van A - +84 90 123 4567</DataList.ItemValue>
                                </DataList.Item>
                            </DataList.Root>
                        </Box>

                        <Box bg="white" p={8} borderRadius="15px">
                            <Heading as="h2" fontSize="2xl" fontWeight="bold">What's next</Heading>
                            <Stack mt={6} gap={4}>
                                {whatsNext.map((item) => (
                                    <Flex key={item.title} gap={4}>
                                        <Box bg="gray.50" p={3} borderRadius="full">
                                            {/* <Icon as={item.icon} boxSize={6} color="fg.muted" /> */}
                                        </Box>
                                        <Box>
                                            <Text fontWeight="semibold">{item.title}</Text>
                                            <Text fontSize="sm" color="fg.muted">{item.description}</Text>
                                        </Box>
                                    </Flex>
                                ))}
                            </Stack>
                        </Box>
                    </GridItem>
                    <GridItem colSpan={{ base: 6, xl: 2 }}>
                        <SummaryAside>
                            <Box bg="white" borderRadius="15px" p={6}>
                                <Heading as="h3" fontSize="lg">Need help?</Heading>
                                <Text mt={2} color="fg.muted">Our support team is available 24/7 for urgent changes.</Text>
                                <Stack mt={4} gap={3}>
                                    <Button variant="outline">Chat with support</Button>
                                    <Button variant="ghost">Call +84 96 000 888</Button>
                                </Stack>
                            </Box>

                            <Stack direction={{ base: "column", md: "row" }} gap={3}>
                                <Button flex={1} variant="outline">Download invoice (PDF)</Button>
                                <Button flex={1} colorPalette="green">Plan another trip</Button>
                            </Stack>
                        </SummaryAside>
                    </GridItem>
                </Grid>
            </Steps.Content>
            <Steps.CompletedContent>
                All steps are complete!
            </Steps.CompletedContent>
        </Steps.Root>
    </Container>;
}

const SummaryAside = ({ children }: { children?: ReactNode }) => {
    return <Box position="sticky" top={4}>
        <Stack gap={4}>
            <BookingSummaryCard />
            {children}
        </Stack>
    </Box>;
};

const BookingSummaryCard = () => {
    return <Box bg="white" borderRadius="15px">
        <Box p={8} border="1px solid" borderColor="gray.200">
            <Heading as="h2" fontSize="2xl" fontWeight="bold">Order summary</Heading>
            <VStack align="start" mt={4}>
                <HStack>
                    <Image src="/assets/images/icon.png" alt="Total" width={20} height={20} />
                    <Box flex={1}>
                        <Text fontSize="lg" fontWeight="bold">Total</Text>
                        <Text>100,000 VND</Text>
                    </Box>
                </HStack>
            </VStack>
            <DataList.Root orientation="horizontal" mt={4}>
                <DataList.Item>
                    <DataList.ItemLabel>
                        Pick-up location
                        <InfoTip>This is some info</InfoTip>
                    </DataList.ItemLabel>
                    <DataList.ItemValue display="flex" flexDirection="column" gap={1}>
                        <Text>Pick-up at Halong Port (without transfer from Hanoi)</Text>
                        <Text fontSize="sm" color="fg.muted">Language: VietNam</Text>
                    </DataList.ItemValue>
                </DataList.Item>
                <DataList.Item>
                    <DataList.ItemLabel>
                        Date
                        <InfoTip>This is some info</InfoTip>
                    </DataList.ItemLabel>
                    <DataList.ItemValue display="flex" flexDirection="column" gap={1}>
                        Friday, October 31, 2025 at 11:40 AM
                    </DataList.ItemValue>
                </DataList.Item>
                <DataList.Item>
                    <DataList.ItemLabel>
                        Guests
                        <InfoTip>This is some info</InfoTip>
                    </DataList.ItemLabel>
                    <DataList.ItemValue display="flex" flexDirection="column" gap={1}>
                        <Text>1 adult (Age 9 - 99)</Text>
                        <Text>1 child (Age 4 - 8)</Text>
                    </DataList.ItemValue>
                </DataList.Item>
            </DataList.Root>
        </Box>
        <HStack justify="space-between" p={8} align="flex-start">
            <Heading as="h3" fontSize="xl" fontWeight="bold">Total</Heading>
            <VStack align="end">
                <Text fontSize="xl" fontWeight="bold">100,000 VND</Text>
                <Text fontSize="sm" color="fg.muted">All taxes and fees included</Text>
            </VStack>
        </HStack>
    </Box>;
};
