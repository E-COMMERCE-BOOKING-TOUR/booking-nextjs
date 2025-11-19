"use client";
import { login } from "@/actions/login";
import authApi from "@/apis/auth";
import { toaster } from "@/components/chakra/toaster";
import { RegisterSchema } from "@/schemas";
import { ICreateRegister } from "@/types/auth.type";
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
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

export default function UserRegisterPage() {
  const router = useRouter();
  const {
    formState: { errors },
    handleSubmit,
    register: registerFrom,
  } = useForm<z.infer<typeof RegisterSchema>>({
    resolver: standardSchemaResolver(RegisterSchema),
  });

  const registerMutate = useMutation({
    mutationFn: (params: ICreateRegister) => authApi.register(params),
    onSuccess: async (response, variables) => {
      toaster.create({
        type: "success",
        description: response.message || "Đăng ký thành công!",
      });

      // Auto login after successful registration
      const loginResult = await login({
        username: variables.username,
        password: variables.password,
      });

      if (loginResult?.shouldRedirect) {
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 500);
      }
    },
    onError: (error: Error) => {
      toaster.create({
        type: "error",
        description: error.message || "Đã xảy ra lỗi. Vui lòng thử lại!",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    registerMutate.mutate({
      username: values.username,
      password: values.password,
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
            ĐĂNG KÝ NGAY
          </Heading>
        </Stack>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={5}>
            <Stack gap={3}>
              <Field.Root invalid={!!errors.username}>
                <Input
                  variant="outline"
                  placeholder="Tài khoản"
                  {...registerFrom("username")}
                />
                <Field.ErrorText>{errors.username?.message}</Field.ErrorText>
              </Field.Root>
              <Field.Root invalid={!!errors.password}>
                <Input
                  variant="outline"
                  type="password"
                  placeholder="Mật khẩu"
                  {...registerFrom("password")}
                />
                <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
              </Field.Root>
              <Field.Root invalid={!!errors.confirmPassword}>
                <Input
                  variant="outline"
                  type="password"
                  {...registerFrom("confirmPassword")}
                  placeholder="Xác nhận mật khẩu"
                />
                <Field.ErrorText>
                  {errors.confirmPassword?.message}
                </Field.ErrorText>
              </Field.Root>
            </Stack>
            <Checkbox.Root
              ml="0.5rem"
              size="md"
              colorScheme="green"
              defaultChecked
              color="gray.600"
            >
              Chấp nhập với Điều khoản & Dịch vụ
            </Checkbox.Root>
            <Button
              variant="solid"
              w="100%"
              py="1.5rem"
              type="submit"
              loading={registerMutate.isPending}
            >
              ĐĂNG KÝ NGAY
            </Button>
          </Stack>
        </form>
        <Center color="gray.600" fontSize="15px">
          <Link href="/user-login">Bạn đã có tài khoản? Đăng nhập ngay</Link>
        </Center>
      </Stack>
    </>
  );
}
