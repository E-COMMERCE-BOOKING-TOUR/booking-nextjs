"use client";

import { login } from "@/actions/login";
import authApi from "@/apis/auth";
import { toaster } from "@/components/chakra/toaster";
import { LoginSchema } from "@/schemas";
import {
  Box,
  Button,
  Center,
  Checkbox,
  Dialog,
  Field,
  Heading,
  Input,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslations } from "next-intl";
import * as z from "zod";
import { getGuestId } from "@/utils/guest";

export default function LoginPage() {
  const [isLoading, startTransition] = useTransition();
  const [isResending, setIsResending] = useState(false);
  const [showResendDialog, setShowResendDialog] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('common');

  // Get callback URL from query parameters (set by middleware when redirecting)
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.input<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: "",
      password: "",
      remember: true,
    }
  });

  const onSubmit = (values: z.input<typeof LoginSchema>) => {
    startTransition(async () => {
      try {
        const guestId = getGuestId();
        const response = await login(values, guestId || undefined);
        if (response.type === "error") {
          // Check if error is about unverified email
          const errorMessage = response.message as string;
          if (errorMessage.includes("xác nhận email") || errorMessage.includes("verify email")) {
            setShowResendDialog(true);
          }
          toaster.create({
            description: response.message as string,
            type: "error",
          });
        } else {
          toaster.create({
            description: t('login_success', { defaultValue: "Login successful!" }),
            type: "success",
          });
          // Redirect to callback URL (the page user was trying to access)
          router.push(callbackUrl);
          router.refresh();
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : t('login_failed', { defaultValue: "An error occurred during login" });
        toaster.create({
          description: message,
          type: "error",
        });
      }
    });
  };

  const handleResendVerification = async () => {
    if (!resendEmail) {
      toaster.create({
        description: t('enter_email_to_resend', { defaultValue: "Please enter your email address" }),
        type: "error",
      });
      return;
    }

    setIsResending(true);
    try {
      const response = await authApi.resendVerification(resendEmail);
      toaster.create({
        description: response.message || t('verification_email_sent', { defaultValue: "Verification email sent!" }),
        type: "success",
      });
      setShowResendDialog(false);
      setResendEmail("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('resend_failed', { defaultValue: "Failed to resend verification email" });
      toaster.create({
        description: message,
        type: "error",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
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
              {t('welcome_back', { defaultValue: "Welcome Back!" })}
            </Heading>
            <Heading color="gray.500" fontSize="md" fontWeight="medium">
              {t('login_to_continue', { defaultValue: "Login to continue your journey" })}
            </Heading>
          </Stack>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap={5}>
              <Stack gap={4}>
                <Field.Root invalid={!!errors.username}>
                  <Field.Label fontWeight="semibold" fontSize="sm" color="gray.700">{t('username_label', { defaultValue: "Username" })}</Field.Label>
                  <Input
                    variant="subtle"
                    bg="gray.50"
                    _focus={{ bg: "white", borderColor: "brand.500", shadow: "sm" }}
                    px={4}
                    py={6}
                    rounded="xl"
                    placeholder={t('username_placeholder', { defaultValue: "Enter your username" })}
                    {...register("username")}
                  />
                  <Field.ErrorText>{errors.username?.message && t(errors.username.message as string, { count: 4 })}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.password}>
                  <Stack direction="row" justify="space-between" align="center" mb={1}>
                    <Field.Label fontWeight="semibold" fontSize="sm" color="gray.700" mb={0}>{t('password_label', { defaultValue: "Password" })}</Field.Label>
                    <Link href="/forget-password">
                      <Box as="span" fontSize="xs" color="blue.500" fontWeight="bold" _hover={{ textDecoration: "underline" }}>
                        {t('forgot_password_link', { defaultValue: "Forgot password?" })}
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
                    placeholder={t('password_placeholder', { defaultValue: "Enter your password" })}
                    {...register("password")}
                  />
                  <Field.ErrorText>{errors.password?.message && t(errors.password.message as string, { count: 5 })}</Field.ErrorText>
                </Field.Root>
              </Stack>

              <Controller
                control={control}
                name="remember"
                render={({ field }) => (
                  <Checkbox.Root
                    size="md"
                    variant="subtle"
                    colorPalette="blue"
                    checked={field.value}
                    onCheckedChange={({ checked }) => field.onChange(checked)}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Checkbox.Label fontSize="sm" color="gray.600" fontWeight="medium">
                      {t('remember_me', { defaultValue: "Remember me" })}
                    </Checkbox.Label>
                  </Checkbox.Root>
                )}
              />

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
                {t('login_button', { defaultValue: "LOGIN" })}
              </Button>
            </Stack>
          </form>

          <Center mt={4}>
            <Stack direction="row" gap={1} fontSize="sm" color="gray.600">
              <Box>{t('no_account', { defaultValue: "Don't have an account?" })}</Box>
              <Link href="/user-register">
                <Box as="span" color="blue.600" fontWeight="bold" _hover={{ textDecoration: "underline" }}>
                  {t('sign_up_now', { defaultValue: "Sign up now" })}
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

      {/* Resend Verification Dialog */}
      <Dialog.Root
        open={showResendDialog}
        onOpenChange={(e) => setShowResendDialog(e.open)}
        placement="center"
        motionPreset="slide-in-bottom"
      >
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
          <Dialog.Positioner>
            <Dialog.Content borderRadius="2xl" maxW="400px" mx={4}>
              <Dialog.Header>
                <Dialog.Title color="gray.900" fontWeight="bold">
                  {t('email_not_verified_title', { defaultValue: "Email Not Verified" })}
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text fontSize="sm" color="gray.600" mb={4}>
                  {t('email_not_verified_desc', { defaultValue: "Your email has not been verified yet. Please enter your email address to receive a new verification link." })}
                </Text>
                <Input
                  placeholder={t('email_placeholder', { defaultValue: "Enter your email" })}
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  rounded="lg"
                  size="lg"
                />
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="ghost" mr={2}>
                    {t('cancel', { defaultValue: "Cancel" })}
                  </Button>
                </Dialog.ActionTrigger>
                <Button
                  bg="gray.900"
                  color="white"
                  _hover={{ bg: "black" }}
                  onClick={handleResendVerification}
                  loading={isResending}
                >
                  {t('resend_verification', { defaultValue: "Resend Email" })}
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger />
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}


