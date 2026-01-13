import { Suspense } from "react";
import { Spinner, Container, Center } from "@chakra-ui/react";
import VnpayReturnClient from "./VnpayReturnClient";

export default function VnpayReturnPage() {
    return (
        <Suspense fallback={
            <Container maxW="md" py={20}>
                <Center>
                    <Spinner size="xl" />
                </Center>
            </Container>
        }>
            <VnpayReturnClient />
        </Suspense>
    );
}
