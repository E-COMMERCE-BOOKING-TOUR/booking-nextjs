import { Button, Flex, Menu, HStack, Box } from '@chakra-ui/react';
import { NotificationBell } from './notificationBell';
import { Header } from './header';
import NextLink from 'next/link';
import bookingApi from '@/apis/booking';
import { IBookingDetail } from '@/types/booking';
import { ResumeBookingButton } from './resumeBookingButton';

import { auth } from '@/libs/auth/auth';
import { IUserAuth } from '@/types/response/auth.type';
import { MobileDrawer } from './navMobileDrawer';
import { LogoutButton } from './logoutButton';
import { SiteSettings } from '@/apis/admin/settings';
import { cookies } from 'next/headers';
import { cookieName, fallbackLng } from '@/libs/i18n/settings';
import { createTranslation } from '@/libs/i18n';
import { LanguageSwitcher } from '@/components/ui/user/LanguageSwitcher';
import { Logo, MenuLinks } from './navCommon';

interface NavbarProps {
  settings?: SiteSettings | null;
}

export default async function UserNavbar({ settings }: NavbarProps) {
  const cookieStore = await cookies();
  const lng = cookieStore.get(cookieName)?.value || fallbackLng;
  const { t } = await createTranslation(lng);

  const navItems: { name: string, link: string }[] = [
    {
      name: t('home', { defaultValue: 'Home' }),
      link: '/',
    },
    {
      name: t('about_us', { defaultValue: 'About us' }),
      link: '/page/about-us',
    },
    {
      name: t('popular_articles', { defaultValue: 'Popular Articles' }),
      link: '/social',
    },
  ];

  const session = await auth();
  const user = session?.user as (IUserAuth & { accessToken?: string }) | undefined;
  const isLoggedIn = !!user;

  let activeBooking: IBookingDetail | null = null;
  if (isLoggedIn && user?.accessToken) {
    try {
      const res = await bookingApi.getCurrent(user.accessToken);
      if (res.ok) {
        activeBooking = res.data;
      }
    } catch (error) {
      console.error("Failed to fetch active booking:", error);
    }
  }

  return (
    <>
      <Header>
        <NextLink href="/">
          <Logo logoUrl={settings?.logo_url} />
        </NextLink>

        {/* Desktop Menu - Centered */}
        <Box display={{ base: "none", md: "block" }} flex={1} paddingX={8}>
          <Flex justify="center">
            <MenuLinks items={navItems} />
          </Flex>
        </Box>

        <HStack gap={3}>
          <LanguageSwitcher lng={lng} />
          {/* Authentication Buttons */}
          <Flex gap={2} alignItems="center">
            {isLoggedIn ? (
              <>
                <NotificationBell lng={lng} />
                <ResumeBookingButton booking={activeBooking} mr={2} lng={lng} />
                <UserMenu user={user} t={t} lng={lng} />
              </>
            ) : (
              <>
                <Box display={{ base: "none", sm: "block" }}>
                  <Button asChild variant="ghost" fontWeight="medium">
                    <NextLink href="/user-login">{t('sign_in', { defaultValue: 'Sign in' })}</NextLink>
                  </Button>
                </Box>
                <Button asChild rounded="full" paddingX={{ base: 4, md: 6 }} bg="main" color="white" _hover={{ bg: "main.dark", transform: "translateY(-1px)" }} transition="all 0.2s">
                  <NextLink href="/user-register">{t('sign_up', { defaultValue: 'Sign up' })}</NextLink>
                </Button>
              </>
            )}
          </Flex>
          {/* Mobile Drawer */}
          <Box display={{ base: "block", md: "none" }}>
            <MobileDrawer activeBooking={activeBooking} navItems={navItems} />
          </Box>
        </HStack>
      </Header>
    </>
  );
}

// UserMenu needs to be a client component due to Menu's auto-generated IDs
const UserMenu = ({ user, t, lng }: { user: IUserAuth, t: (key: string, options?: Record<string, unknown>) => string, lng: string }) => {
  return (
    <Menu.Root lazyMount unmountOnExit id="user-menu">
      <Menu.Trigger asChild>
        <Button variant="outline" size="sm">
          {user.name}
        </Button>
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content>
          <Menu.Item value="profile">
            <NextLink href="/mypage">{t('profile', { defaultValue: 'Profile' })}</NextLink>
          </Menu.Item>
          <LogoutButton lng={lng} />
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
}