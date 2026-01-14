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
import { getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/ui/user/LanguageSwitcher';
import { Logo, MenuLinks } from './navCommon';
import { Session } from 'next-auth'; // Added Session import

interface NavbarProps {
  settings?: SiteSettings | null;
}

export default async function UserNavbar({ settings }: NavbarProps) {
  const t = await getTranslations('common');

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
          <LanguageSwitcher />
          {/* Authentication Buttons */}
          <Flex gap={2} alignItems="center">
            {isLoggedIn ? (
              <>
                <NotificationBell />
                <ResumeBookingButton booking={activeBooking} mr={2} />
                <UserMenu session={session} t={t} />
              </>
            ) : (
              <>
                <Box display={{ base: "none", sm: "block" }}>
                  <Button asChild variant="ghost" fontWeight="medium">
                    <NextLink href="/user-login">{t('sign_in', { defaultValue: 'Sign in' })}</NextLink>
                  </Button>
                </Box>
                <Button asChild rounded="full" paddingX={{ base: 4, md: 6 }} bg="main" color="white" _hover={{ bg: "main.dark" }} transition="all 0.2s">
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
const UserMenu = ({ session, t }: { session: Session | null, t: Awaited<ReturnType<typeof getTranslations>> }) => {
  const user = session?.user as IUserAuth | undefined;
  const roleName = user?.role?.name?.toLowerCase();
  const showDashboard = roleName === "admin" || roleName === "supplier";

  if (!user) {
    return null; // Or some fallback UI if user is not available
  }

  return (
    <Menu.Root lazyMount unmountOnExit id="user-menu">
      <Menu.Trigger asChild>
        <Button variant="outline" size="sm">
          {user.name}
        </Button>
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content>
          {showDashboard && (
            <Menu.Item value="dashboard">
              <NextLink href="/admin">{t('dashboard', { defaultValue: 'Dashboard' })}</NextLink>
            </Menu.Item>
          )}
          <Menu.Item value="profile">
            <NextLink href="/mypage">{t('profile', { defaultValue: 'Profile' })}</NextLink>
          </Menu.Item>
          <LogoutButton />
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
}
