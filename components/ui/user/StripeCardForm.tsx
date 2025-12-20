import { Box, Button, VStack, Text, Stack, SimpleGrid, Icon, Field } from "@chakra-ui/react";
import { CardNumberElement, CardExpiryElement, CardCvcElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import { StripeCardNumberElement } from "@stripe/stripe-js";
import { InputUser } from "./form/input";
import { FaLock, FaCreditCard, FaRegCalendarAlt, FaShieldAlt } from "react-icons/fa";

interface Props {
    onSuccess: (token: string) => void;
    currency?: string;
}

const ELEMENT_OPTIONS = {
    style: {
        base: {
            fontSize: '16px',
            color: '#1a202c',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSmoothing: 'antialiased',
            '::placeholder': {
                color: '#a0aec0',
            },
        },
        invalid: {
            color: '#e53e3e',
            iconColor: '#e53e3e',
        },
    },
};

export const StripeCardForm = ({ onSuccess, currency = 'vnd' }: Props) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [cardHolderName, setCardHolderName] = useState("");

    const handleSubmit = async () => {
        if (!stripe || !elements) {
            setError("Stripe has not loaded yet.");
            return;
        }

        if (!cardHolderName.trim()) {
            setError("Please enter the card holder name.");
            return;
        }

        setLoading(true);
        setError(null);

        const cardNumberElement = elements.getElement(CardNumberElement);

        if (!cardNumberElement) {
            setError("Card number element not found.");
            setLoading(false);
            return;
        }

        try {
            const { error: stripeError, token } = await stripe.createToken(
                cardNumberElement as StripeCardNumberElement,
                {
                    name: cardHolderName,
                    currency: currency.toLowerCase(),
                }
            );

            if (stripeError) {
                setError(stripeError.message || "An error occurred");
            } else if (token) {
                onSuccess(token.id);
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };
    console.log(cardHolderName)

    return (
        <Box
            p={6}
            borderRadius="2xl"
            bg="white"
            border="1px solid"
            borderColor="gray.100"
            boxShadow="sm"
            width="100%"
        >
            <VStack align="stretch" gap={6}>
                <Stack gap={1}>
                    <Text fontWeight="bold" fontSize="lg" color="gray.800">Add New Card</Text>
                    <Text fontSize="sm" color="gray.500">Your payment information is encrypted and secure.</Text>
                </Stack>

                <VStack gap={4} align="stretch">
                    <InputUser
                        label="Card Holder Name"
                        onBlur={(e) => setCardHolderName(e.target.value)}
                        isRequired
                    />

                    <Field.Root required width="full">
                        <Field.Label display="flex" alignItems="center" gap={2}>
                            <Icon as={FaCreditCard} color="gray.400" />
                            Card Number
                        </Field.Label>
                        <Box
                            w="full"
                            px={4}
                            py={3}
                            border="1px solid"
                            borderColor="gray.200"
                            borderRadius="lg"
                            bg="white"
                            transition="all 0.2s"
                            _focusWithin={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                            _hover={{ borderColor: "gray.300" }}
                        >
                            <CardNumberElement options={ELEMENT_OPTIONS} />
                        </Box>
                    </Field.Root>

                    <SimpleGrid columns={2} gap={4} width="full">
                        <Field.Root required width="full">
                            <Field.Label display="flex" alignItems="center" gap={2}>
                                <Icon as={FaRegCalendarAlt} color="gray.400" />
                                Expiry Date
                            </Field.Label>
                            <Box
                                w="full"
                                px={4}
                                py={3}
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="lg"
                                bg="white"
                                transition="all 0.2s"
                                _focusWithin={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                                _hover={{ borderColor: "gray.300" }}
                            >
                                <CardExpiryElement options={ELEMENT_OPTIONS} />
                            </Box>
                        </Field.Root>

                        <Field.Root required width="full">
                            <Field.Label display="flex" alignItems="center" gap={2}>
                                <Icon as={FaShieldAlt} color="gray.400" />
                                CVC / CVV
                            </Field.Label>
                            <Box
                                w="full"
                                px={4}
                                py={3}
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="lg"
                                bg="white"
                                transition="all 0.2s"
                                _focusWithin={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                                _hover={{ borderColor: "gray.300" }}
                            >
                                <CardCvcElement options={ELEMENT_OPTIONS} />
                            </Box>
                        </Field.Root>
                    </SimpleGrid>
                </VStack>

                {error && (
                    <Box p={3} bg="red.50" borderRadius="lg" border="1px solid" borderColor="red.100">
                        <Text color="red.600" fontSize="sm" fontWeight="medium">{error}</Text>
                    </Box>
                )}

                <Button
                    size="lg"
                    type="button"
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={!stripe}
                    colorPalette="blue"
                    width="100%"
                    borderRadius="xl"
                >
                    Securely Save Card
                </Button>
            </VStack>
        </Box>
    );
};
