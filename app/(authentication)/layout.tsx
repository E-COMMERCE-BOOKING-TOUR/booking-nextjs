import {
  Box,
  Container,
  SimpleGrid,
} from "@chakra-ui/react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Box position={"relative"}>
        <Container
          as={SimpleGrid}
          maxW="7xl"
          columns={{ base: 1, md: 2 }}
          gap={{ base: 10, lg: 32 }}
          py={{ base: 10, sm: 20, lg: 32 }}
        >
          {children}
        </Container>
      </Box>
    </>
  );
}