import {
  Box,
  Container,
  SimpleGrid,
} from "@chakra-ui/react";
import { Toaster } from '@/components/chakra/toaster';
import { Provider } from '@/components/chakra/provider';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Provider>
      <Box position={"relative"} overflowX="hidden">
        <Container
          as={SimpleGrid}
          maxW="7xl"
          py={{ base: 10, sm: 20 }}
        >
          {children}
        </Container>
      </Box>
      <Toaster />
    </Provider>

  );
}