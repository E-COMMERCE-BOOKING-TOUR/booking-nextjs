import BlogSidebarLeft from '@/components/blog-sidebar-left';
import BlogSidebarRight from '@/components/blog-sidebar-right';
import { Provider } from '@/components/chakra/provider';
import { Toaster } from '@/components/chakra/toaster';
import { Flex, Box, Container } from '@chakra-ui/react';
import '../globals.css';
import { UserFooter, UserNavbar } from '@/components/layout/user';
import { settingsApi } from '@/apis/settings';
import { cookies } from 'next/headers';
import { cookieName, fallbackLng } from '@/libs/i18n/settings';

export const dynamic = "force-dynamic";

export default async function TopPageLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    let settings = null;
    try {
        settings = await settingsApi.get();
    } catch (error) {
        console.error("Failed to fetch site settings:", error);
    }

    const cookieStore = await cookies();
    const lng = cookieStore.get(cookieName)?.value || fallbackLng;

    return (
        <Provider defaultTheme='light'>
            <Box minH="100vh" bg="gray.100">
                <UserNavbar settings={settings} />
                <Container maxW="7xl" px={4}>
                    <Flex position="relative" flex={1} gap={8} justifyContent="center" color="black" mx="auto">
                        <Flex pt={5} w="260px" display={{ base: 'none', md: 'flex' }} justifyContent="flex-end">
                            <BlogSidebarLeft />
                        </Flex>
                        <Flex pt={8} w="full" minH="100vh" direction="column" flex={1}>
                            {children}
                        </Flex>
                        <Flex pt={5} w="300px" display={{ base: 'none', lg: 'flex' }}>
                            <BlogSidebarRight />
                        </Flex>
                    </Flex>
                </Container>
                <UserFooter settings={settings} lng={lng} />
            </Box>
            <Toaster />
        </Provider>
    );
}
