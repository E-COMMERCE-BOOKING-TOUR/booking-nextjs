'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Button, Box, Dialog, Portal, VStack, Text, Spinner } from '@chakra-ui/react';
import { MessageCircle, LogIn } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

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
    const pathname = usePathname(); // Already returns path without locale
    const t = useTranslations('common');

    const [isOpen, setIsOpen] = useState(false);
    const [hasOpened, setHasOpened] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleOpen = () => {
        if (status === 'loading') {
            // Still checking auth, show loading
            setIsLoading(true);
            return;
        }

        if (status !== 'authenticated') {
            // Not logged in, show login prompt
            setShowLoginPrompt(true);
            return;
        }

        // Authenticated, open chatbox
        setIsOpen(true);
        setHasOpened(true);
    };

    const handleLoginRedirect = () => {
        // usePathname already returns path without locale prefix
        router.push(`/user-login?callbackUrl=${encodeURIComponent(pathname)}`);
    };

    // Handle loading state resolution
    if (isLoading && status !== 'loading') {
        setIsLoading(false);
        if (status === 'authenticated') {
            setIsOpen(true);
            setHasOpened(true);
        } else {
            setShowLoginPrompt(true);
        }
    }

    return (
        <>
            {/* Chat Button - Always visible when chat is closed */}
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
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Spinner size="sm" color="white" />
                    ) : (
                        <MessageCircle size={28} />
                    )}
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
                                <Dialog.Title>{t('login_required', { defaultValue: 'Login Required' })}</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <VStack gap={4} align="center" py={4}>
                                    <Box
                                        bg="blue.50"
                                        p={4}
                                        borderRadius="full"
                                    >
                                        <MessageCircle size={40} color="#003B95" />
                                    </Box>
                                    <Text textAlign="center" color="gray.600">
                                        {t('chat_login_message', { defaultValue: 'Please log in to start chatting with our support team.' })}
                                    </Text>
                                </VStack>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline">
                                        {t('cancel', { defaultValue: 'Cancel' })}
                                    </Button>
                                </Dialog.ActionTrigger>
                                <Button
                                    bg="main"
                                    color="white"
                                    onClick={handleLoginRedirect}
                                    _hover={{ bg: 'blue.800' }}
                                >
                                    <LogIn size={18} />
                                    {t('login_button', { defaultValue: 'Login' })}
                                </Button>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger />
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

            {/* Chatbox - Only rendered when authenticated and opened */}
            {hasOpened && status === 'authenticated' && (
                <Box display={isOpen ? 'block' : 'none'}>
                    <Chatbox
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                    />
                </Box>
            )}
        </>
    );
}
