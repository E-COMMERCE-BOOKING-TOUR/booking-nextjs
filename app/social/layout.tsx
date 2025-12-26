import BlogSidebarLeft from '@/components/blog-sidebar-left';
import BlogSidebarRight from '@/components/blog-sidebar-right';
import { Provider } from '@/components/chakra/provider';
import { Toaster } from '@/components/chakra/toaster';
import { Flex, Box } from '@chakra-ui/react';
import '../globals.css';

export default function TopPageLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <Provider defaultTheme='light'>
            <Box minH="100vh" bg="gray.100" w="full">
                <Flex position="relative" flex={1} gap={8} justifyContent="center" color="black" maxW="1300px" mx="auto">
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
            </Box>
            <Toaster />
        </Provider>
    );
}
