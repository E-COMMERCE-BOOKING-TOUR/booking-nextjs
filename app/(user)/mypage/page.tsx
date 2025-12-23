"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner, Center } from "@chakra-ui/react";

export default function MyPageMain() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/mypage/bookings");
    }, [router]);

    return (
        <Center h="200px">
            <Spinner size="xl" color="blue.500" />
        </Center>
    );
}
