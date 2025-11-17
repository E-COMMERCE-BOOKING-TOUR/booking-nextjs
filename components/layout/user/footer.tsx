import { Box, Container, Grid, HStack, Link, Text, VStack } from "@chakra-ui/react";

const FooterLink = ({ children }: { children: React.ReactNode }) => (
  <Link fontSize="sm" color="whiteAlpha.800" _hover={{ color: "white" }}>
    {children}
  </Link>
);

const PaymentIcon = ({ alt }: { alt: string }) => (
  <Box w="50px" h="32px" bg="white" borderRadius="md" display="flex" alignItems="center" justifyContent="center" p={1}>
    <Text fontSize="xs" fontWeight="bold" color="gray.700">{alt}</Text>
  </Box>
);

export default function UserFooter() {
  return (
    <Box bg="tertiary" color="white" py={12} pt={16}>
      <Container maxW="2xl">
        <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }} gap={8} mb={12}>
          {/* Company */}
          <VStack align="stretch" gap={2}>
            <Text fontSize="sm" fontWeight="semibold" mb={2}>Company</Text>
            <FooterLink>About Us</FooterLink>
            <FooterLink>Blog</FooterLink>
            <FooterLink>Press Room</FooterLink>
            <FooterLink>Careers</FooterLink>
          </VStack>

          {/* Help */}
          <VStack align="stretch" gap={2}>
            <Text fontSize="sm" fontWeight="semibold" mb={2}>Help</Text>
            <FooterLink>Contact us</FooterLink>
            <FooterLink>FAQs</FooterLink>
            <FooterLink>Terms and conditions</FooterLink>
            <FooterLink>Privacy policy</FooterLink>
            <FooterLink>Sitemap</FooterLink>
          </VStack>

          {/* Payment & Company Info */}
          <VStack align="stretch" gap={6}>
            <VStack align="stretch" gap={3}>
              <Text fontSize="sm" fontWeight="semibold">Payment methods possible</Text>
              <HStack flexWrap="wrap" gap={2}>
                <PaymentIcon alt="MC" />
                <PaymentIcon alt="BP" />
                <PaymentIcon alt="VISA" />
                <PaymentIcon alt="AMEX" />
                <PaymentIcon alt="DIS" />
                <PaymentIcon alt="SF" />
                <PaymentIcon alt="GP" />
                <PaymentIcon alt="AP" />
                <PaymentIcon alt="PP" />
                <PaymentIcon alt="ME" />
              </HStack>
            </VStack>
            <VStack align="stretch" gap={2}>
              <Text fontSize="sm" fontWeight="semibold">Company</Text>
              <FooterLink>Become a Tour guide for Us</FooterLink>
            </VStack>
          </VStack>
        </Grid>

        {/* Bottom Section */}
        <Box pt={8} borderTop="1px solid" borderColor="whiteAlpha.300">
          <HStack justify="space-between" align="center">
            <Text fontSize="sm" color="whiteAlpha.700">
              Copyright 2025 Tour Guide. All Rights Reserved
            </Text>
          </HStack>
        </Box>
      </Container>
    </Box>
  );
}
