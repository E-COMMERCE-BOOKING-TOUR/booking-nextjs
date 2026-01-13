"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container, Box, Heading, Text, Stack, Button, Spinner, Icon } from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { LuCircleCheck, LuCircleX } from "react-icons/lu";

export default function VnpayReturnClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations('common');

    const success = searchParams.get('success') === 'true';
    const code = searchParams.get('code') || '99';
    const message = searchParams.get('message') || '';
    const transactionNo = searchParams.get('transactionNo') || '';
    const amount = searchParams.get('amount') || '';
    const bookingId = searchParams.get('bookingId') || '';

    // Auto redirect to complete page after success
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                router.push('/checkout/complete');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success, router]);

    const getErrorMessage = (responseCode: string): string => {
        const messages: Record<string, string> = {
            '00': t('vnpay_success', { defaultValue: 'Giao dịch thành công' }),
            '07': t('vnpay_suspected_fraud', { defaultValue: 'Giao dịch bị nghi ngờ gian lận' }),
            '09': t('vnpay_not_registered', { defaultValue: 'Thẻ/Tài khoản chưa đăng ký Internet Banking' }),
            '10': t('vnpay_auth_failed', { defaultValue: 'Xác thực thông tin thẻ không đúng quá 3 lần' }),
            '11': t('vnpay_timeout', { defaultValue: 'Đã hết hạn chờ thanh toán' }),
            '12': t('vnpay_locked', { defaultValue: 'Thẻ/Tài khoản bị khóa' }),
            '13': t('vnpay_wrong_otp', { defaultValue: 'Nhập sai mật khẩu OTP' }),
            '24': t('vnpay_cancelled', { defaultValue: 'Giao dịch đã bị hủy' }),
            '51': t('vnpay_insufficient', { defaultValue: 'Tài khoản không đủ số dư' }),
            '65': t('vnpay_limit_exceeded', { defaultValue: 'Đã vượt quá hạn mức giao dịch trong ngày' }),
            '75': t('vnpay_maintenance', { defaultValue: 'Ngân hàng đang bảo trì' }),
            '79': t('vnpay_wrong_password', { defaultValue: 'Nhập sai mật khẩu thanh toán quá số lần quy định' }),
            '97': t('vnpay_invalid_signature', { defaultValue: 'Chữ ký không hợp lệ' }),
            '99': t('vnpay_unknown_error', { defaultValue: 'Lỗi không xác định' }),
        };
        return messages[responseCode] || messages['99'];
    };

    return (
        <Container maxW="md" py={20}>
            <Stack gap={6} align="center" textAlign="center">
                {success ? (
                    <>
                        <Icon fontSize="6xl" color="green.500">
                            <LuCircleCheck />
                        </Icon>
                        <Heading as="h1" size="xl" color="green.600">
                            {t('vnpay_payment_success', { defaultValue: 'Thanh toán thành công!' })}
                        </Heading>
                        <Box p={4} bg="green.50" borderRadius="md" w="full">
                            <Stack gap={2}>
                                {transactionNo && (
                                    <Text>
                                        <Text as="span" fontWeight="semibold">{t('transaction_no', { defaultValue: 'Mã giao dịch' })}:</Text> {transactionNo}
                                    </Text>
                                )}
                                {amount && (
                                    <Text>
                                        <Text as="span" fontWeight="semibold">{t('amount', { defaultValue: 'Số tiền' })}:</Text> {Number(amount).toLocaleString()} VND
                                    </Text>
                                )}
                                {bookingId && (
                                    <Text>
                                        <Text as="span" fontWeight="semibold">{t('booking_id', { defaultValue: 'Mã đặt tour' })}:</Text> #{bookingId}
                                    </Text>
                                )}
                            </Stack>
                        </Box>
                        <Stack direction="row" align="center" gap={2}>
                            <Spinner size="sm" />
                            <Text color="fg.muted">
                                {t('redirecting_to_complete', { defaultValue: 'Đang chuyển đến trang hoàn tất...' })}
                            </Text>
                        </Stack>
                    </>
                ) : (
                    <>
                        <Icon fontSize="6xl" color="red.500">
                            <LuCircleX />
                        </Icon>
                        <Heading as="h1" size="xl" color="red.600">
                            {t('vnpay_payment_failed', { defaultValue: 'Thanh toán thất bại' })}
                        </Heading>
                        <Box p={4} bg="red.50" borderRadius="md" w="full">
                            <Text color="red.700">
                                {decodeURIComponent(message) || getErrorMessage(code)}
                            </Text>
                            <Text fontSize="sm" color="red.500" mt={2}>
                                {t('error_code', { defaultValue: 'Mã lỗi' })}: {code}
                            </Text>
                        </Box>
                        <Stack direction={{ base: 'column', sm: 'row' }} gap={3}>
                            <Button
                                colorPalette="blue"
                                onClick={() => router.push('/checkout/confirm')}
                            >
                                {t('try_again', { defaultValue: 'Thử lại' })}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => router.push('/checkout/payment')}
                            >
                                {t('change_payment_method', { defaultValue: 'Đổi phương thức thanh toán' })}
                            </Button>
                        </Stack>
                    </>
                )}
            </Stack>
        </Container>
    );
}
