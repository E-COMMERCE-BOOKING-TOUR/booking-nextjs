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
            <Flex position="relative" flex={1} gap={5} paddingEnd={5} justifyContent="center" minH="100vh" alignItems="flex-start" color="white">
                <Flex w="375px" position="sticky" top={0} display={{ base: 'none', md: 'flex' }} justifyContent="flex-end">
                    <BlogSidebarLeft className='w-full'/>
                </Flex>
                <Flex w="full" maxW="800px" minH="100vh" direction="column">
                    {children}
                </Flex>
                <Flex w="500px" position="sticky" top={0} display={{ base: 'none', lg: 'flex' }}>
                    <BlogSidebarRight />
                </Flex>
            </Flex>
            <Toaster />
        </Provider>
    );
}
