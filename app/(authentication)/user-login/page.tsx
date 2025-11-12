"use client";

import { login } from "@/actions/login";
import { toaster } from "@/components/chakra/toaster";
import { LoginSchema } from "@/schemas";
import {
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

export default function UserLoginPage() {
  const router = useRouter();
  const [isLoading, startTransition] = useTransition();
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<z.infer<typeof LoginSchema>>({
    resolver: standardSchemaResolver(LoginSchema),
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    startTransition(async () => {
      const data = await login(values);
      if (data) {
        toaster.create({
          description: data.message,
          type: data.type as "success" | "error",
        });

        // Redirect after showing success toast
        if (data.shouldRedirect) {
          setTimeout(() => {
            router.push("/");
            router.refresh();
          }, 500);
        }
      }
    });
  };

  return (
    <>
      <Stack
        bg="var(--bg-auth-from)"
        rounded={"xl"}
        p={{ base: 4, sm: 6, md: 8 }}
        gap={5}
        maxW={{ lg: "lg" }}
      // shadow="box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;"
      >
        <Stack gap={4} my="2rem">
          <Heading color="gray.800" fontSize="3xl" textAlign="center">
            ĐĂNG NHẬP NGAY
          </Heading>
        </Stack>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={5}>
            <Stack gap={3}>
              <Field.Root invalid={!!errors.username}>
                <Input
                  variant="outline"
                  placeholder="Tài khoản"
                  {...register("username")}
                />
                <Field.ErrorText>{errors.username?.message}</Field.ErrorText>
              </Field.Root>
              <Field.Root invalid={!!errors.password}>
                <Input
                  variant="outline"
                  type="password"
                  placeholder="Mật khẩu"
                  {...register("password")}
                />
                <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
              </Field.Root>
            </Stack>
            <Checkbox.Root
              ml="0.5rem"
              size="md"
              colorScheme="green"
              defaultChecked
              color="gray.600"
            // {...register("remember")}
            >
              Ghi nhớ mật khẩu
            </Checkbox.Root>
            <Button
              type="submit"
              w="100%"
              py="1.5rem"
              loading={isLoading}
            >
              ĐĂNG NHẬP NGAY
            </Button>
          </Stack>
        </form>
        <Center color="gray.600" fontSize="15px">
          <Link href="/user-register">Bạn chưa có tài khoản? Đăng ký ngay</Link>
        </Center>
      </Stack>
    </>
  );
}
