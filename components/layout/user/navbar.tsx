import { Button, Flex, Image, Menu, VStack, HStack, Box, IconButton } from '@chakra-ui/react';
import { NotificationBell } from './notificationBell';
import NextLink from 'next/link';
import bookingApi from '@/apis/booking';
import { IBookingDetail } from '@/types/booking';
import { ResumeBookingButton } from './resumeBookingButton';
import { NavItem } from './navItem';
import { auth } from '@/libs/auth/auth';
import { IUserAuth } from '@/types/response/auth.type';
import { MobileDrawer } from './navMobileDrawer';
import { LogoutButton } from './logoutButton';

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
    link: '/about',
  },
  {
    name: 'Popular Articles',
    link: '/social',
  },
  {
    name: 'Help',
    link: '/contact-us',
  },
];

export default async function UserNavbar() {
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
      <Flex justifyContent="space-between" alignItems="center" padding={{ base: 5, md: 10 }} position="relative">
        <NextLink href="/">
          <Logo />
        </NextLink>
        {/* Desktop Menu */}
        <Box display={{ base: "none", md: "block" }}>
          <MenuLinks />
        </Box>
        <HStack>
          {/* Authentication Buttons */}
          <Flex gap={2}>
            {isLoggedIn ? (
              <>
                <NotificationBell />
                <ResumeBookingButton booking={activeBooking} mr={2} />
                <UserMenu user={user} />
              </>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <NextLink href="/user-login">Sign in</NextLink>
                </Button>
                <Button asChild rounded="full" paddingX={{ base: 5, md: 10 }} bg="main" color="white">
                  <NextLink href="/user-register">Sign up</NextLink>
                </Button>
              </>
            )}
          </Flex>
          {/* Mobile Drawer */}
          <Box display={{ base: "block", md: "none" }} marginLeft={3}>
            <MobileDrawer activeBooking={activeBooking} />
          </Box>
        </HStack>
      </Flex>
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
      align="center"
      position="absolute"
      left="50%"
      transform="translate(-50%, -50%)"
      top="50%"
      justifyContent="center"
      textAlign="center"
    >
      {navItems.map((link) => (
        <NavItem key={link.name} item={link} />
      ))}
    </LinkComponent>
  );
};

export const Logo = () => {
  return (
    <Image
      src="/assets/images/logo.png"
      objectFit="contain"
      alt="logo"
      width={200}
      height={30}
    />
  );
};