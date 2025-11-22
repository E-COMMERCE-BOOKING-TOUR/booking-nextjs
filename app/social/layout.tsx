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
            <Flex position="relative" flex={1} gap={5} justifyContent="center" minH="100vh" alignItems="flex-start" background="black" color="white">
                <Flex w="275px" position="sticky" top={0} display={{ base: 'none', md: 'flex' }} justifyContent="flex-end">
                    <BlogSidebarLeft />
                </Flex>
                <Flex w="full" maxW="800px" borderX="1px solid" borderColor="whiteAlpha.200" minH="100vh" direction="column">
                    {children}
                </Flex>
                <Flex w="275px" position="sticky" top={0} display={{ base: 'none', lg: 'flex' }}>
                    <BlogSidebarRight />
                </Flex>
            </Flex>
            <Toaster />
        </Provider>
    );
}