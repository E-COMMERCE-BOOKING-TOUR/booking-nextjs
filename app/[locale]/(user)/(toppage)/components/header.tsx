import { Heading, Text, VStack } from "@chakra-ui/react";
import { getTranslations } from "next-intl/server";

export default async function Header() {
  const t = await getTranslations('common');

  return <VStack marginY="15rem">
    <Heading as="h1" size="4xl" fontWeight="bold">
      {t('hero_title', { defaultValue: "Welcome to TripConnect's Travel Platform." })}
    </Heading>
    <Text>
      {t('hero_description', { defaultValue: "Discover the best destinations for your next trip with TripConnect's Travel Platform" })}
    </Text>
  </VStack >
}
