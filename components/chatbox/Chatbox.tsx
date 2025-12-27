'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageCircle, X, Compass, Send, Loader2 } from 'lucide-react';
import {
    Box,
    Button,
    Input,
    VStack,
    Text,
    HStack,
    Flex,
    Spinner,
    Icon,
    Circle
} from '@chakra-ui/react';
import chatboxApi, { IMessage, IStartChatResponse } from '@/apis/chatbox';
import { useTranslation } from '@/libs/i18n/client';
import { useSession } from 'next-auth/react';
import { cn } from '@/libs/utils';

export default function Chatbox({ lng, isOpen, onClose }: { lng: string; isOpen: boolean; onClose: () => void }) {
    const { t } = useTranslation(lng);
    const { data: session, status } = useSession();
    const token = session?.user?.accessToken;

    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [input, setInput] = useState('');
    const [socket, setSocket] = useState<Socket | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (status === 'authenticated' && token && isOpen) {
            setIsConnecting(true);
            let s: Socket | null = null;

            chatboxApi.startChatAdmin(token)
                .then((data: any) => {
                    const convoData = data as IStartChatResponse;
                    setConversationId(convoData._id);
                    const socketUrl = process.env.NEXT_PUBLIC_CHATBOX_WS_URL;
                    s = io(socketUrl as string, {
                        transports: ['websocket'],
                        auth: { token: token }
                    });

                    s.on('connect', () => {
                        console.log('Socket connected');
                        s?.emit('joinRoom', { conversationId: convoData._id });
                        setIsConnected(true);
                        setIsConnecting(false);
                    });

                    s.on('authenticated', (data: any) => {
                        console.log('Authenticated as:', data.user?.full_name);
                    });

                    s.on('error', (err: any) => {
                        console.error('Socket error:', err);
                        setIsConnecting(false);
                        setIsConnected(false);
                    });

                    s.on('disconnect', () => {
                        setIsConnected(false);
                    });

                    s.on('newMessage', (msg: IMessage) => {
                        setMessages((prev) => [...prev, msg]);
                        scrollToBottom();
                    });

                    setSocket(s);

                    chatboxApi.getMessages(convoData._id, token)
                        .then((msgs: any) => {
                            setMessages(msgs as IMessage[]);
                            scrollToBottom();
                        });
                })
                .catch((err: any) => {
                    console.error('Failed to start chat', err);
                    setIsConnecting(false);
                });

            return () => {
                if (s) {
                    s.disconnect();
                }
            };
        } else if (!isOpen && socket) {
            socket.disconnect();
            setSocket(null);
            setIsConnected(false);
        }
    }, [status, token, isOpen]);

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleSend = () => {
        if (!input.trim() || !socket || !conversationId || !isConnected) return;

        socket.emit('sendMessage', {
            conversationId,
            content: input,
        });
        setInput('');
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
                                {isConnected ? t('online', 'Online') : t('connecting', 'Connecting...')}
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
                >
                    <X size={20} />
                </Button>
            </Flex>

            {/* Content Area */}
            <Flex direction="column" flex={1} bg="transparent">
                {isConnecting ? (
                    <Flex flex={1} justify="center" align="center" direction="column" gap={4}>
                        <Loader2 className="animate-spin" style={{ color: 'main' }} size={32} />
                        <Text fontSize="sm" fontWeight="medium" color="gray.500">
                            {t('securing_connection', 'Securing connection...')}
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
                                                    {msg.senderName}
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

                        <HStack p={4} bg="white" borderTop="1px solid" borderColor="gray.100" gap={2}>
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={t('type_message', 'Type a message...')}
                                disabled={!isConnected}
                                borderRadius="full"
                                py={5}
                                px={4}
                                border="1px solid"
                                borderColor="gray.200"
                                _focus={{ borderColor: 'secondary', boxShadow: '0 0 0 1px rgba(77, 201, 230, 0.2)' }}
                                fontSize="sm"
                            />
                            <Button
                                bg="main"
                                color="white"
                                onClick={handleSend}
                                disabled={!isConnected || !input.trim()}
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
                    </>
                )}
            </Flex>
        </Box>
    );
}

