import { Button, Flex, Image, Menu, VStack, HStack, Box } from '@chakra-ui/react';
import NextLink from 'next/link';
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
    link: '/popular-articles',
  },
  {
    name: 'Help',
    link: '/contact-us',
  },
];

export default async function UserNavbar() {
  const session = await auth();
  const user = session?.user;
  const isLoggedIn = !!user;

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
              <UserMenu user={user} />
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
            <MobileDrawer />
          </Box>
        </HStack>
      </Flex>
    </>
  );
}

const UserMenu = ({ user }: { user: IUserAuth }) => {
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant="outline" size="sm">
          {user.name}
        </Button>
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content>
          <Menu.Item value="profile">
            <NextLink href="/user-profile">Profile</NextLink>
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