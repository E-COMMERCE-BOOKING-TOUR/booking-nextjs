'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Button, Box, Dialog, Portal, VStack, Text, Spinner, HStack, Icon } from '@chakra-ui/react';
import { MessageCircle, LogIn, Calendar, ExternalLink } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import chatboxApi, { IChatContext, IRecentBookingInfo } from '@/apis/chatbox';

const Chatbox = dynamic(() => import('./Chatbox'), {
    ssr: false,
    loading: () => (
        <Box
            position="fixed"
            bottom="24"
            right="6"
            zIndex={1000}
            w="380px"
            h="400px"
            boxShadow="2xl"
            borderRadius="2xl"
            bg="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
        >
            <VStack gap={3}>
                <Spinner size="lg" color="main" />
                <Text fontSize="sm" color="gray.500">Loading chat...</Text>
            </VStack>
        </Box>
    )
});

export default function ChatboxWrapper() {
    const { status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const t = useTranslations('common');

    const [isOpen, setIsOpen] = useState(false);
    const [hasOpened, setHasOpened] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [recentBookings, setRecentBookings] = useState<IRecentBookingInfo[]>([]);
    const [showBookingSelector, setShowBookingSelector] = useState(false);
    const [showTargetSelector, setShowTargetSelector] = useState(false);
    const [chatTarget, setChatTarget] = useState<'ADMIN' | 'SUPPLIER'>('ADMIN');
    const [chatContext, setChatContext] = useState<Partial<IChatContext>>({});

    // Detect tour page context
    useEffect(() => {
        const fetchTourContext = async () => {
            if (params?.slug && typeof params.slug === 'string') {
                try {
                    const context = await chatboxApi.getContext({ tourSlug: params.slug });
                    setChatContext(context);
                } catch (error) {
                    console.error('Failed to fetch tour context:', error);
                }
            } else {
                setChatContext({});
            }
        };
        fetchTourContext();
    }, [params]);

    const handleOpen = async () => {
        if (status === 'loading') {
            setIsLoading(true);
            return;
        }

        if (status !== 'authenticated') {
            setShowLoginPrompt(true);
            return;
        }

        // 1. If we don't have a tour context, check for recent bookings first
        if (!chatContext.tourId && !chatContext.bookingId && !chatContext.source) {
            setIsLoading(true);
            try {
                const bookings = await chatboxApi.getRecentBookings();
                if (bookings && bookings.length > 0) {
                    setRecentBookings(bookings);
                    setShowBookingSelector(true);
                    setIsLoading(false);
                    return;
                }
            } catch (error) {
                console.error('Failed to fetch recent bookings:', error);
            }
            setIsLoading(false);
        }

        // 2. If we have a supplier context, show target selector
        if (chatContext.supplierId) {
            setShowTargetSelector(true);
            return;
        }

        // 3. Authenticated, open chatbox with default Admin target
        setChatTarget('ADMIN');
        setIsOpen(true);
        setHasOpened(true);
    };

    const handleSelectTarget = (target: 'ADMIN' | 'SUPPLIER') => {
        setChatTarget(target);
        setShowTargetSelector(false);
        setIsOpen(true);
        setHasOpened(true);
    };

    const handleSelectBooking = (booking: IRecentBookingInfo) => {
        const newContext: IChatContext = {
            bookingId: booking.id,
            tourId: booking.tourId,
            tourTitle: booking.tourTitle,
            tourSlug: booking.tourSlug,
            supplierId: booking.supplierId,
            supplierName: booking.supplierName,
            source: 'booking'
        };
        setChatContext(newContext);
        setShowBookingSelector(false);

        // After selecting booking, if it has supplier, show target selector
        if (newContext.supplierId) {
            setShowTargetSelector(true);
        } else {
            setChatTarget('ADMIN');
            setIsOpen(true);
            setHasOpened(true);
        }
    };

    const handleSkipBooking = () => {
        setChatContext({ source: 'general' });
        setShowBookingSelector(false);
        setIsOpen(true);
        setHasOpened(true);
    };

    const handleLoginRedirect = () => {
        router.push(`/user-login?callbackUrl=${encodeURIComponent(pathname)}`);
    };

    // Handle loading state resolution
    useEffect(() => {
        if (isLoading && status !== 'loading') {
            setIsLoading(false);
            if (status === 'authenticated') {
                handleOpen();
            } else {
                setShowLoginPrompt(true);
            }
        }
    }, [isLoading, status]);

    return (
        <>
            {/* Chat Button */}
            {!isOpen && (
                <Button
                    onClick={handleOpen}
                    bg="main"
                    color="white"
                    rounded="full"
                    w="60px"
                    h="60px"
                    position="fixed"
                    bottom="6"
                    right="6"
                    zIndex={1000}
                    aria-label="Open Chat"
                    shadow="2xl"
                    _hover={{ transform: 'scale(1.1)', shadow: '0 0 20px rgba(77, 201, 230, 0.4)' }}
                    _active={{ transform: 'scale(0.95)' }}
                    transition="all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                    animation="pulse 2s infinite"
                    loading={isLoading}
                >
                    <MessageCircle size={28} />
                </Button>
            )}

            {/* Login Required Dialog */}
            <Dialog.Root
                open={showLoginPrompt}
                onOpenChange={(e) => setShowLoginPrompt(e.open)}
                placement="center"
            >
                <Portal>
                    <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
                    <Dialog.Positioner>
                        <Dialog.Content borderRadius="2xl" boxShadow="2xl" maxW="sm">
                            <Dialog.Header>
                                <Dialog.Title>{t('login_required')}</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <VStack gap={4} align="center" py={4}>
                                    <Box bg="blue.50" p={4} borderRadius="full">
                                        <MessageCircle size={40} color="#003B95" />
                                    </Box>
                                    <Text textAlign="center" color="gray.600">
                                        {t('chat_login_message')}
                                    </Text>
                                </VStack>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline">{t('cancel')}</Button>
                                </Dialog.ActionTrigger>
                                <Button bg="main" color="white" onClick={handleLoginRedirect}>
                                    <LogIn size={18} />
                                    {t('login_button')}
                                </Button>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

            {/* Booking Selection Dialog */}
            <Dialog.Root
                open={showBookingSelector}
                onOpenChange={(e) => setShowBookingSelector(e.open)}
                placement="center"
                scrollBehavior="inside"
            >
                <Portal>
                    <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
                    <Dialog.Positioner shadow="2xl">
                        <Dialog.Content borderRadius="2xl" maxW="md">
                            <Dialog.Header>
                                <Dialog.Title>{t('select_booking_chat', { defaultValue: 'Select a booking to discuss' })}</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <VStack gap={3} align="stretch" py={2}>
                                    <Text fontSize="sm" color="gray.500" mb={2}>
                                        {t('select_booking_desc', { defaultValue: 'We found recent bookings. Would you like to chat about one of these?' })}
                                    </Text>
                                    {recentBookings.map((booking) => (
                                        <Box
                                            key={booking.id}
                                            p={3}
                                            borderWidth="1px"
                                            borderRadius="xl"
                                            cursor="pointer"
                                            _hover={{ borderColor: 'main', bg: 'blue.50' }}
                                            onClick={() => handleSelectBooking(booking)}
                                            transition="all 0.2s"
                                        >
                                            <VStack align="stretch" gap={1}>
                                                <HStack justify="space-between">
                                                    <Text fontWeight="bold" lineClamp={1}>{booking.tourTitle}</Text>
                                                    <Icon as={ExternalLink} size="sm" color="gray.400" />
                                                </HStack>
                                                <HStack color="gray.500" fontSize="xs">
                                                    <Icon as={Calendar} size="xs" />
                                                    <Text>{booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'}</Text>
                                                    <Text>•</Text>
                                                    <Text textTransform="uppercase">{booking.status}</Text>
                                                </HStack>
                                            </VStack>
                                        </Box>
                                    ))}
                                </VStack>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Button variant="ghost" color="main" onClick={handleSkipBooking} w="full">
                                    {t('skip_booking_selection', { defaultValue: 'Something else' })}
                                </Button>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

            {/* Target Selection Dialog */}
            <Dialog.Root
                open={showTargetSelector}
                onOpenChange={(e) => setShowTargetSelector(e.open)}
                placement="center"
            >
                <Portal>
                    <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
                    <Dialog.Positioner shadow="2xl">
                        <Dialog.Content borderRadius="2xl" maxW="sm">
                            <Dialog.Header>
                                <Dialog.Title>{t('select_chat_target')}</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <VStack gap={4} py={2}>
                                    <Button
                                        w="full"
                                        h="auto"
                                        py={4}
                                        variant="outline"
                                        borderRadius="xl"
                                        display="flex"
                                        flexDirection="column"
                                        gap={1}
                                        onClick={() => handleSelectTarget('ADMIN')}
                                        _hover={{ borderColor: 'main', bg: 'blue.50' }}
                                    >
                                        <HStack w="full" justify="center">
                                            <MessageCircle size={20} color="#4DC9E6" />
                                            <Text fontWeight="bold">{t('chat_with_admin')}</Text>
                                        </HStack>
                                        <Text fontSize="xs" color="gray.500" fontWeight="normal">AI support & General info</Text>
                                    </Button>

                                    {chatContext.supplierId && (
                                        <Button
                                            w="full"
                                            h="auto"
                                            py={4}
                                            variant="outline"
                                            borderRadius="xl"
                                            display="flex"
                                            flexDirection="column"
                                            gap={1}
                                            onClick={() => handleSelectTarget('SUPPLIER')}
                                            _hover={{ borderColor: 'main', bg: 'blue.50' }}
                                        >
                                            <HStack w="full" justify="center">
                                                <ExternalLink size={20} color="#E64D66" />
                                                <Text fontWeight="bold">{t('chat_with_supplier', { name: chatContext.supplierName || 'Supplier' })}</Text>
                                            </HStack>
                                            <Text fontSize="xs" color="gray.500" fontWeight="normal">Tour specific details & logistics</Text>
                                        </Button>
                                    )}
                                </VStack>
                            </Dialog.Body>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

            {/* Chatbox */}
            {hasOpened && status === 'authenticated' && (
                <Box display={isOpen ? 'block' : 'none'}>
                    <Chatbox
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        context={chatContext}
                        target={chatTarget}
                    />
                </Box>
            )}
        </>
    );
}
