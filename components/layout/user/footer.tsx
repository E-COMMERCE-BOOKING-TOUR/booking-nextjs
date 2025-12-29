"use client";
import {
  Box,
  Container,
  Grid,
  HStack,
  Link,
  Text,
  VStack,
  Heading,
  Icon,
} from "@chakra-ui/react";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaCcVisa, FaCcMastercard, FaCcPaypal, FaGooglePay, FaApplePay } from "react-icons/fa";
import { SiteSettings } from "@/apis/admin/settings";
import { useTranslation } from "@/libs/i18n/client";
import { fallbackLng } from "@/libs/i18n/settings";
import { useSearchParams } from "next/navigation";

const FooterLink = ({ children, href = "#" }: { children: React.ReactNode; href?: string }) => (
  <Link
    href={href}
    fontSize="sm"
    color="whiteAlpha.700"
    transition="all 0.2s"
    _hover={{ color: "white", textDecoration: "none", opacity: 0.8 }}
  >
    {children}
  </Link>
);

const SocialButton = ({ icon, label, href }: { icon: React.ElementType; label: string; href?: string | null }) => {
  if (!href) return null;

  return (
    <Link
      href={href}
      target="_blank"
      aria-label={label}
      color="whiteAlpha.700"
      borderRadius="full"
      p={4}
      _hover={{ color: "white", bg: "whiteAlpha.200" }}
    >
      <Icon as={icon} />
    </Link>
  );
};

interface FooterProps {
  settings?: SiteSettings | null;
  lng?: string;
}

export default function UserFooter({ settings, lng: propLng }: FooterProps) {
  const searchParams = useSearchParams();
  const lng = propLng || searchParams?.get('lng') || fallbackLng;
  const { t } = useTranslation(lng as string);

  const companyTitle = settings?.company_name || "TOURGUIDE";

  return (
    <Box
      bg="main"
      color="white"
      pt={{ base: 16, md: 36 }}
      pb={10}
      mt={{ base: "-30px", md: "-20px" }}
      position="relative"
      zIndex={10}
      className="footer-clip-path"
    >
      <Container maxW="xl" pt={10}>
        <Grid
          templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }}
          gap={{ base: 12, md: 12 }}
          mb={12}
          textAlign={{ base: "center", md: "left" }}
        >
          {/* Column 1: Brand & Payments */}
          <VStack align={{ base: "center", md: "stretch" }} gap={6}>
            <VStack align={{ base: "center", md: "stretch" }} gap={5}>
              <Heading size="md" fontWeight="black" letterSpacing="tighter" textTransform="uppercase">
                {companyTitle.includes(' ') ? (
                  <>
                    {companyTitle.split(' ')[0]}
                    <Text as="span" color="secondary">{companyTitle.split(' ').slice(1).join(' ')}</Text>
                  </>
                ) : (
                  <>
                    {companyTitle}
                    <Text as="span" color="secondary">GUIDE</Text>
                  </>
                )}
              </Heading>
              <Text color="whiteAlpha.800" fontSize="sm" lineHeight="tall" maxW="320px">
                {settings?.footer_description || t('footer_description_default', { defaultValue: "Experience the beauty of Vietnam with local experts. Reliable, dedicated and professional." })}
              </Text>
              <HStack gap={1} justify={{ base: "center", md: "flex-start" }}>
                <SocialButton icon={FaFacebookF} label="Facebook" href={settings?.facebook_url} />
                <SocialButton icon={FaInstagram} label="Instagram" href={settings?.instagram_url} />
                <SocialButton icon={FaTwitter} label="Twitter" href={settings?.twitter_url} />
                <SocialButton icon={FaYoutube} label="YouTube" href={settings?.youtube_url} />
              </HStack>
            </VStack>

            <Box pt={2}>
              <Text fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest" color="secondary" mb={3}>{t('secure_payment', { defaultValue: 'Secure Payment' })}</Text>
              <HStack gap={4} color="whiteAlpha.400" flexWrap="wrap" justify={{ base: "center", md: "flex-start" }}>
                <Icon as={FaCcVisa} w={6} h={6} />
                <Icon as={FaCcMastercard} w={6} h={6} />
                <Icon as={FaCcPaypal} w={6} h={6} />
                <Icon as={FaGooglePay} w={8} h={8} />
                <Icon as={FaApplePay} w={8} h={8} />
              </HStack>
            </Box>
          </VStack>

          {/* Column 2: Destinations */}
          <VStack align={{ base: "center", md: "stretch" }} gap={4}>
            <Text fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest" color="secondary">{t('contact_us', { defaultValue: 'Contact Us' })}</Text>
            <VStack align={{ base: "center", md: "stretch" }} gap={2} fontSize="sm" color="whiteAlpha.700">
              <Text>{settings?.address}</Text>
              <Text>{settings?.phone}</Text>
              <Text>{settings?.email}</Text>
            </VStack>
          </VStack>

          {/* Column 3: Support */}
          <VStack align={{ base: "center", md: "stretch" }} gap={4}>
            <Text fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest" color="secondary">{t('support', { defaultValue: 'Support' })}</Text>
            <VStack align={{ base: "center", md: "stretch" }} gap={2}>
              <FooterLink href="/page/about-us">{t('about_us', { defaultValue: 'About Us' })}</FooterLink>
              <FooterLink href="/page/faqs">{t('faqs', { defaultValue: 'FAQs' })}</FooterLink>
              <FooterLink href="/page/privacy-policy">{t('privacy_policy', { defaultValue: 'Privacy Policy' })}</FooterLink>
              <FooterLink href="/page/terms-of-use">{t('terms_of_use', { defaultValue: 'Terms of Use' })}</FooterLink>
            </VStack>
          </VStack>
        </Grid>

        {/* Bottom Section */}
        <Box pt={8} borderTop="1px solid" borderColor="whiteAlpha.100">
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} alignItems="center" textAlign={{ base: "center", md: "left" }}>
            <Text fontSize="10px" color="whiteAlpha.500" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">
              {settings?.copyright_text || `© ${new Date().getFullYear()} Tour Guide. ${t('all_rights_reserved', { defaultValue: 'All rights reserved.' })}`}
            </Text>
            <HStack gap={6} justify={{ base: "center", md: "flex-end" }}>
              <Link href="/page/terms-of-use" fontSize="10px" color="whiteAlpha.400" fontWeight="bold" textTransform="uppercase" _hover={{ color: "white" }}>{t('terms', { defaultValue: 'Terms' })}</Link>
              <Link href="/page/privacy-policy" fontSize="10px" color="whiteAlpha.400" fontWeight="bold" textTransform="uppercase" _hover={{ color: "white" }}>{t('privacy', { defaultValue: 'Privacy' })}</Link>
              <Link fontSize="10px" color="whiteAlpha.400" fontWeight="bold" textTransform="uppercase" _hover={{ color: "white" }}>{t('sitemap', { defaultValue: 'Sitemap' })}</Link>
            </HStack>
          </Grid>
        </Box>
      </Container>
    </Box >
  );
}
