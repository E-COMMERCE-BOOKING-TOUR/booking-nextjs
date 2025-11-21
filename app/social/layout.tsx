import BlogSidebarLeft from '@/components/blog-sidebar-left';
import BlogSidebarRight from '@/components/blog-sidebar-right';
import { Provider } from '@/components/chakra/provider';
import { Toaster } from '@/components/chakra/toaster';
import { Flex } from '@chakra-ui/react';

export default function TopPageLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <Provider defaultTheme='dark'>
            <Flex position="relative" flex={1} justifyContent="space-between" minH="100vh" alignItems="flex-start" background="black" color="white">
                <Flex flex={1} position="sticky" top={0}>
                    <BlogSidebarLeft />
                </Flex>
                <Flex flex={2} justifyContent="center">
                    {children}
                </Flex>
                <Flex flex={1} position="sticky" top={0}>
                    <BlogSidebarRight />
                </Flex>
            </Flex>
            <Toaster />
        </Provider>
    );
}