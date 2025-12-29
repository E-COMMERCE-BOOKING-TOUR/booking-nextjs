import { Heading, Text, VStack } from "@chakra-ui/react";
import { cookies } from "next/headers";
import { cookieName, fallbackLng } from "@/libs/i18n/settings";
import { createTranslation } from "@/libs/i18n";

export default async function Header() {
  const cookieStore = await cookies();
  const lng = cookieStore.get(cookieName)?.value || fallbackLng;
  const { t } = await createTranslation(lng);

  return <VStack marginY="15rem">
    <Heading as="h1" size="4xl" fontWeight="bold">
      {t('hero_title', { defaultValue: "Welcome to TripConnect's Travel Platform" })}
    </Heading>
    <Text>
      {t('hero_description', { defaultValue: "Discover the best destinations for your next trip with TripConnect's Travel Platform" })}
    </Text>
  </VStack >
}
