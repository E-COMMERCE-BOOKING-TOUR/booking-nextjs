import { Button, Flex, Image, Menu, VStack, HStack, Box } from '@chakra-ui/react';
import { NotificationBell } from './notificationBell';
import { Header } from './header';
import NextLink from 'next/link';
import bookingApi from '@/apis/booking';
import { IBookingDetail } from '@/types/booking';
import { ResumeBookingButton } from './resumeBookingButton';
import { NavItem } from './navItem';
import { auth } from '@/libs/auth/auth';
import { IUserAuth } from '@/types/response/auth.type';
import { MobileDrawer } from './navMobileDrawer';
import { LogoutButton } from './logoutButton';
import { SiteSettings } from '@/apis/admin/settings';

type NavItem = {
  name: string;
  link: string;
};

const navItems: NavItem[] = [
  {
    name: 'Home',
    link: '/',
  },
  {
    name: 'About us',
    link: '/page/about-us',
  },
  {
    name: 'Popular Articles',
    link: '/social',
  },
];

interface NavbarProps {
  settings?: SiteSettings | null;
}

export default async function UserNavbar({ settings }: NavbarProps) {
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
            <MenuLinks />
          </Flex>
        </Box>

        <HStack gap={3}>
          {/* Authentication Buttons */}
          <Flex gap={2} alignItems="center">
            {isLoggedIn ? (
              <>
                <NotificationBell />
                <ResumeBookingButton booking={activeBooking} mr={2} />
                <UserMenu user={user} />
              </>
            ) : (
              <>
                <Box display={{ base: "none", sm: "block" }}>
                  <Button asChild variant="ghost" fontWeight="medium">
                    <NextLink href="/user-login">Sign in</NextLink>
                  </Button>
                </Box>
                <Button asChild rounded="full" paddingX={{ base: 4, md: 6 }} bg="main" color="white" _hover={{ bg: "main.dark", transform: "translateY(-1px)" }} transition="all 0.2s">
                  <NextLink href="/user-register">Sign up</NextLink>
                </Button>
              </>
            )}
          </Flex>
          {/* Mobile Drawer */}
          <Box display={{ base: "block", md: "none" }}>
            <MobileDrawer activeBooking={activeBooking} />
          </Box>
        </HStack>
      </Header>
    </>
  );
}

// UserMenu needs to be a client component due to Menu's auto-generated IDs
const UserMenu = ({ user }: { user: IUserAuth }) => {
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
            <NextLink href="/mypage">Profile</NextLink>
          </Menu.Item>
          <LogoutButton />
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
}

export const MenuLinks = ({ isMobile = false }) => {
  const LinkComponent = isMobile ? VStack : HStack;

  return (
    <LinkComponent
      gap={isMobile ? 4 : 8}
      align={isMobile ? "stretch" : "center"}
      justifyContent="center"
    >
      {navItems.map((link) => (
        <NavItem key={link.name} item={link} />
      ))}
    </LinkComponent>
  );
};

export const Logo = ({ logoUrl }: { logoUrl?: string | null }) => {
  return (
    <Image
      src={logoUrl || "/assets/images/logo.png"}
      objectFit="contain"
      alt="logo"
      width={200}
      height={30}
    />
  );
};