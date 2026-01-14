"use client";
import authApi from "@/apis/auth";
import { toaster } from "@/components/chakra/toaster";
import { RegisterSchema } from "@/schemas";
import { ICreateRegister } from "@/types/auth.type";
import {
  Box,
  Button,
  Center,
  Checkbox,
  Field,
  Grid,
  GridItem,
  Heading,
  Input,
  Stack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useRouter } from "@/i18n/navigation";
import { useForm, Controller } from "react-hook-form";
import { useTranslations } from "next-intl";
import * as z from "zod";

export default function RegisterPage() {
  const router = useRouter();

  const {
    register: registerFrom,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      full_name: "",
      email: "",
      phone: "",
      acceptedTerms: false,
    }
  });

  const registerMutate = useMutation({
    mutationFn: async (values: ICreateRegister) => {
      const response = await authApi.register(values);
      return response;
    },
    onSuccess: async (data) => {
      if (data.error) {
        const errorKey = data.message || 'registration_failed';
        toaster.create({
          description: t(errorKey, { defaultValue: data.message || "Registration failed" }),
          type: "error",
        });
      } else {
        toaster.create({
          description: t('registration_email_sent', { defaultValue: "Registration successful! Please check your email to verify your account." }),
          type: "success",
        });
        // Redirect to login page
        setTimeout(() => {
          router.push("/user-login");
        }, 2000);
      }
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : t('registration_failed', { defaultValue: "An error occurred during registration" });
      toaster.create({
        description: message,
        type: "error",
      });
    },
  });

  const t = useTranslations('common');

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    registerMutate.mutate(values);
  };

  return (
    <Box
      minH="90vh"
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
        maxW="lg"
        w="100%"
        shadow="2xl"
        border="1px solid"
        borderColor="gray.100"
        position="relative"
        zIndex={1}
      >
        <Stack gap={2} textAlign="center" mb={2}>
          <Heading
            color="gray.900"
            fontSize="3xl"
            fontWeight="black"
            letterSpacing="tight"
          >
            {t('create_account_title', { defaultValue: "Create an Account" })}
          </Heading>
          <Heading color="gray.500" fontSize="md" fontWeight="medium">
            {t('discover_journeys', { defaultValue: "Discover amazing journeys with us" })}
          </Heading>
        </Stack>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={4}>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <Field.Root invalid={!!errors.full_name}>
                  <Field.Label fontWeight="semibold" fontSize="sm" color="gray.700">{t('full_name_label', { defaultValue: "Full Name" })}</Field.Label>
                  <Input
                    variant="subtle"
                    bg="gray.50"
                    _focus={{ bg: "white", borderColor: "brand.500", shadow: "sm" }}
                    px={4}
                    py={6}
                    rounded="xl"
                    placeholder={t('full_name_placeholder_eg', { defaultValue: "e.g. John Doe" })}
                    {...registerFrom("full_name")}
                  />
                  <Field.ErrorText>{errors.full_name?.message && t(errors.full_name.message as string, { count: 2 })}</Field.ErrorText>
                </Field.Root>
              </GridItem>

              <GridItem>
                <Field.Root invalid={!!errors.username}>
                  <Field.Label fontWeight="semibold" fontSize="sm" color="gray.700">{t('username_label', { defaultValue: "Username" })}</Field.Label>
                  <Input
                    variant="subtle"
                    bg="gray.50"
                    _focus={{ bg: "white", borderColor: "brand.500", shadow: "sm" }}
                    px={4}
                    py={6}
                    rounded="xl"
                    placeholder="username123"
                    {...registerFrom("username")}
                  />
                  <Field.ErrorText>{errors.username?.message && t(errors.username.message as string, { count: 5 })}</Field.ErrorText>
                </Field.Root>
              </GridItem>

              <GridItem>
                <Field.Root invalid={!!errors.phone}>
                  <Field.Label fontWeight="semibold" fontSize="sm" color="gray.700">{t('phone_label', { defaultValue: "Phone Number" })}</Field.Label>
                  <Input
                    variant="subtle"
                    bg="gray.50"
                    _focus={{ bg: "white", borderColor: "brand.500", shadow: "sm" }}
                    px={4}
                    py={6}
                    rounded="xl"
                    placeholder={t('phone_placeholder_eg', { defaultValue: "e.g. 0912345678" })}
                    {...registerFrom("phone")}
                  />
                  <Field.ErrorText>{errors.phone?.message && t(errors.phone.message as string)}</Field.ErrorText>
                </Field.Root>
              </GridItem>

              <GridItem colSpan={{ base: 1, md: 2 }}>
                <Field.Root invalid={!!errors.email}>
                  <Field.Label fontWeight="semibold" fontSize="sm" color="gray.700">{t('email_label', { defaultValue: "Email" })}</Field.Label>
                  <Input
                    variant="subtle"
                    bg="gray.50"
                    _focus={{ bg: "white", borderColor: "brand.500", shadow: "sm" }}
                    px={4}
                    py={6}
                    rounded="xl"
                    placeholder={t('email_placeholder', { defaultValue: "email@example.com" })}
                    {...registerFrom("email")}
                  />
                  <Field.ErrorText>{errors.email?.message && t(errors.email.message as string)}</Field.ErrorText>
                </Field.Root>
              </GridItem>

              <GridItem>
                <Field.Root invalid={!!errors.password}>
                  <Field.Label fontWeight="semibold" fontSize="sm" color="gray.700">{t('password_label', { defaultValue: "Password" })}</Field.Label>
                  <Input
                    variant="subtle"
                    bg="gray.50"
                    _focus={{ bg: "white", borderColor: "brand.500", shadow: "sm" }}
                    type="password"
                    px={4}
                    py={6}
                    rounded="xl"
                    placeholder="••••••••"
                    {...registerFrom("password")}
                  />
                  <Field.ErrorText>{errors.password?.message && t(errors.password.message as string, { count: 8 })}</Field.ErrorText>
                </Field.Root>
              </GridItem>

              <GridItem>
                <Field.Root invalid={!!errors.confirmPassword}>
                  <Field.Label fontWeight="semibold" fontSize="sm" color="gray.700">{t('register_confirm_password_label', { defaultValue: "Confirm Password" })}</Field.Label>
                  <Input
                    variant="subtle"
                    bg="gray.50"
                    _focus={{ bg: "white", borderColor: "brand.500", shadow: "sm" }}
                    type="password"
                    px={4}
                    py={6}
                    rounded="xl"
                    placeholder={t('register_confirm_password_placeholder', { defaultValue: "••••••••" })}
                    {...registerFrom("confirmPassword")}
                  />
                  <Field.ErrorText>{errors.confirmPassword?.message && t(errors.confirmPassword.message as string, { count: 8 })}</Field.ErrorText>
                </Field.Root>
              </GridItem>
            </Grid>

            <Controller
              control={control}
              name="acceptedTerms"
              render={({ field }) => (
                <Field.Root invalid={!!errors.acceptedTerms}>
                  <Checkbox.Root
                    size="md"
                    variant="subtle"
                    colorPalette="blue"
                    checked={field.value}
                    onCheckedChange={({ checked }) => field.onChange(checked)}
                    mt={2}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Checkbox.Label fontSize="sm" color="gray.600" fontWeight="medium">
                      {t('agree_terms', { defaultValue: "I agree to the" })}{" "}
                      <Link href="/page/terms-of-use" onClick={(e) => e.stopPropagation()}>
                        <Box as="span" color="blue.500" cursor="pointer" textDecoration="underline">
                          {t('terms_services', { defaultValue: "Terms & Services" })}
                        </Box>
                      </Link>
                    </Checkbox.Label>
                  </Checkbox.Root>
                  <Field.ErrorText>{errors.acceptedTerms?.message && t(errors.acceptedTerms.message as string)}</Field.ErrorText>
                </Field.Root>
              )}
            />

            <Button
              type="submit"
              w="100%"
              py={7}
              mt={2}
              rounded="xl"
              bg="gray.900"
              color="white"
              _hover={{ bg: "black", shadow: "lg", transform: "translateY(-2px)" }}
              transition="all 0.2s"
              fontWeight="bold"
              fontSize="md"
              loading={registerMutate.isPending}
            >
              {t('register_button', { defaultValue: "REGISTER NOW" })}
            </Button>
          </Stack>
        </form>

        <Center mt={2}>
          <Stack direction="row" gap={1} fontSize="sm" color="gray.600">
            <Box>{t('already_have_account', { defaultValue: "Already have an account?" })}</Box>
            <Link href="/user-login">
              <Box as="span" color="blue.600" fontWeight="bold" _hover={{ textDecoration: "underline" }}>
                {t('login_now', { defaultValue: "Login now" })}
              </Box>
            </Link>
          </Stack>
        </Center>
      </Stack>

      {/* Decorative background elements */}
      <Box
        position="absolute"
        top="-5%"
        left="-5%"
        w="400px"
        h="400px"
        bg="blue.50"
        rounded="full"
        filter="blur(100px)"
        opacity={0.6}
        zIndex={0}
      />
      <Box
        position="absolute"
        bottom="-5%"
        right="-5%"
        w="400px"
        h="400px"
        bg="purple.50"
        rounded="full"
        filter="blur(100px)"
        opacity={0.6}
        zIndex={0}
      />
    </Box>
  );
}
