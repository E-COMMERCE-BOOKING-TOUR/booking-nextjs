'use client';

import { useEffect, useState, useRef, memo } from 'react';
import { io, Socket } from 'socket.io-client';
import { X, Compass, Send, Loader2 } from 'lucide-react';
import {
    Box,
    Button,
    Input,
    VStack,
    Text,
    HStack,
    Flex,
    Circle
} from '@chakra-ui/react';
import { toast } from 'sonner';
import chatboxApi, { IMessage, IStartChatResponse, IChatContext } from '@/apis/chatbox';
import { useTranslations } from "next-intl";
import { useSession } from 'next-auth/react';

import { useForm } from 'react-hook-form';

// --- Sub-component for Input to prevent re-rendering the whole message list ---
const ChatInput = memo(({
    isConnected,
    onSend,
    placeholder
}: {
    isConnected: boolean;
    onSend: (text: string) => void;
    placeholder: string;
}) => {
    const { register, handleSubmit, reset } = useForm<{ message: string }>();

    const onSubmit = (data: { message: string }) => {
        if (!data.message.trim()) return;
        onSend(data.message);
        reset();
    };

    return (
        <HStack
            as="form"
            onSubmit={handleSubmit(onSubmit)}
            p={4}
            bg="white"
            borderTop="1px solid"
            borderColor="gray.100"
            gap={2}
            flexShrink={0}
        >
            <Input
                {...register('message')}
                placeholder={placeholder}
                disabled={!isConnected}
                borderRadius="full"
                py={5}
                px={4}
                border="1px solid"
                borderColor="gray.200"
                _focus={{ borderColor: 'secondary', boxShadow: '0 0 0 1px rgba(77, 201, 230, 0.2)' }}
                fontSize="sm"
                autoComplete="off"
            />
            <Button
                type="submit"
                bg="main"
                color="white"
                disabled={!isConnected}
                borderRadius="full"
                w="44px"
                h="44px"
                p={0}
                flexShrink={0}
                _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
                _active={{ transform: 'translateY(0)' }}
                transition="all 0.2s"
            >
                <Send size={18} />
            </Button>
        </HStack>
    );
});

export default function Chatbox({
    isOpen,
    onClose,
    context = {},
    target = 'ADMIN'
}: {
    isOpen: boolean;
    onClose: () => void;
    context?: Partial<IChatContext>;
    target?: 'ADMIN' | 'SUPPLIER';
}) {
    const t = useTranslations('common');
    const { data: session, status } = useSession();
    const token = session?.user?.accessToken;

    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const connectingRef = useRef(false);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Effect for Socket connection
    useEffect(() => {
        if (status !== 'authenticated' || !token || !isOpen || socket || connectingRef.current) {
            return;
        }

        const socketUrl = process.env.NEXT_PUBLIC_CHATBOX_WS_URL;
        if (!socketUrl) {
            console.error('NEXT_PUBLIC_CHATBOX_WS_URL is not defined');
            return;
        }

        connectingRef.current = true;

        // Use a timeout to move setState out of synchronous effect execution
        setTimeout(() => setIsConnecting(true), 0);

        const startChat = target === 'SUPPLIER' && context.supplierId
            ? chatboxApi.startChatSupplier(context.supplierId, context, token)
            : chatboxApi.startChatAdmin(context, token);

        startChat
            .then((data: IStartChatResponse) => {
                if (!data?._id) {
                    throw new Error('No conversation ID returned');
                }

                setConversationId(data._id);

                const newSocket = io(socketUrl, {
                    transports: ['websocket'],
                    auth: { token }
                });

                newSocket.on('connect', () => {
                    console.log('Socket connected');
                    newSocket.emit('joinRoom', { conversationId: data._id });
                    setIsConnected(true);
                    setIsConnecting(false);
                });

                newSocket.on('authenticated', (authData: { user: { full_name: string } }) => {
                    console.log('Authenticated as:', authData.user?.full_name);
                });

                newSocket.on('error', (err: { message: string } | any) => {
                    console.error('Socket error:', err);
                    toast.error(err.message || t('unknown_error'));
                    // Don't disconnect on rate limit or minor errors
                    if (err.message && !err.message.includes('wait')) {
                        setIsConnecting(false);
                        setIsConnected(false);
                    }
                });

                newSocket.on('connect_error', (err: Error) => {
                    console.error('Connection error:', err);
                    setIsConnecting(false);
                    setIsConnected(false);
                });

                newSocket.on('disconnect', () => {
                    setIsConnected(false);
                });

                newSocket.on('newMessage', (msg: IMessage) => {
                    setMessages((prev) => [...prev, msg]);
                    scrollToBottom();
                });

                setSocket(newSocket);

                // Load initial messages
                chatboxApi.getMessages(data._id, token)
                    .then((msgs: IMessage[]) => {
                        setMessages(msgs || []);
                        scrollToBottom();
                    })
                    .catch(err => console.error('Error loading messages:', err));
            })
            .catch((err: Error) => {
                console.error('Failed to start chat:', err);
                setIsConnecting(false);
            })
            .finally(() => {
                connectingRef.current = false;
            });

        return () => {
            // Cleanup on unmount
        };
    }, [status, token, isOpen, socket, context]);

    const handleSend = (text: string) => {
        if (!socket || !conversationId || !isConnected) return;

        socket.emit('sendMessage', {
            conversationId,
            content: text,
        });
    };

    if (status !== 'authenticated') {
        return null;
    }

    return (
        <Box
            position="fixed"
            bottom="24"
            right="6"
            zIndex={1000}
            w="380px"
            maxH="600px"
            h="calc(100vh - 120px)"
            boxShadow="2xl"
            borderRadius="2xl"
            bg="rgba(255, 255, 255, 0.95)"
            backdropFilter="blur(20px)"
            overflow="hidden"
            display="flex"
            flexDirection="column"
            transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            transform={isOpen ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(20px)'}
            opacity={isOpen ? 1 : 0}
            pointerEvents={isOpen ? 'auto' : 'none'}
        >
            {/* Header */}
            <Flex
                bg="main"
                color="white"
                p={4}
                justify="space-between"
                align="center"
                shadow="md"
                flexShrink={0}
                zIndex={10}
            >
                <HStack gap={3}>
                    <Circle size="10" bg="whiteAlpha.300" backdropFilter="blur(4px)">
                        <Compass size={20} />
                    </Circle>
                    <VStack align="start" gap={0}>
                        <Text fontWeight="bold" fontSize="md" letterSpacing="tight">
                            TripConnect Support
                        </Text>
                        <HStack gap={1.5}>
                            <Box
                                w="2"
                                h="2"
                                bg={isConnected ? "green.400" : "orange.400"}
                                borderRadius="full"
                                boxShadow={isConnected ? "0 0 8px rgba(72, 187, 120, 0.6)" : "none"}
                            />
                            <Text fontSize="xs" fontWeight="medium" opacity={0.9}>
                                {isConnected ? t('online', { defaultValue: 'Online' }) : t('connecting', { defaultValue: 'Connecting...' })}
                            </Text>
                        </HStack>
                    </VStack>
                </HStack>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={onClose}
                    color="white"
                    _hover={{ bg: 'whiteAlpha.200' }}
                    borderRadius="full"
                    cursor="pointer"
                    zIndex={11}
                    aria-label="Close chat"
                >
                    <X size={20} />
                </Button>
            </Flex>

            {/* Content Area */}
            <Flex direction="column" flex={1} bg="transparent" minH={0}>
                {isConnecting ? (
                    <Flex flex={1} justify="center" align="center" direction="column" gap={4}>
                        <Box color="main">
                            <Loader2 className="animate-spin" size={32} />
                        </Box>
                        <Text fontSize="sm" fontWeight="medium" color="gray.500">
                            {t('securing_connection', { defaultValue: 'Securing connection...' })}
                        </Text>
                    </Flex>
                ) : (
                    <>
                        <VStack
                            flex={1}
                            overflowY="auto"
                            p={4}
                            gap={4}
                            align="stretch"
                            css={{
                                '&::-webkit-scrollbar': { width: '4px' },
                                '&::-webkit-scrollbar-track': { background: 'transparent' },
                                '&::-webkit-scrollbar-thumb': { background: '#E2E8F0', borderRadius: '4px' },
                            }}
                        >
                            <Box textAlign="center" py={4}>
                                <Text fontSize="xs" bg="gray.50" px={3} py={1} borderRadius="full" display="inline-block" color="gray.400" fontWeight="medium">
                                    Start of conversation
                                </Text>
                            </Box>

                            {messages.map((msg, i) => {
                                const isUser = msg.senderRole === 'USER' || msg.senderRole === 'customer';
                                return (
                                    <Flex key={i} direction="column" align={isUser ? 'flex-end' : 'flex-start'}>
                                        <Box
                                            bg={isUser ? 'main' : 'gray.100'}
                                            color={isUser ? 'white' : 'gray.800'}
                                            px={4}
                                            py={2.5}
                                            borderRadius={isUser ? "18px 18px 2px 18px" : "18px 18px 18px 2px"}
                                            maxW="85%"
                                            boxShadow="sm"
                                        >
                                            {!isUser && msg.senderName && (
                                                <Text fontSize="10px" fontWeight="bold" opacity={0.6} mb={0.5} letterSpacing="wider">
                                                    {msg.senderRole === 'AI' ? 'AI Assistant' : msg.senderName}
                                                </Text>
                                            )}
                                            <Text fontSize="sm" lineHeight="tall">{msg.content}</Text>
                                        </Box>
                                        <Text fontSize="9px" color="gray.400" mt={1} fontWeight="medium">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </Flex>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </VStack>

                        <ChatInput
                            isConnected={isConnected}
                            onSend={handleSend}
                            placeholder={t('type_message', { defaultValue: 'Type a message...' })}
                        />
                    </>
                )}
            </Flex>
        </Box>
    );
}
