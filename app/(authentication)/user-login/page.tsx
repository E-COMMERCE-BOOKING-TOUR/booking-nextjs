"use client";

import { login } from "@/actions/login";
import { toaster } from "@/components/chakra/toaster";
import { LoginSchema } from "@/schemas";
import {
  Box,
  Button,
  Center,
  Checkbox,
  Field,
  Heading,
  Input,
  Stack,
} from "@chakra-ui/react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { getGuestId } from "@/utils/guest";

export default function LoginPage() {
  const [isLoading, startTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof LoginSchema>>({
    resolver: standardSchemaResolver(LoginSchema),
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    startTransition(async () => {
      try {
        const guestId = getGuestId();
        const response = await login(values, guestId || undefined);
        if (response.type === "error") {
          toaster.create({
            description: response.message,
            type: "error",
          });
        } else {
          toaster.create({
            description: "Login successful!",
            type: "success",
          });
          router.push("/");
          router.refresh();
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An error occurred during login";
        toaster.create({
          description: message,
          type: "error",
        });
      }
    });
  };

  return (
    <Box
      minH="80vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      py={10}
    >
      <Stack
        bg="white"
        rounded="3xl"
        p={{ base: 6, sm: 8, md: 10 }}
        gap={6}
        maxW="md"
        w="100%"
        shadow="2xl"
        border="1px solid"
        borderColor="gray.100"
        position="relative"
        zIndex={1}
      >
        <Stack gap={2} textAlign="center" mb={4}>
          <Heading
            color="gray.900"
            fontSize="3xl"
            fontWeight="black"
            letterSpacing="tight"
          >
            Welcome Back!
          </Heading>
          <Heading color="gray.500" fontSize="md" fontWeight="medium">
            Login to continue your journey
          </Heading>
        </Stack>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={5}>
            <Stack gap={4}>
              <Field.Root invalid={!!errors.username}>
                <Field.Label fontWeight="semibold" fontSize="sm" color="gray.700">Username</Field.Label>
                <Input
                  variant="subtle"
                  bg="gray.50"
                  _focus={{ bg: "white", borderColor: "brand.500", shadow: "sm" }}
                  px={4}
                  py={6}
                  rounded="xl"
                  placeholder="Enter your username"
                  {...register("username")}
                />
                <Field.ErrorText>{errors.username?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!errors.password}>
                <Stack direction="row" justify="space-between" align="center" mb={1}>
                  <Field.Label fontWeight="semibold" fontSize="sm" color="gray.700" mb={0}>Password</Field.Label>
                  <Link href="/forget-password">
                    <Box as="span" fontSize="xs" color="blue.500" fontWeight="bold" _hover={{ textDecoration: "underline" }}>
                      Forgot password?
                    </Box>
                  </Link>
                </Stack>
                <Input
                  variant="subtle"
                  bg="gray.50"
                  _focus={{ bg: "white", borderColor: "brand.500", shadow: "sm" }}
                  type="password"
                  px={4}
                  py={6}
                  rounded="xl"
                  placeholder="Enter your password"
                  {...register("password")}
                />
                <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
              </Field.Root>
            </Stack>

            <Checkbox.Root
              size="md"
              variant="subtle"
              colorPalette="blue"
              defaultChecked
            >
              <Checkbox.Label fontSize="sm" color="gray.600" fontWeight="medium">Remember me</Checkbox.Label>
            </Checkbox.Root>

            <Button
              type="submit"
              w="100%"
              py={7}
              rounded="xl"
              bg="gray.900"
              color="white"
              _hover={{ bg: "black", shadow: "lg", transform: "translateY(-2px)" }}
              transition="all 0.2s"
              fontWeight="bold"
              fontSize="md"
              loading={isLoading}
            >
              LOGIN
            </Button>
          </Stack>
        </form>

        <Center mt={4}>
          <Stack direction="row" gap={1} fontSize="sm" color="gray.600">
            <Box>Don&apos;t have an account?</Box>
            <Link href="/user-register">
              <Box as="span" color="blue.600" fontWeight="bold" _hover={{ textDecoration: "underline" }}>
                Sign up now
              </Box>
            </Link>
          </Stack>
        </Center>
      </Stack>

      {/* Decorative background elements */}
      <Box
        position="absolute"
        top="-10%"
        right="-5%"
        w="300px"
        h="300px"
        bg="blue.50"
        rounded="full"
        filter="blur(80px)"
        opacity={0.6}
        zIndex={0}
      />
      <Box
        position="absolute"
        bottom="-10%"
        left="-5%"
        w="300px"
        h="300px"
        bg="purple.50"
        rounded="full"
        filter="blur(80px)"
        opacity={0.6}
        zIndex={0}
      />
    </Box>
  );
}
